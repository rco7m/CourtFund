import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BellRing, CircleDollarSign, Users } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppHeader } from '../components/AppHeader';
import { listMyExpenses } from '../data/expenses';
import { listMyCostSplitActivity } from '../data/splits';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const SummaryCard = ({ title, value, subtitle, icon: Icon }: any) => (
  <View style={s.summaryCard}>
    <View style={s.summaryIcon}><Icon size={18} color={C.accent} /></View>
    <Text style={s.summaryValue}>{value}</Text>
    <Text style={s.summaryTitle}>{title}</Text>
    <Text style={s.summarySubtitle}>{subtitle}</Text>
  </View>
);

const SplitActivityCard = ({ split }: any) => (
  <View style={s.activityCard}>
    <View style={s.activityHeader}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={s.activityTitle}>{split.title}</Text>
        <Text style={s.activityMeta}>
          {split.mine_role === 'host' ? 'You created this split' : 'Added to your wallet automatically'}
        </Text>
      </View>
      <Text style={s.activityAmount}>${Number(split.mine_amount).toFixed(2)}</Text>
    </View>

    <View style={s.activityStatRow}>
      <Text style={s.activityStatLabel}>Total</Text>
      <Text style={s.activityStatValue}>${Number(split.total_amount).toFixed(2)}</Text>
    </View>
    <View style={s.activityStatRow}>
      <Text style={s.activityStatLabel}>Per player</Text>
      <Text style={s.activityStatValue}>${Number(split.share_amount).toFixed(2)}</Text>
    </View>
    <View style={s.activityStatRow}>
      <Text style={s.activityStatLabel}>Participants</Text>
      <Text style={s.activityStatValue}>{split.participant_count}</Text>
    </View>

    <View style={s.memberList}>
      {split.members.map((member: any, idx: number) => (
        <View key={`${split.id}-${member.participant_name}-${idx}`} style={[s.memberRow, idx === split.members.length - 1 && s.memberRowLast]}>
          <View style={s.memberAvatar}>
            <Text style={s.memberAvatarText}>{String(member.participant_name).slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.memberName}>{member.participant_name}</Text>
            <Text style={s.memberStatus}>{member.role === 'host' ? 'Host share added' : 'Notification sent automatically'}</Text>
          </View>
          <Text style={s.memberAmount}>${Number(member.amount).toFixed(2)}</Text>
        </View>
      ))}
    </View>
  </View>
);

const SplitExpenseRow = ({ row, isLast }: any) => {
  const when = new Date(row.occurred_at);
  return (
    <View style={[s.expenseRow, isLast && s.expenseRowLast]}>
      <View style={s.expenseDot} />
      <View style={{ flex: 1 }}>
        <Text style={s.expenseTitle}>{row.note || 'Split share'}</Text>
        <Text style={s.expenseMeta}>{when.toLocaleDateString()} • {row.split_role === 'host' ? 'Your share' : 'Added by teammate'}</Text>
      </View>
      <Text style={s.expenseAmount}>-${Number(row.amount).toFixed(2)}</Text>
    </View>
  );
};

