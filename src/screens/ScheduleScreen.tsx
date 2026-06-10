import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { Calendar, Check, MapPin, X } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { listScheduleForRange, setScheduleStatus, type ScheduleEventRow } from '../data/schedule';

const C = {
  bg: '#0A0F1E',
  card: '#1A2235',
  accent: '#CCFF00',
  text: '#E2E8F0',
  neutral: '#94A3B8',
  border: 'rgba(148,163,184,0.12)',
  accentBorder: 'rgba(204,255,0,0.26)',
  accentMuted: 'rgba(204,255,0,0.08)',
  danger: '#FF6B6B',
  success: '#7CFF8A',
};

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const startOfMonth = (date: Date) => {
  const next = startOfDay(date);
  next.setDate(1);
  return next;
};

const endOfMonth = (date: Date) => {
  const next = startOfMonth(date);
  next.setMonth(next.getMonth() + 1);
  return next;
};

const startOfWeek = (date: Date) => {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = (day + 6) % 7;
  next.setDate(next.getDate() - diff);
  return next;
};

const formatMonth = (date: Date) =>
  date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

const formatDayShort = (date: Date) =>
  date.toLocaleDateString(undefined, { weekday: 'short' });

const formatDayNum = (date: Date) =>
  date.toLocaleDateString(undefined, { day: 'numeric' });

