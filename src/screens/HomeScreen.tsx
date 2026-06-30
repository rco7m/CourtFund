import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  AlertTriangle, Activity, Sparkles,
  CalendarPlus, Divide, UserPlus, FileText,
} from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { listMyExpenses } from '../data/expenses';
import { listMySessions } from '../data/sessions';
import { listMyGear } from '../data/gear';
import { getMyUserStats } from '../data/userStats';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const FONTS = { headline: 'Lexend', body: 'Inter' };
const { width } = Dimensions.get('window');

const AnimatedChart = ({ expenses }: { expenses: any[] }) => {
  const expanded = true;

  const chartH = 150;
  const chartW = width - 80;

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  const ymdKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const series = useMemo(() => {
    const days = 8;
    const totals = new Map<string, number>();
    for (const r of expenses ?? []) {
      const when = new Date(r.occurred_at);
      const k = ymdKey(startOfDay(when));
      totals.set(k, (totals.get(k) ?? 0) + (Number(r.amount) || 0));
    }

    const today = startOfDay(new Date());
    const first = addDays(today, -(days - 1));
    const out: { date: Date; value: number }[] = [];
    for (let i = 0; i < days; i += 1) {
      const dt = addDays(first, i);
      out.push({ date: dt, value: totals.get(ymdKey(dt)) ?? 0 });
    }
    return out;
  }, [expenses]);

  const maxV = Math.max(1, ...series.map(p => p.value || 0));
  const padX = 24;
  const pts = series.map((p, idx) => {
    const x = padX + (idx / (series.length - 1)) * (chartW - padX * 2);
    const y = 140 - (Math.max(0, p.value) / maxV) * 115;
    return { x, y };
  });

  const lineD = pts.length
    ? `M ${pts[0].x} ${pts[0].y} ${pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`
    : '';
  const areaD = pts.length
    ? `${lineD} L ${pts[pts.length - 1].x} 140 L ${pts[0].x} 140 Z`
    : '';

  return (
    <View>
      <View style={[s.chartClip, { height: chartH }]}>
        <Svg width={chartW} height={160}>
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.accent} stopOpacity="0.2" />
              <Stop offset="1" stopColor={C.accent} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          {[30,60,90,120].map((y,i) => {
            const val = maxV - (y / 140) * maxV;
            return (
              <React.Fragment key={`grid-${i}`}>
                <Path d={`M 0 ${y} H ${chartW}`} stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
                {expanded && <SvgText x={0} y={y - 4} fill={C.neutral} fontSize={9} fontWeight="600" textAnchor="start">${val.toFixed(0)}</SvgText>}
              </React.Fragment>
            );
          })}
          
          {expanded && series.map((p, idx) => {
            if (idx % 2 !== 0 && idx !== series.length - 1) return null;
            if (idx === series.length - 2) return null; // Avoid overlapping with the last item
            const x = padX + (idx / (series.length - 1)) * (chartW - padX * 2);
            const dateLabel = `${p.date.getMonth() + 1}/${p.date.getDate()}`;
            return (
              <SvgText key={`date-${idx}`} x={x} y={150} fill={C.neutral} fontSize={9} fontWeight="600" textAnchor="middle">
                {dateLabel}
              </SvgText>
            );
          })}
          {lineD ? (
            <Path
              d={lineD}
              fill="none" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            />
          ) : null}
          {areaD ? (
            <Path
              d={areaD}
              fill="url(#g)"
            />
          ) : null}
        </Svg>
      </View>
    </View>
  );
};

const AlertsCard = ({ title, desc, icon: Icon }: any) => (
  <View style={s.alertCard}>
    <View style={s.iconContainer}><Icon color={C.accent} size={18} /></View>
    <View style={s.alertTextContainer}>
      <Text style={s.alertTitle}>{title}</Text>
      <Text style={s.alertDesc}>{desc}</Text>
    </View>
  </View>
);

const ActionIcon = ({ title, icon: Icon, onPress }: any) => (
  <TouchableOpacity style={s.actionIconContainer} onPress={onPress} activeOpacity={0.75}>
    <View style={s.actionCircle}><Icon color={C.accent} size={22} /></View>
    <Text style={s.actionText}>{title}</Text>
  </TouchableOpacity>
);