export const SplitCostScreen = () => {
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [splits, setSplits] = useState<any[]>([]);
  const [splitExpenses, setSplitExpenses] = useState<any[]>([]);

  const load = async () => {
    try {
      setErrorText(null);
      setLoading(true);
      const [splitRows, expenseRows] = await Promise.all([
        listMyCostSplitActivity(10),
        listMyExpenses(30),
      ]);
      setSplits(splitRows);
      setSplitExpenses(expenseRows.filter(row => row.split_id));
    } catch (error: any) {
      setErrorText(error?.message ?? 'Failed to load split activity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      load();
    }, [])
  );

  const summary = useMemo(() => {
    const incomingCount = splits.filter(split => split.mine_role === 'member').length;
    const outgoingCount = splits.filter(split => split.mine_role === 'host').length;
    const myTotal = splitExpenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    return {
      incomingCount,
      outgoingCount,
      myTotal,
    };
  }, [splits, splitExpenses]);

  return (
    <View style={s.container}>
      <AppHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <Text style={s.pageTitle}>Cost Splitting</Text>
        <Text style={s.pageSubtitle}>Add teammate codes while logging a purchase. SportFund now creates the split, sends the notification, and drops each share into the right wallet automatically.</Text>

        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator color={C.accent} />
            <Text style={s.loadingText}>Loading split activity…</Text>
          </View>
        ) : errorText ? (
          <Text style={s.errorText}>{errorText}</Text>
        ) : (
          <>
            <View style={s.summaryGrid}>
              <SummaryCard title="Shared By You" value={summary.outgoingCount} subtitle="Auto-sent to teammates" icon={Users} />
              <SummaryCard title="Assigned To You" value={summary.incomingCount} subtitle="Added to your wallet" icon={BellRing} />
              <SummaryCard title="My Split Spend" value={`$${summary.myTotal.toFixed(2)}`} subtitle="All divided expenses" icon={CircleDollarSign} />
            </View>
            <Text style={s.sectionLabel}>RECENT SPLITS</Text>
            {splits.length === 0 ? (
              <View style={s.emptyCard}>
                <Text style={s.emptyTitle}>No split activity yet</Text>
                <Text style={s.emptyText}>Open gear logging, add teammate codes, and the shared expense will appear here instantly.</Text>
              </View>
            ) : (
              splits.map(split => <SplitActivityCard key={split.id} split={split} />)
            )}

            <View style={s.sectionRow}>
              <Text style={s.sectionLabel}>RECENT SPLIT EXPENSES</Text>
              <TouchableOpacity onPress={load}>
                <Text style={s.refreshText}>Refresh</Text>
              </TouchableOpacity>
            </View>
            <View style={s.expensesCard}>
              {splitExpenses.length === 0 ? (
                <Text style={s.emptyText}>No split expenses have been added yet.</Text>
              ) : (
                splitExpenses.slice(0, 8).map((row, idx) => (
                  <SplitExpenseRow key={row.id} row={row} isLast={idx === Math.min(splitExpenses.length, 8) - 1} />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 110 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginHorizontal: 20, marginBottom: 8 },
  pageSubtitle: { color: C.neutral, fontSize: 13, lineHeight: 20, marginHorizontal: 20, marginBottom: 18 },
  loadingBox: { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 18, alignItems: 'center' },
  loadingText: { marginTop: 10, color: C.neutral, fontSize: 13 },
  errorText: { marginHorizontal: 20, color: '#F87171', fontWeight: '700' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  summaryCard: { width: '48%', backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  summaryIcon: { width: 34, height: 34, borderRadius: 12, backgroundColor: C.accentMuted, borderWidth: 1, borderColor: C.accentBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  summaryValue: { color: C.text, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  summaryTitle: { color: C.text, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  summarySubtitle: { color: C.neutral, fontSize: 11, lineHeight: 16 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: C.neutral, letterSpacing: 1.4, marginHorizontal: 20, marginBottom: 8 },
  sectionRow: { marginTop: 8, marginBottom: 8, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  refreshText: { color: C.accent, fontSize: 12, fontWeight: '700' },
  emptyCard: { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 16 },
  emptyTitle: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  emptyText: { color: C.neutral, fontSize: 12, lineHeight: 18 },
  activityCard: { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 14 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  activityTitle: { color: C.text, fontSize: 16, fontWeight: '800', marginBottom: 4 },
  activityMeta: { color: C.neutral, fontSize: 12 },
  activityAmount: { color: C.accent, fontSize: 22, fontWeight: '800' },
  activityStatRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  activityStatLabel: { color: C.neutral, fontSize: 12 },
  activityStatValue: { color: C.text, fontSize: 12, fontWeight: '700' },
  memberList: { marginTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  memberRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.accentMuted, borderWidth: 1, borderColor: C.accentBorder, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  memberAvatarText: { color: C.accent, fontWeight: '700', fontSize: 13 },
  memberName: { color: C.text, fontSize: 13, fontWeight: '700', marginBottom: 2 },
  memberStatus: { color: C.neutral, fontSize: 11 },
  memberAmount: { color: C.text, fontSize: 13, fontWeight: '700' },
  expensesCard: { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 24 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  expenseRowLast: { borderBottomWidth: 0 },
  expenseDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.accent, marginRight: 12 },
  expenseTitle: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 3 },
  expenseMeta: { color: C.neutral, fontSize: 11 },
  expenseAmount: { color: C.accent, fontSize: 14, fontWeight: '800' },
});
