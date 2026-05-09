import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Plus, Sparkles, ClipboardList, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LogSessionModal } from '../components/LogSessionModal';
import { AppHeader } from '../components/AppHeader';

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
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (route.params?.openModal) setModalVisible(true);
  }, [route.params]);

  const sessions = [
    { title: 'Badminton Doubles Session', date: 'Mar 14 • 90 min', stars: 4, insight: 'Strong doubles play. Your net game improved 12% over last 5 sessions.' },
    { title: 'Training Class', date: 'Mar 12 • 60 min', stars: 3, insight: 'Consistent performance. Footwork drills paying off.' },
    { title: 'Sunday Singles Match', date: 'Mar 10 • 90 min', stars: 5, insight: 'Peak performance! Your win rate in singles is up 20% this month.' },
    { title: 'Drills & Fitness', date: 'Mar 8 • 60 min', stars: 4, insight: 'Good drill session. Defense reactions getting sharper.' },
  ];

  return (
    <View style={s.container}>
      <View style={{ paddingTop: insets.top + 10 }}>
        <AppHeader />
      </View>

      <View style={s.pageHeader}>
        <Text style={s.pageTitle}>Session Log</Text>
        <TouchableOpacity style={s.logButton} onPress={() => setModalVisible(true)}>
          <Plus size={15} color={C.accentBg} style={{ marginRight: 5 }} />
          <Text style={s.logButtonText}>Log Session</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}>
        {sessions.map((sess, i) => <SessionCard key={i} {...sess} />)}
      </ScrollView>

      <LogSessionModal visible={modalVisible} onClose={() => setModalVisible(false)} onSubmit={() => console.log('Submitted')} />
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
