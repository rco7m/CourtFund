import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Share, Alert, ActivityIndicator } from 'react-native';
import { Star, Activity, Copy, Share2 } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../providers/AuthProvider';
import { getMyProfile, recomputeMyStats } from '../data/profiles';
import { getMyUserStats } from '../data/userStats';
import { listMySessions } from '../data/sessions';
import { listMyExpenses } from '../data/expenses';
import { supabase } from '../lib/supabase';
import { trySetClipboardString } from '../lib/clipboard';
import { requestAccountDeletion } from '../data/account';
import { SUPPORT_EMAIL } from '../constants/support';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
  warn: '#F59E0B', warnMuted: 'rgba(245,158,11,0.1)',
};

const toDayKey = (value: string) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
};

const deriveStatsFromSessions = (sessionRows: any[]) => {
  const sessionsCount = sessionRows.length;
  const hoursTotal = sessionRows.reduce((sum, row) => sum + ((row.duration_minutes ?? 0) / 60), 0);
  const ratings = sessionRows.map(row => row.rating).filter((rating): rating is number => typeof rating === 'number');
  const averageRating = ratings.length ? ratings.reduce((sum, value) => sum + value, 0) / ratings.length : null;

  const daysWithSession = new Set(sessionRows.map(row => toDayKey(row.occurred_at)));
  let streakDays = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!daysWithSession.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daysWithSession.has(cursor.toISOString().slice(0, 10))) {
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    sessions: sessionsCount,
    hours: `${Math.round(hoursTotal * 10) / 10}h`,
    avgRating: averageRating ? averageRating.toFixed(1) : '-',
    streak: `${streakDays}d`,
  };
};

const RecentSession = ({ title, date, stars, isLast }: any) => (
  <View style={[s.recentRow, isLast && s.recentRowLast]}>
    <View>
      <Text style={s.recentTitle}>{title}</Text>
      <Text style={s.recentDate}>{date}</Text>
    </View>
    <View style={s.starsRow}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={13} color={C.accent} fill={n <= stars ? C.accent : 'transparent'} style={n === 1 ? undefined : s.starGap} />
      ))}
    </View>
  </View>
);