const formatEventTime = (startIso: string, endIso: string) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return `${start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const getEventBadge = (event: ScheduleEventRow) => {
  if (event.status === 'confirmed') return { label: 'Confirmed', color: C.success, bg: 'rgba(124,255,138,0.12)' };
  if (event.status === 'declined') return { label: 'Declined', color: C.danger, bg: 'rgba(255,107,107,0.12)' };
  return { label: 'Pending', color: C.accent, bg: C.accentMuted };
};

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

const EventCard = ({
  event,
  onConfirm,
  onDecline,
  onOpen,
}: {
  event: ScheduleEventRow;
  onConfirm: () => void;
  onDecline: () => void;
  onOpen: () => void;
}) => {
  const badge = getEventBadge(event);
  return (
    <View style={s.eventCard}>
      <View style={s.eventHead}>
        <View style={s.flex1}>
          <Text style={s.eventTitle}>{event.title}</Text>
          <Text style={s.eventTime}>{formatEventTime(event.start_time, event.end_time)}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: badge.bg }]}>
          <Text style={[s.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={s.metaRow}>
        <MapPin size={13} color={C.neutral} />
        <Text style={s.metaText}>{event.venue_name || event.details || 'Venue details unavailable'}</Text>
      </View>
      {event.sport ? (
        <View style={s.metaRow}>
          <Calendar size={13} color={C.neutral} />
          <Text style={s.metaText}>{event.sport}</Text>
        </View>
      ) : null}

      {event.status === 'pending' ? (
        <View style={s.actions}>
          <TouchableOpacity style={[s.actionBtn, s.actionBtnSecondary]} onPress={onDecline}>
            <X size={14} color={C.text} />
            <Text style={s.actionText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, s.actionBtnPrimary]} onPress={onConfirm}>
            <Check size={14} color={C.bg} />
            <Text style={[s.actionText, { color: C.bg }]}>Confirm</Text>
          </TouchableOpacity>
        </View>
      ) : event.status === 'confirmed' ? (
        <View style={s.actions}>
          <TouchableOpacity style={[s.actionBtn, s.actionBtnPrimary]} onPress={onOpen}>
            <Text style={[s.actionText, { color: C.bg }]}>Open</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export const ScheduleScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState<ScheduleEventRow[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const loadEvents = async () => {
    const now = new Date();
    const from = startOfMonth(now);
    const to = endOfMonth(now);

    const rows = await listScheduleForRange(from.toISOString(), to.toISOString());
    setEvents(rows);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErrorText(null);
        await loadEvents();
      } catch (e: any) {
        if (mounted) setErrorText(e?.message ?? 'Failed to load schedule.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDay);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDay]);

  const eventsByDay = useMemo(() => {
    return events.reduce<Record<string, ScheduleEventRow[]>>((acc, event) => {
      const key = dayKey(new Date(event.start_time));
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});
  }, [events]);

  const selectedKey = dayKey(selectedDay);
  const selectedEvents = eventsByDay[selectedKey] ?? [];

  const visibleEvents = useMemo(
    () => [...events].sort((a, b) => +new Date(a.start_time) - +new Date(b.start_time)),
    [events],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadEvents();
      setErrorText(null);
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to refresh schedule.');
    } finally {
      setRefreshing(false);
    }
  };

  const updateStatus = async (eventId: string, status: ScheduleEventRow['status']) => {
    try {
      await setScheduleStatus(eventId, status);
      await loadEvents();
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to update event status.');
    }
  };

  const openEventSearch = async (event: ScheduleEventRow) => {
    const query = [event.venue_name, event.venue_address, event.sport, 'booking'].filter(Boolean).join(' ');
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query || event.title)}`;
    await Linking.openURL(searchUrl);
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const event of events) {
      const key = dayKey(new Date(event.start_time));
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [events]);

  return (
    <View style={s.screen}>
      <AppHeader />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.hero}>
          <Text style={s.kicker}>Schedule</Text>
          <Text style={s.title}>{formatMonth(selectedDay)}</Text>
          <Text style={s.subTitle}>
            Only days with actual Supabase events show markers.
          </Text>
        </View>

        <View style={s.weekCard}>
          {weekDays.map(day => {
            const key = dayKey(day);
            const hasEvents = Boolean(counts[key]);
            const active = key === selectedKey;
            return (
              <TouchableOpacity
                key={key}
                style={[s.dayCell, active && s.dayCellActive]}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.85}
              >
                <Text style={[s.dayLabel, active && s.dayLabelActive]}>{formatDayShort(day)}</Text>
                <Text style={[s.dayNum, active && s.dayNumActive]}>{formatDayNum(day)}</Text>
                <View style={[s.dot, hasEvents && s.dotActive]} />
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={s.loadingCard}>
            <ActivityIndicator color={C.accent} />
            <Text style={s.loadingText}>Loading your real schedule…</Text>
          </View>
        ) : null}

        {errorText ? <Text style={s.errorText}>{errorText}</Text> : null}

        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Selected day</Text>
          <Text style={s.sectionCount}>{selectedEvents.length} event{selectedEvents.length === 1 ? '' : 's'}</Text>
        </View>

        {selectedEvents.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>No events on this day</Text>
            <Text style={s.emptyText}>
              Book a session and it will appear here from Supabase.
            </Text>
          </View>
        ) : (
          selectedEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onConfirm={() => updateStatus(event.id, 'confirmed')}
              onDecline={() => updateStatus(event.id, 'declined')}
              onOpen={() => openEventSearch(event)}
            />
          ))
        )}

        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>Upcoming schedule</Text>
          <Text style={s.sectionCount}>{visibleEvents.length}</Text>
        </View>

        {visibleEvents.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyTitle}>No scheduled events yet</Text>
            <Text style={s.emptyText}>
              Once you save a booking, it will show up here automatically.
            </Text>
          </View>
        ) : (
          visibleEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onConfirm={() => updateStatus(event.id, 'confirmed')}
              onDecline={() => updateStatus(event.id, 'declined')}
              onOpen={() => openEventSearch(event)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 16 },
  kicker: { color: C.accent, textTransform: 'uppercase', letterSpacing: 2, fontSize: 12, fontWeight: '800' },
  title: { color: C.text, fontSize: 30, fontWeight: '900', marginTop: 8 },
  subTitle: { color: C.neutral, fontSize: 14, marginTop: 6, lineHeight: 20 },
  weekCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  dayCell: {
    flex: 1,
    marginHorizontal: 3,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  dayCellActive: {
    backgroundColor: C.accentMuted,
    borderWidth: 1,
    borderColor: C.accentBorder,
  },
  dayLabel: { color: C.neutral, fontSize: 11, fontWeight: '700' },
  dayLabelActive: { color: C.accent },
  dayNum: { color: C.text, fontSize: 18, fontWeight: '800', marginTop: 4 },
  dayNumActive: { color: C.text },
  dot: { width: 7, height: 7, borderRadius: 99, marginTop: 8, backgroundColor: 'transparent' },
  dotActive: { backgroundColor: C.accent },
  loadingCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  loadingText: { color: C.neutral, marginTop: 10, fontSize: 13 },
  errorText: { color: C.danger, fontSize: 13, marginHorizontal: 20, marginBottom: 10 },
  sectionHead: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '800' },
  sectionCount: { color: C.neutral, fontSize: 13, fontWeight: '700' },
  flex1: { flex: 1 },
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 14,
  },
  emptyTitle: { color: C.text, fontSize: 16, fontWeight: '800' },
  emptyText: { color: C.neutral, marginTop: 6, lineHeight: 20 },
  eventCard: {
    marginHorizontal: 16,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 12,
  },
  eventHead: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  eventTitle: { color: C.text, fontSize: 17, fontWeight: '800' },
  eventTime: { color: C.neutral, fontSize: 12, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  metaRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 10 },
  metaText: { color: C.text, fontSize: 13, flex: 1 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnSecondary: { backgroundColor: 'rgba(148,163,184,0.10)', borderWidth: 1, borderColor: C.border },
  actionBtnPrimary: { backgroundColor: C.accent },
  actionText: { color: C.text, fontSize: 13, fontWeight: '800' },
  scrollContent: { paddingBottom: 130 },
});
