import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, KeyboardAvoidingView, Platform, ActivityIndicator, Linking, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle, Flag, MapPin, Calendar, Clock,
  ChevronDown, X, Check, LocateFixed, DollarSign,
} from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { createScheduleEvent } from '../data/schedule';
import { createExpense } from '../data/expenses';
import { minutesFromDurationLabel } from '../lib/datetime';
import { listMyFriendProfiles, type FriendListItem } from '../data/friends';
import { supabase } from '../lib/supabase';
import MapView, { Marker, Region } from 'react-native-maps';
import { checkLocationPermission, getCurrentLocation, requestLocationPermission } from '../services/locationService';
import { searchNearbySportsPlaces } from '../services/overpassService';
import { saveSelectedVenue } from '../storage/venueStorage';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const C = {
  bg: '#0A0F1E', card: '#1A2235', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.3)',
};

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball', 'Volleyball', 'Pickleball', 'Table Tennis'] as const;
const DURATIONS = ['1 Hour', '1.5 Hours', '2 Hours', '2.5 Hours', '3 Hours'];

type Venue = {
  id: string;
  name: string;
  distanceKm: number;
  lat: number;
  lon: number;
  address: string;
  sport: string;
  rating: number | null;
  bookingUrl: string | null;
  website: string | null;
  phone: string | null;
  openNow: boolean | null;
  costLevel: number;
  estimatedCost: number | null;
};

type VenueResultState = {
  venues: Venue[];
  selected: Venue | null;
};

