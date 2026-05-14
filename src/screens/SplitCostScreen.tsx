import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Check, AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../components/AppHeader';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const PlayerSplitRow = ({ initial, name, amount, status, color }: any) => (
  <View style={s.playerRow}>
    <View style={[s.avatar, { backgroundColor: color }]}>
      <Text style={s.avatarText}>{initial}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.playerName}>{name}</Text>
      <Text style={s.playerAmount}>{amount}</Text>
    </View>
    {status === 'Paid' ? (
      <View style={s.paidBadge}>
        <Check size={12} color={C.accent} style={{ marginRight: 4 }} />
        <Text style={s.paidText}>Paid</Text>
      </View>
    ) : (
      <TouchableOpacity style={s.remindBtn}>
        <AlertTriangle size={12} color={C.accentBg} style={{ marginRight: 4 }} />
        <Text style={s.remindText}>Remind</Text>
      </TouchableOpacity>
    )}
  </View>
);

const SplitCard = ({ title, total, perPlayer, players }: any) => (
  <View style={s.splitCard}>
    <View style={s.splitHeader}>
      <Text style={s.splitTitle}>{title}</Text>
      <Text style={s.splitSub}>
        Total: {total} →{' '}
        <Text style={{ color: C.accent, fontWeight: '700' }}>{perPlayer}</Text> per player
      </Text>
    </View>
    {players.map((p: any, i: number) => (
      <PlayerSplitRow key={i} {...p} />
    ))}
  </View>
);

const COLORS = ['#6366F1','#EC4899','#14B8A6','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316'];

export const SplitCostScreen = () => {
  const insets = useSafeAreaInsets();

  const yonexPlayers = [
    { initial: 'A', name: 'Alex', amount: '$4.38', status: 'Paid', color: COLORS[0] },
    { initial: 'S', name: 'Sarah', amount: '$4.38', status: 'Paid', color: COLORS[1] },
    { initial: 'M', name: 'Mike', amount: '$4.38', status: 'Remind', color: COLORS[2] },
    { initial: 'J', name: 'Jin', amount: '$4.38', status: 'Paid', color: COLORS[3] },
    { initial: 'P', name: 'Priya', amount: '$4.38', status: 'Remind', color: COLORS[4] },
    { initial: 'T', name: 'Tom', amount: '$4.38', status: 'Paid', color: COLORS[5] },
    { initial: 'L', name: 'Lena', amount: '$4.38', status: 'Paid', color: COLORS[6] },
    { initial: 'R', name: 'Raj', amount: '$4.38', status: 'Remind', color: COLORS[7] },
  ];

  const courtPlayers = [
    { initial: 'A', name: 'Alex', amount: '$10.00', status: 'Paid', color: COLORS[0] },
    { initial: 'S', name: 'Sarah', amount: '$10.00', status: 'Paid', color: COLORS[1] },
    { initial: 'M', name: 'Mike', amount: '$10.00', status: 'Paid', color: COLORS[2] },
    { initial: 'J', name: 'Jin', amount: '$10.00', status: 'Remind', color: COLORS[3] },
  ];

  return (
    <View style={s.container}>
      <View style={{ paddingTop: insets.top + 10 }}>
        <AppHeader />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <Text style={s.pageTitle}>Cost Splitting</Text>
        <SplitCard title="Yonex AS-30 Shuttle Tube" total="$35.00" perPlayer="$4.38" players={yonexPlayers} />
        <SplitCard title="Court 1 — Thursday 6 PM" total="$40.00" perPlayer="$10.00" players={courtPlayers} />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginHorizontal: 20, marginBottom: 16 },
  splitCard: { backgroundColor: C.card, marginHorizontal: 20, borderRadius: 18, marginBottom: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  splitHeader: { padding: 18, borderBottomWidth: 1, borderBottomColor: C.border },
  splitTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  splitSub: { fontSize: 13, color: C.neutral },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  playerName: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 2 },
  playerAmount: { fontSize: 12, color: C.neutral },
  paidBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentMuted, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: C.accentBorder },
  paidText: { color: C.accent, fontWeight: '700', fontSize: 12 },
  remindBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  remindText: { color: C.accentBg, fontWeight: '700', fontSize: 12 },
});