const MiniSchedule = ({ items }: { items: any[] }) => (
  <View style={ms.container}>
    {items.length === 0 ? (
      <Text style={ms.noEvent}>No schedule events yet.</Text>
    ) : (
      items.map((item, idx) => (
        <View key={item.id} style={[ms.eventRow, idx === items.length - 1 && ms.eventRowLast]}>
          <View style={ms.eventDot} />
          <Text style={ms.eventText}>{item.title}</Text>
        </View>
      ))
    )}
  </View>
);

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const { signOut } = useAuth();
  const refreshInFlightRef = useRef(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('Player Profile');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ sessions: number; hours: string; avgRating: string; streak: string }>({
    sessions: 0,
    hours: '0h',
    avgRating: '-',
    streak: '0d',
  });
  const [sessions, setSessions] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const loadProfileData = async (showLoader: boolean) => {
        if (refreshInFlightRef.current) return;
        refreshInFlightRef.current = true;
        try {
          if (active && showLoader) setLoading(true);
          recomputeMyStats().catch(error => {
            console.warn('Profile recomputeMyStats failed:', error);
          });
          const { data: userRes } = await supabase.auth.getUser();
          if (active) setMyId(userRes.user?.id ?? null);
          const results = await Promise.allSettled([
            getMyProfile(),
            getMyUserStats(),
            listMySessions(),
            listMyExpenses(50),
            supabase.from('schedule_events').select('id,title,start_time,tag').order('start_time', { ascending: false }),
          ]);
          if (!active) return;

          const [profileResult, statsResult, sessionsResult, expensesResult, scheduleResult] = results;
          const profile = profileResult.status === 'fulfilled' ? profileResult.value : { id: '', email: null, display_name: null, avatar_url: null };
          const sessionRows = sessionsResult.status === 'fulfilled' ? sessionsResult.value : [];
          const statsRow = statsResult.status === 'fulfilled' ? statsResult.value : null;
          const expenseRows = expensesResult.status === 'fulfilled' ? expensesResult.value : [];
          const scheduleRows = scheduleResult.status === 'fulfilled' ? scheduleResult.value : { data: [] };

          const failureMessages = results
            .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
            .map(result => result.reason?.message ?? String(result.reason));

          if (failureMessages.length > 0) {
            console.warn('ProfileScreen partial load failures:', failureMessages);
          }

          const derivedStats = deriveStatsFromSessions(sessionRows);
          setDisplayName(profile.display_name || profile.email || 'Player Profile');
          setStats({
            sessions: derivedStats.sessions || statsRow?.sessions_count || 0,
            hours: derivedStats.sessions ? derivedStats.hours : `${Math.round((statsRow?.hours_total ?? 0) * 10) / 10}h`,
            avgRating: derivedStats.avgRating !== '-' ? derivedStats.avgRating : (statsRow?.avg_rating ? Number(statsRow.avg_rating).toFixed(1) : '-'),
            streak: derivedStats.sessions ? derivedStats.streak : `${statsRow?.streak_days ?? 0}d`,
          });
          setSessions(sessionRows);
          setExpenses(expenseRows);
          setSchedule((scheduleRows.data ?? []).slice(0, 5));
        } catch (error: any) {
          console.warn('ProfileScreen load failed:', error);
        } finally {
          refreshInFlightRef.current = false;
          if (active && showLoader) setLoading(false);
        }
      };

      loadProfileData(true);
      return () => {
        active = false;
      };
    }, [])
  );

  const recentSessions = useMemo(() => sessions.slice(0, 4), [sessions]);

  const monthlyBars = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, idx) => {
      const dt = new Date();
      dt.setDate(1);
      dt.setMonth(dt.getMonth() - (5 - idx));
      return dt;
    });
    return months.map((month, idx) => {
      const count = sessions.filter(sess => {
        const d = new Date(sess.occurred_at);
        return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
      }).length;
      return {
        id: `month-${idx}`,
        month: month.toLocaleDateString(undefined, { month: 'short' }),
        count,
        h: count === 0 ? 14 : Math.min(96, 20 + count * 18),
      };
    });
  }, [sessions]);

  const weeklySummary = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    const weekRows = sessions.filter(sess => new Date(sess.occurred_at) >= start);
    const totalMinutes = weekRows.reduce((sum, row) => sum + (row.duration_minutes ?? 0), 0);
    return {
      sessions: weekRows.length,
      hours: Math.round((totalMinutes / 60) * 10) / 10,
    };
  }, [sessions]);

  const spendRows = useMemo(() => {
    const now = new Date();
    const monthRows = expenses.filter(e => {
      const dt = new Date(e.occurred_at);
      return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth();
    });
    const byType = new Map<string, number>();
    for (const row of monthRows) byType.set(row.type, (byType.get(row.type) ?? 0) + Number(row.amount || 0));
    return Array.from(byType.entries()).map(([label, amount]) => ({ label, amount }));
  }, [expenses]);

  const monthSpend = useMemo(() => spendRows.reduce((acc, row) => acc + row.amount, 0), [spendRows]);

  return (
    <View style={s.container}>
      <AppHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.profileCard}>
          <View style={s.avatarLarge}>
            <Image source={require('../assets/logo.png')} style={s.avatarLogo} resizeMode="contain" />
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{displayName}</Text>
            {myId ? (
              <View style={s.idRow}>
                <Text style={s.idText} numberOfLines={1}>{myId}</Text>
                <View style={s.idActions}>
                  <TouchableOpacity
                    style={s.idIconBtn}
                    onPress={() => {
                      // If clipboard native module isn't linked yet, user can still Share.
                      trySetClipboardString(myId);
                    }}
                    activeOpacity={0.85}
                  >
                    <Copy size={14} color={C.accent} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.idIconBtn}
                    onPress={async () => {
                      await Share.share({
                        message: `SportFund ID: ${myId}`,
                      });
                    }}
                    activeOpacity={0.85}
                  >
                    <Share2 size={14} color={C.accent} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            <Text style={s.profileDesc}>Built from {stats.sessions} logged sessions</Text>
            {myId ? (
              <Text style={s.idHint}>Share this ID so teammates can add you.</Text>
            ) : null}
          </View>
        </View>

        {loading ? (
          <View style={s.loadingCard}>
            <ActivityIndicator color={C.accent} />
            <Text style={s.loadingText}>Loading...</Text>
          </View>
        ) : null}

        <View style={s.statsGrid}>
          {[
            { value: String(stats.sessions), label: 'SESSIONS' },
            { value: stats.hours, label: 'HOURS' },
            { value: stats.avgRating, label: 'AVG RATING' },
            { value: stats.streak, label: 'STREAK' },
          ].map(c => (
            <View key={c.label} style={s.statCard}>
              <Text style={s.statValue}>{c.value}</Text>
              <Text style={s.statLabel}>{c.label}</Text>
            </View>
          ))}
        </View>

        <Text style={s.sectionTitle}>SESSIONS PER MONTH</Text>
        <View style={s.card}>
          {sessions.length === 0 ? (
            <Text style={s.emptyText}>Log a session to start your monthly trend.</Text>
          ) : (
            <View style={s.chartContainer}>
              {monthlyBars.map(b => (
                <View key={b.id} style={s.barWrapper}>
                  <Text style={s.barValue}>{b.count}</Text>
                  <View style={[s.barFill, { height: b.h, backgroundColor: b.count > 0 ? C.accent : 'rgba(148,163,184,0.18)' }]} />
                  <Text style={s.barLabel}>{b.month}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.injuryCard}>
          <View style={s.injuryStripe} />
          <View style={s.injuryInner}>
            <View style={s.injuryIcon}><Activity size={18} color={C.warn} /></View>
            <View style={s.injuryTextWrap}>
              <Text style={s.injuryTitle}>Weekly activity</Text>
              <Text style={s.injuryDesc}>
                {weeklySummary.sessions === 0
                  ? 'No sessions logged in the last 7 days.'
                  : `${weeklySummary.sessions} sessions logged over ${weeklySummary.hours}h in the last 7 days.`}
              </Text>
            </View>
          </View>
        </View>

        <Text style={s.sectionTitle}>MY SCHEDULE</Text>
        <View style={s.scheduleCard}>
          <MiniSchedule items={schedule} />
        </View>

        <Text style={s.sectionTitle}>RECENT SESSIONS</Text>
        <View style={s.listCard}>
          {recentSessions.length === 0 ? (
            <Text style={s.emptyText}>No sessions yet.</Text>
          ) : (
            recentSessions.map((sess, idx) => {
              const d = new Date(sess.occurred_at);
              const dateLabel = `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${sess.duration_minutes} min`;
              return (
                <RecentSession
                  key={sess.id}
                  title={sess.title}
                  date={dateLabel}
                  stars={sess.rating ?? 0}
                  isLast={idx === recentSessions.length - 1}
                />
              );
            })
          )}
        </View>

        <Text style={s.sectionTitle}>SPENDING THIS MONTH</Text>
        <View style={s.spendCard}>
          <View style={s.spendBody}>
            {spendRows.length === 0 ? (
              <Text style={s.emptyText}>No spending this month.</Text>
            ) : (
              spendRows.map(row => (
                <View key={row.label} style={s.spendRow}>
                  <View style={s.spendDot} />
                  <Text style={s.spendLabel}>{row.label}</Text>
                  <Text style={s.spendAmount}>${row.amount.toFixed(2)}</Text>
                </View>
              ))
            )}
          </View>
          <View style={s.totalBox}>
            <Text style={s.totalValue}>${monthSpend.toFixed(2)}</Text>
            <Text style={s.totalLabel}>Total</Text>
          </View>
        </View>

        <View style={s.supportCard}>
          <Text style={s.supportTitle}>Support</Text>
          <Text style={s.supportText}>For account, billing, or app help, contact {SUPPORT_EMAIL}</Text>
        </View>

        <TouchableOpacity
          style={s.deleteCta}
          onPress={() => {
            Alert.alert(
              'Delete account?',
              `This will request account deletion. Your data may be removed and cannot be recovered. For help, contact ${SUPPORT_EMAIL}.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    await requestAccountDeletion();
                    await signOut();
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                  },
                },
              ],
            );
          }}
        >
          <Text style={s.deleteCtaText}>Delete account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.signOutCta}
          onPress={() => {
            Alert.alert(
              'Sign out?',
              'You will need to sign in again to access your data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign out',
                  style: 'destructive',
                  onPress: async () => {
                    await signOut();
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                  },
                },
              ],
            );
          }}
        >
          <Text style={s.signOutCtaText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const ms = StyleSheet.create({
  container: { padding: 16 },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.08)' },
  eventRowLast: { borderBottomWidth: 0 },
  eventDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CCFF00', marginRight: 10 },
  eventText: { color: '#E2E8F0', fontSize: 13 },
  noEvent: { color: '#94A3B8', fontSize: 13, paddingVertical: 10 },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 110 },
  profileCard: { backgroundColor: C.card, marginHorizontal: 20, marginBottom: 16, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  avatarLarge: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  avatarLogo: { width: 36, height: 36, borderRadius: 8 },
  profileInfo: { flex: 1 },
  profileName: { color: C.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  profileDesc: { color: C.neutral, fontSize: 12 },
  idRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 10 },
  idText: { flex: 1, color: C.neutral, fontSize: 11 },
  idActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  idIconBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.accentMuted, borderWidth: 1, borderColor: C.accentBorder, alignItems: 'center', justifyContent: 'center' },
  idHint: { color: C.neutral, fontSize: 11, marginTop: 6 },
  loadingCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { color: C.neutral, fontSize: 13, fontWeight: '600' },
  deleteCta: { marginHorizontal: 20, marginTop: 12, backgroundColor: 'rgba(255,107,107,0.10)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.35)', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  deleteCtaText: { color: '#FF6B6B', fontSize: 14, fontWeight: '800' },
  signOutCta: { marginHorizontal: 20, marginTop: 12, backgroundColor: 'rgba(148,163,184,0.10)', borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  signOutCtaText: { color: C.text, fontSize: 14, fontWeight: '800' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 18, justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: C.card, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  statValue: { fontSize: 24, fontWeight: '800', color: C.accent, marginBottom: 4 },
  statLabel: { fontSize: 11, color: C.neutral, fontWeight: '700', letterSpacing: 1 },
  sectionTitle: { fontSize: 11, color: C.neutral, fontWeight: '700', letterSpacing: 1.5, marginHorizontal: 20, marginTop: 8, marginBottom: 12 },
  card: { backgroundColor: C.card, marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 8, padding: 16 },
  scheduleCard: { backgroundColor: C.card, marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 8, padding: 0 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 },
  barWrapper: { alignItems: 'center', width: 40, justifyContent: 'flex-end' },
  barValue: { color: C.text, fontSize: 11, fontWeight: '700', marginBottom: 6 },
  barFill: { width: 20, borderRadius: 10, marginBottom: 8 },
  barLabel: { color: C.neutral, fontSize: 10 },
  injuryCard: { flexDirection: 'row', backgroundColor: C.card, marginHorizontal: 20, marginBottom: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  injuryStripe: { width: 4, backgroundColor: C.warn },
  injuryInner: { flex: 1, padding: 16, flexDirection: 'row', alignItems: 'center' },
  injuryIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.warnMuted, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  injuryTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 3 },
  injuryDesc: { fontSize: 12, color: C.neutral, lineHeight: 17 },
  listCard: { backgroundColor: C.card, marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 8 },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.border },
  recentRowLast: { borderBottomWidth: 0 },
  recentTitle: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 3 },
  recentDate: { fontSize: 12, color: C.neutral },
  starsRow: { flexDirection: 'row' },
  starGap: { marginLeft: 2 },
  injuryTextWrap: { flex: 1 },
  spendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 20, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 20 },
  spendBody: { flex: 1 },
  spendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  spendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10, backgroundColor: C.accent },
  spendLabel: { flex: 1, fontSize: 13, color: C.neutral },
  spendAmount: { fontSize: 13, fontWeight: '600', color: C.text },
  totalBox: { alignItems: 'flex-end', marginLeft: 20 },
  totalValue: { fontSize: 22, fontWeight: '800', color: C.accent, marginBottom: 2 },
  totalLabel: { fontSize: 11, color: C.neutral },
  supportCard: { marginHorizontal: 20, marginBottom: 8, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 },
  supportTitle: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  supportText: { color: C.neutral, fontSize: 12, lineHeight: 18 },
  emptyText: { color: C.neutral, fontSize: 13 },
});
