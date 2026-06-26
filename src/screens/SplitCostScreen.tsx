import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Check, AlertTriangle } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { listMyFriendProfiles, type FriendListItem } from '../data/friends';
import { listMyGear } from '../data/gear';
import { listMyExpenses } from '../data/expenses';
import { supabase } from '../lib/supabase';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const COLORS = ['#6366F1', '#EC4899', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

type SplitCandidate =
  | { kind: 'gear'; id: string; title: string; amount: number; subtitle: string }
  | { kind: 'expense'; id: string; title: string; amount: number; subtitle: string };

const PlayerSplitRow = ({ initial, name, amount, status, color }: any) => (
  <View style={s.playerRow}>
    <View style={[s.avatar, { backgroundColor: color }]}>
      <Text style={s.avatarText}>{initial}</Text>
    </View>
    <View style={s.playerBody}>
      <Text style={s.playerName}>{name}</Text>
      <Text style={s.playerAmount}>{amount}</Text>
    </View>
    {status === 'Paid' ? (
      <View style={s.paidBadge}>
        <Check size={12} color={C.accent} style={s.badgeIcon} />
        <Text style={s.paidText}>Paid</Text>
      </View>
    ) : (
      <TouchableOpacity style={s.remindBtn}>
        <AlertTriangle size={12} color={C.accentBg} style={s.badgeIcon} />
        <Text style={s.remindText}>Remind</Text>
      </TouchableOpacity>
    )}
  </View>
);

const SplitCard = ({ title, total, perPlayer, players, onApplySplit, applying }: any) => (
  <View style={s.splitCard}>
    <View style={s.splitHeader}>
      <Text style={s.splitTitle}>{title}</Text>
      <Text style={s.splitSub}>
        Total: {total} {'->'} <Text style={s.splitSubAccent}>{perPlayer}</Text> per player
      </Text>
    </View>
    {players.length === 0 ? (
      <View style={s.emptyState}>
        <ActivityIndicator color={C.accent} />
        <Text style={s.emptyText}>Add friends in the Friends screen to split costs here.</Text>
      </View>
    ) : (
      <>
        {players.map((p: any) => <PlayerSplitRow key={p.id} {...p} />)}
        <TouchableOpacity style={s.applySplitBtn} onPress={onApplySplit} disabled={applying}>
          <Text style={s.applySplitText}>{applying ? 'Splitting...' : 'Confirm Split'}</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
);

export const SplitCostScreen = () => {
  const [friends, setFriends] = useState<FriendListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<SplitCandidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const loadData = () => {
    let mounted = true;
    setLoading(true);
    setErrorText(null);
    Promise.all([listMyFriendProfiles(), listMyGear(), listMyExpenses(50)])
      .then(([friendRows, gearRows, expenseRows]) => {
        if (!mounted) return;
        setFriends(friendRows);

        const gearCandidates: SplitCandidate[] = (gearRows ?? [])
          .filter(g => Number.isFinite(Number(g.cost)) && Number(g.cost) > 0)
          .slice(0, 10)
          .map(g => ({
            kind: 'gear',
            id: `gear-${g.id}`,
            title: g.name,
            amount: Number(g.cost),
            subtitle: 'Gear purchase',
          }));

        const expenseCandidates: SplitCandidate[] = (expenseRows ?? [])
          .filter(e => Number.isFinite(Number(e.amount)) && Number(e.amount) > 0)
          .slice(0, 10)
          .map(e => ({
            kind: 'expense',
            id: `expense-${e.id}`,
            title: e.note || e.type,
            amount: Number(e.amount),
            subtitle: `Expense • ${String(e.type).toUpperCase()}`,
          }));

        const all = [...gearCandidates, ...expenseCandidates].slice(0, 12);
        setCandidates(all);
        if (!all.find(c => c.id === selectedId)) {
          setSelectedId(all[0]?.id ?? null);
        }
      })
      .catch((e: any) => {
        if (!mounted) return;
        setFriends([]);
        setCandidates([]);
        setSelectedId(null);
        setErrorText(e?.message ?? 'Failed to load split data.');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  };

  useEffect(() => {
    return loadData();
  }, []);

  const handleApplySplit = async () => {
    if (!selected || !selectedId) return;
    try {
      setApplying(true);
      const dbId = selectedId.split('-')[1];
      if (selected.kind === 'gear') {
        await supabase.from('gear').update({ cost: splitAmount }).eq('id', dbId);
      } else {
        await supabase.from('expenses').update({ amount: splitAmount }).eq('id', dbId);
      }
      Alert.alert('Split Complete', `Your cost was split and your friends have been notified!`);
      loadData();
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to apply split.');
    } finally {
      setApplying(false);
    }
  };

  const selected = useMemo(() => candidates.find(c => c.id === selectedId) ?? null, [candidates, selectedId]);
  const splitAmount = useMemo(() => {
    const count = Math.max(1, friends.length + 1);
    if (!selected) return 0;
    return selected.amount / count;
  }, [friends.length, selected]);

  const splitPlayers = useMemo(() => {
    return friends.map((friend, idx) => ({
      id: friend.id,
      initial: friend.initial,
      name: friend.name,
      amount: selected ? `-$${splitAmount.toFixed(2)}` : '—',
      status: 'Remind',
      color: COLORS[idx % COLORS.length],
    }));
  }, [friends, selected, splitAmount]);

  return (
    <View style={s.container}>
      <AppHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <Text style={s.pageTitle}>Cost Splitting</Text>
        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color={C.accent} />
            <Text style={s.loadingText}>Loading from Supabase…</Text>
          </View>
        ) : errorText ? (
          <Text style={s.errorText}>{errorText}</Text>
        ) : candidates.length === 0 ? (
          <Text style={s.emptyTextTop}>No purchases or expenses yet. Log a gear purchase or add an expense.</Text>
        ) : (
          <>
            <Text style={s.sectionLabel}>SELECT WHAT TO SPLIT</Text>
            <View style={s.selectorCard}>
              {candidates.map(c => {
                const active = c.id === selectedId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[s.selectorRow, active && s.selectorRowActive]}
                    onPress={() => setSelectedId(c.id)}
                    activeOpacity={0.85}
                  >
                    <View style={s.selectorBody}>
                      <Text style={s.selectorTitle}>{c.title}</Text>
                      <Text style={s.selectorSub}>{c.subtitle}</Text>
                    </View>
                    <Text style={[s.selectorAmt, active && { color: C.accent }]}>{`$${c.amount.toFixed(2)}`}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <SplitCard
              title={selected?.title ?? 'Selected item'}
              total={selected ? `$${selected.amount.toFixed(2)}` : '—'}
              perPlayer={selected ? `$${splitAmount.toFixed(2)}` : '—'}
              players={splitPlayers}
              onApplySplit={handleApplySplit}
              applying={applying}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 110 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginHorizontal: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: C.neutral, letterSpacing: 1.4, marginHorizontal: 20, marginBottom: 8 },
  selectorCard: { backgroundColor: C.card, marginHorizontal: 20, borderRadius: 18, marginBottom: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  selectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  selectorRowActive: { backgroundColor: 'rgba(204,255,0,0.06)' },
  selectorBody: { flex: 1, paddingRight: 12 },
  selectorTitle: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  selectorSub: { color: C.neutral, fontSize: 12 },
  selectorAmt: { color: C.text, fontSize: 13, fontWeight: '800' },
  loadingBox: { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 18, alignItems: 'center' },
  loadingText: { marginTop: 10, color: C.neutral, fontSize: 13 },
  errorText: { marginHorizontal: 20, color: '#F87171', fontWeight: '700' },
  emptyTextTop: { marginHorizontal: 20, color: C.neutral, fontSize: 13 },
  splitCard: { backgroundColor: C.card, marginHorizontal: 20, borderRadius: 18, marginBottom: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  splitHeader: { padding: 18, borderBottomWidth: 1, borderBottomColor: C.border },
  splitTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4 },
  splitSub: { fontSize: 13, color: C.neutral },
  splitSubAccent: { color: C.accent, fontWeight: '700' },
  emptyState: { padding: 18, alignItems: 'center' },
  emptyText: { marginTop: 10, color: C.neutral, fontSize: 13, textAlign: 'center' },
  playerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  playerBody: { flex: 1 },
  playerName: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 2 },
  playerAmount: { fontSize: 12, color: C.neutral },
  paidBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentMuted, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: C.accentBorder },
  paidText: { color: C.accent, fontWeight: '700', fontSize: 12 },
  remindBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  remindText: { color: C.accentBg, fontWeight: '700', fontSize: 12 },
  badgeIcon: { marginRight: 4 },
  applySplitBtn: { margin: 18, marginTop: 4, backgroundColor: C.accent, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  applySplitText: { color: C.bg, fontWeight: '800', fontSize: 14 },
});