const haversineKm = (aLat: number, aLon: number, bLat: number, bLon: number) => {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const formatMeters = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

const formatDate = (value: Date) =>
  value.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

const formatTime = (value: Date) =>
  value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const parseEstimatedCostFromTags = (tags: Record<string, any>): number | null => {
  const keys = [
    'fee',
    'charge',
    'price',
    'cost',
    'fee:hour',
    'fee:hourly',
    'fee:per_hour',
    'fee_per_hour',
    'charge:hour',
  ];
  for (const key of keys) {
    const raw = tags?.[key];
    if (raw == null) continue;
    const text = String(raw);
    const match = text.match(/(-?\\d+(\\.\\d+)?)/);
    if (!match) continue;
    const value = Number(match[1]);
    if (Number.isFinite(value) && value >= 0) return value;
  }
  return null;
};

const clampToFuture = (value: Date) => {
  const now = new Date();
  return value.getTime() < now.getTime() ? now : value;
};

const VenueCard = ({ venue, active, onPress }: any) => (
  <View style={[s.venueCard, active && s.venueCardActive]}>
    <TouchableOpacity style={s.venueCardBody} onPress={onPress} activeOpacity={0.9}>
      <View style={s.venueTopRow}>
        <View style={s.venueImageBox}>
          <Text style={s.venueImageText}>{venue.name.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={s.flex1}>
          <Text style={s.venueName}>{venue.name}</Text>
          <Text style={s.venueMeta}>{formatMeters(venue.distanceKm)} away</Text>
        </View>
        <Text style={s.ratingText}>{venue.rating ? `${venue.rating.toFixed(1)}★` : 'New'}</Text>
      </View>
      <Text style={s.venueAddress} numberOfLines={2}>{venue.address || 'Address unavailable'}</Text>
    </TouchableOpacity>
    <View style={s.venueFooter}>
      <Text style={s.venueSport}>{venue.sport}</Text>
    </View>
  </View>
);

const OrganizeModal = ({ visible, onClose }: any) => {
  const insets = useSafeAreaInsets();
  const [sport, setSport] = useState<(typeof SPORTS)[number]>('Badminton');
  const [bookingDateTime, setBookingDateTime] = useState(new Date());
  const [duration, setDuration] = useState('1.5 Hours');
  const [showSports, setShowSports] = useState(false);
  const [showDurations, setShowDurations] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [venueState, setVenueState] = useState<VenueResultState>({ venues: [], selected: null });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showLocationGate, setShowLocationGate] = useState(true);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unavailable' | 'denied' | 'blocked' | 'limited' | 'granted'>('denied');

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: bookingDateTime,
        mode: 'date',
        minimumDate: new Date(),
        onChange: (_event, selectedDate) => {
          if (!selectedDate) return;
          setBookingDateTime(prev => clampToFuture(new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            prev.getHours(),
            prev.getMinutes(),
            0,
            0,
          )));
        },
      });
      return;
    }
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: bookingDateTime,
        mode: 'time',
        is24Hour: true,
        onChange: (_event, selectedTime) => {
          if (!selectedTime) return;
          setBookingDateTime(prev => clampToFuture(new Date(
            prev.getFullYear(),
            prev.getMonth(),
            prev.getDate(),
            selectedTime.getHours(),
            selectedTime.getMinutes(),
            0,
            0,
          )));
        },
      });
      return;
    }
    setShowTimePicker(true);
  };

  useEffect(() => {
    if (!visible) return;
    let mounted = true;
    setErrorText(null);
    setErrorText(null);
    setVenueState({ venues: [], selected: null });
    setLoadingFriends(true);
    listMyFriendProfiles()
      .then(rows => {
        if (mounted) setFriends(rows);
      })
      .catch(() => {
        if (mounted) setFriends([]);
      })
      .finally(() => {
        if (mounted) setLoadingFriends(false);
      });

    (async () => {
      try {
        const status = await checkLocationPermission();
        if (!mounted) return;
        setPermissionStatus(status);
        if (status === 'granted' || status === 'limited') {
          setShowLocationGate(false);
          try {
            const coords = await getCurrentLocation();
            if (!mounted) return;
            setLocation(coords);
          } catch {
            // If location services are off, keep the search gated by lack of coords.
            setLocation(null);
          }
        } else {
          setShowLocationGate(true);
        }
      } catch {
        if (!mounted) return;
        setPermissionStatus('unavailable');
        setShowLocationGate(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [visible]);

  const requestLocation = async () => {
    try {
      setErrorText(null);
      setRequestingLocation(true);
      const next = await requestLocationPermission();
      setPermissionStatus(next);
      if (next !== 'granted' && next !== 'limited') {
        throw new Error('Location permission denied');
      }
      setShowLocationGate(false);
      const coords = await getCurrentLocation();
      setLocation(coords);
    } catch (e: any) {
      const msg = String(e?.message ?? '');
      if (msg.toLowerCase().includes('denied')) {
        setErrorText('Location permission denied. You can enable it in Settings and try again.');
      } else if (msg.toLowerCase().includes('disabled')) {
        setErrorText('Location Services are disabled. Turn them on in Settings and try again.');
      } else {
        setErrorText(e?.message ?? 'Location permission is required to find nearby venues.');
      }
    } finally {
      setRequestingLocation(false);
    }
  };

  const selectedFriends = useMemo(
    () => friends.filter(f => selectedFriendIds.includes(f.id)),
    [friends, selectedFriendIds]
  );

  const searchVenues = async () => {
    setErrorText(null);
    if (!location) {
      setShowLocationGate(true);
      return;
    }

    try {
      setSaving(true);
      const json = await searchNearbySportsPlaces(location.latitude, location.longitude, sport);
      const venues = (json ?? [])
        .map((el: any, idx: number) => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          if (!lat || !lon) return null;
          const tags = el.tags ?? {};
          const name = tags.name || `${sport} Venue ${idx + 1}`;
          const distKm = haversineKm(location.latitude, location.longitude, lat, lon);
          const estimatedCost = parseEstimatedCostFromTags(tags);
          return {
            id: `${el.type}-${el.id}`,
            name,
            distanceKm: distKm,
            lat,
            lon,
            address: [tags['addr:street'], tags['addr:city'], tags['addr:suburb']].filter(Boolean).join(', '),
            sport,
            rating: tags.rating ? Number(tags.rating) : null,
            bookingUrl: tags.website || tags.url || null,
            website: tags.website || null,
            phone: tags.phone || null,
            openNow: tags.opening_hours ? true : null,
            costLevel: tags.price_level ? Number(tags.price_level) : 2,
            estimatedCost,
          } as Venue;
        })
        .filter(Boolean)
        .sort((a: Venue, b: Venue) => a.distanceKm - b.distanceKm)
        .slice(0, 8);
      setVenueState({ venues, selected: venues[0] ?? null });
      if (!venues.length) setErrorText('No nearby venues found. Try a different sport or move location.');
    } catch (e: any) {
      const status = Number(e?.response?.status ?? e?.status ?? 0);
      const message = String(e?.message ?? '');
      if (status === 504 || message.includes('504') || message.toLowerCase().includes('timeout')) {
        setErrorText('Slow down bro, you are getting too fast. Give it a moment and try again.');
      } else {
        setErrorText(e?.message ?? 'Failed to fetch nearby venues.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!venueState.selected) {
      setErrorText('Pick a venue first.');
      return;
    }
    try {
      setSaving(true);
      const durationMinutes = minutesFromDurationLabel(duration);
      const startDate = bookingDateTime;
      const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);
      const v: Venue = venueState.selected;

      const event = await createScheduleEvent({
        title: `${sport} at ${v.name}`,
        tag: 'session',
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        details: `${v.address || 'Nearby venue'}${selectedFriends.length ? ` • Invited ${selectedFriends.length} friend(s)` : ''}`,
      });

      await supabase.from('schedule_events').update({
        sport,
        venue_name: v.name,
        venue_address: v.address || null,
        venue_latitude: v.lat,
        venue_longitude: v.lon,
        booking_url: v.bookingUrl || v.website || null,
        player_count: selectedFriends.length + 1,
        invited_friend_ids: selectedFriendIds,
      }).eq('id', event.id);
      await saveSelectedVenue({
        ...v,
        sport,
        scheduled_for: startDate.toISOString(),
        friends: selectedFriends,
      });

      const totalCost = v.estimatedCost || 20; // Fallback estimate
      const splitCost = totalCost / (selectedFriends.length + 1);
      await createExpense({
        type: 'booking',
        amount: splitCost,
        note: `Booking ${sport} at ${v.name}`
      });

      const query = [v.name, v.address, sport, 'booking'].filter(Boolean).join(' ');
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      await Linking.openURL(searchUrl);
      onClose();
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to save session.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView style={om.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[om.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={om.backBtn} onPress={onClose}>
            <X size={18} color={C.neutral} />
          </TouchableOpacity>
          <Text style={om.title}>Organize Session</Text>
          <View style={om.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={om.modalScroll}>
          {showLocationGate && (
            <View style={om.permissionCard}>
              <Text style={om.permissionTitle}>Allow location access</Text>
              <Text style={om.permissionText}>
                SportFund uses your location to find nearby sports venues and booking links.
              </Text>
              <View style={om.permissionActions}>
                <TouchableOpacity
                  style={om.permissionSecondary}
                  onPress={async () => {
                    if (permissionStatus === 'blocked' || (errorText && errorText.toLowerCase().includes('settings'))) {
                      await Linking.openSettings();
                      return;
                    }
                    onClose();
                  }}
                >
                  <Text style={om.permissionSecondaryText}>
                    {permissionStatus === 'blocked' || (errorText && errorText.toLowerCase().includes('settings')) ? 'Open Settings' : 'Don\'t allow'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={om.permissionPrimary} onPress={requestLocation} disabled={requestingLocation}>
                  {requestingLocation ? <ActivityIndicator color={C.accentBg} /> : <Text style={om.permissionPrimaryText}>Allow</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={om.sectionLabel}>SPORT</Text>
          <TouchableOpacity style={om.picker} onPress={() => setShowSports(v => !v)}>
            <Flag size={15} color={C.accent} style={om.pickerIcon} />
            <Text style={om.pickerText}>{sport}</Text>
            <ChevronDown size={15} color={C.neutral} />
          </TouchableOpacity>
          {showSports && (
            <View style={om.dropdown}>
              {SPORTS.map(item => (
                <TouchableOpacity key={item} style={om.dropdownItem} onPress={() => { setSport(item); setShowSports(false); }}>
                  <Text style={[om.dropdownText, sport === item && { color: C.accent }]}>{item}</Text>
                  {sport === item && <Check size={14} color={C.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={om.sectionLabel}>VENUE SEARCH</Text>
          <TouchableOpacity
            style={om.searchBtn}
            onPress={() => {
              if (!location) {
                setShowLocationGate(true);
                return;
              }
              searchVenues();
            }}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color={C.accentBg} /> : <LocateFixed size={15} color={C.accentBg} />}
            <Text style={om.searchBtnText}>Find nearby venues</Text>
          </TouchableOpacity>

          {errorText ? <Text style={om.errorText}>{errorText}</Text> : null}

          {venueState.venues.length > 0 && (
            <>
              <Text style={om.sectionLabel}>NEARBY VENUES</Text>
              {venueState.venues.map((venue: Venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  active={venueState.selected?.id === venue.id}
                  onPress={() => setVenueState(prev => ({ ...prev, selected: venue }))}
                />
              ))}
            </>
          )}

          {venueState.selected && (
            <View style={om.previewCard}>
              <Text style={om.previewLabel}>VENUE DETAILS</Text>
              <Text style={om.previewTitle}>{venueState.selected.name}</Text>
              <Text style={om.previewDetail}><MapPin size={12} color={C.neutral} /> {venueState.selected.address || 'Address unavailable'}</Text>
              <Text style={om.previewDetail}>
                <DollarSign size={12} color={C.neutral} /> Booking cost varies by provider.
              </Text>
            </View>
          )}

          {location && venueState.venues.length > 0 && (
            <View style={om.mapCard}>
              <MapView
                style={om.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                } as Region}
              >
                <Marker coordinate={location} title="Your location" pinColor="#CCFF00" />
                {venueState.venues.map((venue: Venue) => (
                  <Marker
                    key={venue.id}
                    coordinate={{ latitude: venue.lat, longitude: venue.lon }}
                    title={venue.name}
                    description={venue.address}
                    pinColor={venueState.selected?.id === venue.id ? '#CCFF00' : '#94A3B8'}
                  />
                ))}
              </MapView>
            </View>
          )}

          <Text style={om.sectionLabel}>DATE & TIME</Text>
          <View style={om.row}>
            <View style={om.flex1}>
              <TouchableOpacity style={om.picker} onPress={openDatePicker}>
                <Calendar size={15} color={C.accent} style={om.pickerIcon} />
                <Text style={om.pickerText}>{formatDate(bookingDateTime)}</Text>
              </TouchableOpacity>
            </View>
            <View style={om.flex1}>
              <TouchableOpacity style={om.picker} onPress={openTimePicker}>
                <Clock size={15} color={C.accent} style={om.pickerIcon} />
                <Text style={om.pickerText}>{formatTime(bookingDateTime)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {(showDatePicker || showTimePicker) && Platform.OS === 'ios' ? (
            <Pressable
              style={om.pickerOverlay}
              onPress={() => {
                setShowDatePicker(false);
                setShowTimePicker(false);
              }}
            >
              <Pressable style={om.pickerSheet} onPress={() => {}}>
                {showDatePicker ? (
                  <DateTimePicker
                    style={om.pickerControlDate}
                    value={bookingDateTime}
                    mode="date"
                    display="inline"
                    themeVariant="dark"
                    minimumDate={new Date()}
                    onChange={(_event, selectedDate) => {
                      if (selectedDate) {
                        setBookingDateTime(prev => clampToFuture(new Date(
                          selectedDate.getFullYear(),
                          selectedDate.getMonth(),
                          selectedDate.getDate(),
                          prev.getHours(),
                          prev.getMinutes(),
                          0,
                          0,
                        )));
                      }
                    }}
                  />
                ) : null}
                {showTimePicker ? (
                  <DateTimePicker
                    style={om.pickerControlTime}
                    value={bookingDateTime}
                    mode="time"
                    display="spinner"
                    themeVariant="dark"
                    is24Hour
                    onChange={(_event, selectedTime) => {
                      if (selectedTime) {
                        setBookingDateTime(prev => clampToFuture(new Date(
                          prev.getFullYear(),
                          prev.getMonth(),
                          prev.getDate(),
                          selectedTime.getHours(),
                          selectedTime.getMinutes(),
                          0,
                          0,
                        )));
                      }
                    }}
                  />
                ) : null}
              </Pressable>
            </Pressable>
          ) : null}

          <Text style={om.sectionLabel}>DURATION</Text>
          <TouchableOpacity style={om.picker} onPress={() => setShowDurations(v => !v)}>
            <Text style={om.pickerText}>{duration}</Text>
            <ChevronDown size={15} color={C.neutral} />
          </TouchableOpacity>
          {showDurations && (
            <View style={om.dropdown}>
              {DURATIONS.map(d => (
                <TouchableOpacity key={d} style={om.dropdownItem} onPress={() => { setDuration(d); setShowDurations(false); }}>
                  <Text style={[om.dropdownText, duration === d && { color: C.accent }]}>{d}</Text>
                  {duration === d && <Check size={14} color={C.accent} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={om.sectionLabel}>INVITE FRIENDS</Text>
          <View style={om.friendsCard}>
            {loadingFriends ? (
              <View style={om.loadingRow}>
                <ActivityIndicator color={C.accent} />
                <Text style={om.loadingText}>Loading friends…</Text>
              </View>
            ) : friends.length === 0 ? (
              <Text style={om.emptyFriends}>No friends yet. Add them in Friends first.</Text>
            ) : (
              friends.map(friend => {
                const selected = selectedFriendIds.includes(friend.id);
                return (
                  <TouchableOpacity
                    key={friend.id}
                    style={[om.friendRow, selected && om.friendRowActive]}
                    onPress={() => setSelectedFriendIds(prev => prev.includes(friend.id) ? prev.filter(id => id !== friend.id) : [...prev, friend.id])}
                  >
                    <View style={om.friendAvatar}><Text style={om.friendAvatarText}>{friend.initial}</Text></View>
                    <Text style={om.friendName}>{friend.name}</Text>
                    <View style={[om.friendCheck, selected && om.friendCheckActive]}>
                      {selected && <Check size={12} color={C.accentBg} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <TouchableOpacity style={om.saveBtn} onPress={handleSave} disabled={saving}>
            <CheckCircle size={16} color={C.accentBg} style={om.saveIcon} />
            <Text style={om.saveBtnText}>{saving ? 'SAVING…' : 'BOOK NOW & SAVE SESSION'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const BookScreen = () => {
  const [showOrganize, setShowOrganize] = useState(false);

  return (
    <View style={s.container}>
      <AppHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.pageScroll}>
        <View style={s.heroSection}>
          <Text style={s.heroTitle}>Book your next session</Text>
          <Text style={s.heroSub}>Use your live location to find nearby courts, invite teammates, and save the booking to Schedule.</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardLabel}>HOW IT WORKS</Text>
          <Text style={s.cardText}>
            1. Grant location permission. 2. Search by sport. 3. Pick a nearby venue. 4. Invite friends. 5. Save the session and open the venue site.
          </Text>
        </View>

        <TouchableOpacity style={s.primaryBtn} onPress={() => setShowOrganize(true)}>
          <Text style={s.primaryBtnText}>Book Now</Text>
        </TouchableOpacity>
      </ScrollView>

      <OrganizeModal visible={showOrganize} onClose={() => setShowOrganize(false)} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { paddingBottom: 120 },
  heroSection: { paddingHorizontal: 20, paddingVertical: 18 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: C.text, marginBottom: 8 },
  heroSub: { fontSize: 14, color: C.neutral, lineHeight: 21 },
  card: { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  cardLabel: { fontSize: 11, fontWeight: '700', color: C.neutral, letterSpacing: 1.2, marginBottom: 8 },
  cardText: { color: C.text, fontSize: 14, lineHeight: 21 },
  primaryBtn: { marginHorizontal: 20, backgroundColor: C.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { color: C.accentBg, fontSize: 16, fontWeight: '800' },
  modalRoot: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  headerSpacer: { width: 36 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  title: { color: C.text, fontSize: 17, fontWeight: '800' },
  modalScroll: { paddingBottom: 40 },
  permissionCard: { marginHorizontal: 20, marginBottom: 12, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 },
  permissionTitle: { color: C.text, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  permissionText: { color: C.neutral, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  permissionActions: { flexDirection: 'row', gap: 10 },
  permissionSecondary: { flex: 1, height: 46, borderRadius: 14, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  permissionSecondaryText: { color: C.text, fontWeight: '700' },
  permissionPrimary: { flex: 1, height: 46, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  permissionPrimaryText: { color: C.accentBg, fontWeight: '800' },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: C.neutral, letterSpacing: 1.4, marginHorizontal: 20, marginTop: 14, marginBottom: 8 },
  picker: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 14, height: 52, borderWidth: 1, borderColor: C.border },
  pickerIcon: { marginRight: 10 },
  pickerText: { flex: 1, color: C.text, fontSize: 15, fontWeight: '600' },
  dropdown: { marginHorizontal: 20, marginTop: 8, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: C.border },
  dropdownText: { color: C.text, fontSize: 14 },
  searchBtn: { marginHorizontal: 20, backgroundColor: C.accent, borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  searchBtnText: { color: C.accentBg, fontWeight: '800', fontSize: 15, marginLeft: 8 },
  errorText: { marginHorizontal: 20, marginTop: 10, color: '#F87171', fontWeight: '700', fontSize: 13 },
  venueCard: { marginHorizontal: 20, marginTop: 10, backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  venueCardActive: { borderColor: C.accent, backgroundColor: 'rgba(204,255,0,0.03)' },
  venueCardBody: { flex: 1 },
  venueTopRow: { flexDirection: 'row', alignItems: 'center' },
  venueImageBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.accentMuted, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: C.accentBorder },
  venueImageText: { color: C.accent, fontSize: 16, fontWeight: '800' },
  venueName: { color: C.text, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  venueMeta: { color: C.neutral, fontSize: 12 },
  ratingText: { color: C.accent, fontWeight: '800', fontSize: 13 },
  venueAddress: { color: C.neutral, fontSize: 13, lineHeight: 19, marginTop: 10 },
  venueFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  venueSport: { color: C.text, fontSize: 12, fontWeight: '700' },
  previewCard: { marginHorizontal: 20, marginTop: 12, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14 },
  previewLabel: { color: C.neutral, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 8 },
  previewTitle: { color: C.text, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  previewDetail: { color: C.neutral, fontSize: 13, marginBottom: 6 },
  mapCard: { marginHorizontal: 20, marginTop: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  map: { width: '100%', height: 220 },
  row: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  flex1: { flex: 1 },
  pickerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', zIndex: 50 },
  pickerSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  pickerControlDate: { alignSelf: 'stretch', height: 380 },
  pickerControlTime: { alignSelf: 'stretch', height: 220 },
  friendsCard: { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  friendRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  friendRowActive: { backgroundColor: 'rgba(204,255,0,0.03)' },
  friendAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.accentMuted, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 1, borderColor: C.accentBorder },
  friendAvatarText: { color: C.accent, fontWeight: '800', fontSize: 12 },
  friendName: { flex: 1, color: C.text, fontSize: 14, fontWeight: '600' },
  friendCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: C.neutral, alignItems: 'center', justifyContent: 'center' },
  friendCheckActive: { backgroundColor: C.accent, borderColor: C.accent },
  loadingRow: { padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.neutral, fontSize: 13, marginLeft: 8 },
  emptyFriends: { color: C.neutral, fontSize: 13, padding: 14, textAlign: 'center' },
  saveBtn: { marginHorizontal: 20, marginTop: 16, backgroundColor: C.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  saveIcon: { marginRight: 8 },
  saveBtnText: { color: C.accentBg, fontSize: 15, fontWeight: '800' },
});

const om = s;
