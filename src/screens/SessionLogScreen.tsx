import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Plus, Sparkles, ClipboardList, Star } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LogSessionModal } from '../components/LogSessionModal';
import { AppHeader } from '../components/AppHeader';
import { createSession, listMySessions } from '../data/sessions';
import { minutesFromDurationLabel } from '../lib/datetime';
import { recomputeMyStats } from '../data/profiles';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const SessionCard = ({ title, date, stars, insight }: any) => (
  <View style={s.sessionCard}>
    <View style={s.sessionHeader}>
      <View style={s.sessionTitleRow}>
        <View style={s.sessionIcon}><ClipboardList color={C.accent} size={15} /></View>
        <View>
          <Text style={s.sessionTitle}>{title}</Text>
          <Text style={s.sessionDate}>{date}</Text>
        </View>
      </View>
      <View style={s.starsRow}>
        {[1,2,3,4,5].map(n => (
          <Star key={n} size={13} color={C.accent} fill={n <= stars ? C.accent : 'transparent'} style={{ marginLeft: 2 }} />
        ))}
      </View>
    </View>
    <View style={s.insightBox}>
      <View style={s.insightHeader}>
        <Sparkles color={C.accent} size={11} style={{ marginRight: 5 }} />
        <Text style={s.insightLabel}>AI INSIGHT</Text>
      </View>
      <Text style={s.insightText}>{insight}</Text>
    </View>
  </View>
);

export const SessionLogScreen = () => {
  const route = useRoute<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    if (route.params?.openModal) setModalVisible(true);
  }, [route.params]);

  const load = async () => {
    try {
      setErrorText(null);
      setLoading(true);
      const rows = await listMySessions();
      setSessions(rows);
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={s.container}>
      <AppHeader />

      <View style={s.pageHeader}>
        <Text style={s.pageTitle}>Session Log</Text>
        <TouchableOpacity style={s.logButton} onPress={() => setModalVisible(true)}>
          <Plus size={15} color={C.accentBg} style={{ marginRight: 5 }} />
          <Text style={s.logButtonText}>Log Session</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}>
        {loading ? (
          <Text style={{ color: C.neutral }}>Loading…</Text>
        ) : errorText ? (
          <Text style={{ color: '#F87171', fontWeight: '700' }}>{errorText}</Text>
        ) : sessions.length === 0 ? (
          <Text style={{ color: C.neutral }}>No sessions yet. Log one.</Text>
        ) : (
          sessions.map((sess: any) => {
            const d = new Date(sess.occurred_at);
            const dateLabel = `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${sess.duration_minutes} min`;
            return (
              <SessionCard
                key={sess.id}
                title={sess.title}
                date={dateLabel}
                stars={sess.rating ?? 0}
                insight={sess.notes ?? 'Logged session.'}
              />
            );
          })
        )}
      </ScrollView>

      <LogSessionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={async data => {
          const durationMinutes = data.durationLabel ? minutesFromDurationLabel(data.durationLabel) : 60;
          const title = data.playType ? `${data.playType} Session` : 'Court Session';
          await createSession({
            title,
            duration_minutes: durationMinutes,
            rating: data.rating || null,
            notes: data.level ? `Level: ${data.level}` : null,
            insight: 'Session saved to Supabase.',
          });
          await recomputeMyStats();
          await load();
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginBottom: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: C.text },
  logButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  logButtonText: { color: C.accentBg, fontWeight: '700', fontSize: 13 },
  sessionCard: { backgroundColor: C.card, padding: 18, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  sessionTitleRow: { flexDirection: 'row', alignItems: 'flex-start' },
  sessionIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.accentMuted, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: C.accentBorder },
  sessionTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 3 },
  sessionDate: { fontSize: 12, color: C.neutral },
  starsRow: { flexDirection: 'row' },
  insightBox: { backgroundColor: C.accentMuted, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.accentBorder },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  insightLabel: { fontSize: 10, fontWeight: '700', color: C.accent, letterSpacing: 1 },
  insightText: { fontSize: 12, color: C.neutral, lineHeight: 18 },
});