const ExpenseItem = ({ title, subtitle, amount, isLast }: any) => (
  <View style={[s.expenseItem, isLast && s.expenseItemLast]}>
    <View style={s.expenseDot} />
    <View style={s.expenseTextWrap}>
      <Text style={s.expenseTitle}>{title}</Text>
      <Text style={s.expenseSubtitle}>{subtitle}</Text>
    </View>
    <Text style={s.expenseAmount}>{amount}</Text>
  </View>
);

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [gearItems, setGearItems] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      listMyExpenses(10),
      listMySessions(),
      listMyGear(),
      getMyUserStats(),
    ])
      .then(([expenseRows, sessionRows, gearRows, statsRow]) => {
        if (!mounted) return;
        setExpenses(expenseRows);
        setSessions(sessionRows);
        setGearItems(gearRows);
        setUserStats(statsRow);
      })
      .catch(() => {})
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;
      setLoading(true);
      Promise.all([
        listMyExpenses(10),
        listMySessions(),
        listMyGear(),
        getMyUserStats(),
      ])
        .then(([expenseRows, sessionRows, gearRows, statsRow]) => {
          if (!mounted) return;
          setExpenses(expenseRows);
          setSessions(sessionRows);
          setGearItems(gearRows);
          setUserStats(statsRow);
        })
        .catch(() => {})
        .finally(() => {
          if (!mounted) return;
          setLoading(false);
        });
      return () => {
        mounted = false;
      };
    }, [])
  );

  const totalSpend = useMemo(() => (expenses ?? []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0), [expenses]);
  const sessionsThisWeek = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    return sessions.filter((sess: any) => new Date(sess.occurred_at) >= start).length;
  }, [sessions]);

  const alerts = useMemo(() => {
    const items: Array<{ title: string; desc: React.ReactNode; icon: any; key: string }> = [];
    const lowShuttles = gearItems.find((item: any) => {
      const name = String(item.name ?? '').toLowerCase();
      return name.includes('shuttle') && Number(item.quantity) <= 6;
    });

    if (lowShuttles) {
      items.push({
        key: 'shuttle',
        title: 'Shuttle Supply Alert',
        icon: AlertTriangle,
        desc: (
          <>
            {String(lowShuttles.name)} stock is down to{' '}
            <Text style={s.alertDescAccent}>{Number(lowShuttles.quantity)}</Text>. Reorder soon.
          </>
        ),
      });
    }

    const expectedWeekly = Number(userStats?.sessions_count ?? 0) / 4 || 0;
    if (sessionsThisWeek > Math.max(4, Math.ceil(expectedWeekly * 1.5))) {
      items.push({
        key: 'injury',
        title: 'Injury Risk Warning',
        icon: Activity,
        desc: (
          <>
            You&apos;ve logged <Text style={s.alertDescAccent}>{sessionsThisWeek} sessions</Text> this week.
            Recovery may help before the next run.
          </>
        ),
      });
    }

    const recentExpense = expenses[0];
    if (recentExpense) {
      const expenseLabel = recentExpense.split_id
        ? `${recentExpense.note || recentExpense.type} (split share)`
        : (recentExpense.note || recentExpense.type);
      items.push({
        key: 'expense',
        title: 'Recent Spend Update',
        icon: Sparkles,
        desc: (
          <>
            Latest expense: <Text style={s.alertDescAccent}>-${Number(recentExpense.amount).toFixed(2)}</Text>{' '}
            for {expenseLabel}.
          </>
        ),
      });
    }

    return items;
  }, [expenses, gearItems, sessionsThisWeek, userStats]);

  return (
    <View style={s.container}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <View style={s.topSection}>
          <View style={s.dashboardCard}>
            <Text style={s.myExpensesLabel}>MY EXPENSES</Text>
            {loading ? (
              <View style={s.loadingRow}>
                <ActivityIndicator color={C.accent} />
                <Text style={s.loadingText}>Loading...</Text>
              </View>
            ) : (
              <Text style={s.totalAmount}>
                ${Math.floor(totalSpend)}
                <Text style={s.amountDecimal}>.{String(Math.round((totalSpend % 1) * 100)).padStart(2, '0')}</Text>
              </Text>
            )}
            <View style={s.statsRow}>
              <View>
                <Text style={s.statLabel}>THIS MONTH</Text>
                <Text style={s.statValue}>{loading ? '—' : `$${totalSpend.toFixed(2)}`}</Text>
              </View>
              <View style={s.statDivider} />
              <View>
                <Text style={s.statLabel}>AVG MONTHLY</Text>
                <Text style={s.statValue}>—</Text>
              </View>
            </View>
            {loading ? null : <AnimatedChart expenses={expenses} />}
          </View>
        </View>

        <View style={s.contentSection}>
          {loading ? (
            <View style={s.emptyAlertCard}>
              <ActivityIndicator color={C.accent} />
              <Text style={s.alertTitle}>Loading…</Text>
              <Text style={s.alertDesc}>Fetching your latest data.</Text>
            </View>
          ) : alerts.length === 0 ? (
            <View style={s.emptyAlertCard}>
              <Text style={s.alertTitle}>No active alerts</Text>
              <Text style={s.alertDesc}>Your latest data looks clear right now.</Text>
            </View>
          ) : (
            alerts.map(alert => (
              <AlertsCard key={alert.key} title={alert.title} desc={alert.desc} icon={alert.icon} />
            ))
          )}

          <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickActionsScroll}>
            <ActionIcon title="New Booking" icon={CalendarPlus} onPress={() => navigation.navigate('Book')} />
            <ActionIcon title="Split Cost" icon={Divide} onPress={() => navigation.navigate('SplitCost')} />
            <ActionIcon title="Add Friend" icon={UserPlus} onPress={() => navigation.navigate('Friends')} />
            <ActionIcon title="Log Session" icon={FileText} onPress={() => navigation.navigate('SessionLog', { openModal: true })} />
          </ScrollView>

          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>RECENT EXPENSES</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
              <Text style={s.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={s.expenseList}>
            {loading ? (
              <ExpenseItem title="Loading…" subtitle="Syncing expenses" amount="" isLast />
            ) : expenses.length === 0 ? (
              <ExpenseItem title="No expenses yet" subtitle="Log one from Wallet" amount="" isLast />
            ) : (
              expenses.slice(0, 4).map((tx: any, idx: number) => {
                const dt = new Date(tx.occurred_at);
                const subtitle = tx.split_id
                  ? `${dt.toLocaleDateString()} • ${tx.split_role === 'host' ? 'Your split share' : 'Added by teammate'}`
                  : dt.toLocaleDateString();
                const amount = `-$${Number(tx.amount).toFixed(2)}`;
                return (
                  <ExpenseItem
                    key={tx.id}
                    title={tx.note || tx.type}
                    subtitle={subtitle}
                    amount={amount}
                    isLast={idx === Math.min(3, expenses.length - 1)}
                  />
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topSection: { paddingHorizontal: 20, paddingBottom: 20 },
  dashboardCard: { backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
  chartClip: { overflow: 'hidden' },
  myExpensesLabel: { color: C.accent, fontFamily: FONTS.headline, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 },
  totalAmount: { color: C.accent, fontFamily: FONTS.headline, fontSize: 48, fontWeight: '700', marginTop: 6, letterSpacing: -1 },
  amountDecimal: { fontSize: 30, fontWeight: '500' },
  statsRow: { flexDirection: 'row', marginTop: 18, alignItems: 'center' },
  statLabel: { color: C.neutral, fontFamily: FONTS.headline, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  statValue: { color: C.text, fontFamily: FONTS.body, fontSize: 15, fontWeight: '600', marginTop: 4 },
  statDivider: { width: 1, height: 32, backgroundColor: C.border, marginHorizontal: 20 },
  chartHint: { color: C.neutral, fontSize: 10, textAlign: 'center', marginTop: 6, letterSpacing: 0.5 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  loadingText: { color: C.neutral, fontSize: 13, fontWeight: '600' },
  contentSection: { paddingHorizontal: 20, paddingTop: 4 },
  alertCard: { flexDirection: 'row', backgroundColor: C.card, padding: 16, borderRadius: 16, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  emptyAlertCard: { backgroundColor: C.card, padding: 16, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  iconContainer: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.accentMuted, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: C.accentBorder },
  alertTextContainer: { flex: 1 },
  alertTitle: { fontSize: 14, fontFamily: FONTS.headline, fontWeight: '600', color: C.text, marginBottom: 3 },
  alertDesc: { fontSize: 12, fontFamily: FONTS.body, color: C.neutral, lineHeight: 18 },
  alertDescAccent: { color: C.accent, fontWeight: '700' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, marginBottom: 14, marginLeft: 4 },
  sectionTitle: { fontSize: 11, fontFamily: FONTS.headline, color: C.neutral, fontWeight: '600', letterSpacing: 1.5, marginTop: 28, marginBottom: 14, marginLeft: 4 },
  viewAll: { color: C.accent, fontSize: 13, fontWeight: '600' },
  actionIconContainer: { alignItems: 'center', marginRight: 20 },
  actionCircle: { width: 60, height: 60, borderRadius: 16, backgroundColor: C.accentMuted, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.accentBorder },
  actionText: { marginTop: 8, fontSize: 11, fontFamily: FONTS.headline, color: C.text, fontWeight: '500', textAlign: 'center' },
  expenseList: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  expenseItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  expenseItemLast: { borderBottomWidth: 0 },
  expenseTextWrap: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  quickActionsScroll: { paddingHorizontal: 4 },
  expenseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent, marginRight: 14, opacity: 0.7 },
  expenseTitle: { fontSize: 14, fontFamily: FONTS.body, fontWeight: '600', color: C.text, marginBottom: 2 },
  expenseSubtitle: { fontSize: 12, fontFamily: FONTS.body, color: C.neutral },
  expenseAmount: { fontSize: 15, fontFamily: FONTS.headline, fontWeight: '700', color: C.accent },
});
