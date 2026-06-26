import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Text as SvgText } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Plus, Layers, ShoppingBag, Target, CreditCard, ArrowLeft,
} from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { createExpense, listMyExpenses } from '../data/expenses';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const CATEGORIES = [
  { id: 'court', label: 'Court Fees', icon: Layers },
  { id: 'gear', label: 'Gear & Equip', icon: ShoppingBag },
  { id: 'training', label: 'Coaching', icon: Target },
  { id: 'other', label: 'Other', icon: CreditCard },
];

const { width: SCREEN_W } = Dimensions.get('window');

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
const ymdKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtShort = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const buildDailySpendingSeries = (rows: any[], days: number) => {
  const totals = new Map<string, number>();
  for (const r of rows ?? []) {
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
};

const SpendingChart = ({ series }: { series: { date: Date; value: number }[] }) => {
  const svgW = SCREEN_W - 80;
  const svgH = 170;
  const padL = 44;
  const padR = 12;
  const padT = 12;
  const padB = 44;
  const plotW = Math.max(1, svgW - padL - padR);
  const plotH = Math.max(1, svgH - padT - padB);
  const baseY = padT + plotH;

  const maxV = Math.max(1, ...series.map(p => p.value || 0));
  const pts = series.map((p, idx) => {
    const x = padL + (series.length === 1 ? 0 : (idx / (series.length - 1)) * plotW);
    const y = baseY - (Math.max(0, p.value) / maxV) * plotH;
    return { x, y, raw: p };
  });

  const lineD = pts.length
    ? `M ${pts[0].x} ${pts[0].y} ${pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`
    : '';
  const areaD = pts.length
    ? `${lineD} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`
    : '';

  const xTickIdx = pts.length <= 3 ? pts.map((_, i) => i) : [0, Math.floor((pts.length - 1) / 2), pts.length - 1];
  const yTicks = [0, maxV / 2, maxV];

  return (
    <View>
      <Svg width={svgW} height={svgH}>
        <Defs>
          <LinearGradient id="wallet_g" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.accent} stopOpacity="0.2" />
            <Stop offset="1" stopColor={C.accent} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {[0.25, 0.5, 0.75, 1].map((t, i) => (
          <Line
            key={i}
            x1={padL}
            x2={padL + plotW}
            y1={padT + plotH * t}
            y2={padT + plotH * t}
            stroke="rgba(148,163,184,0.08)"
            strokeWidth={1}
          />
        ))}

        {/* Axes */}
        <Line x1={padL} y1={padT} x2={padL} y2={baseY} stroke="rgba(148,163,184,0.22)" strokeWidth={1} />
        <Line x1={padL} y1={baseY} x2={padL + plotW} y2={baseY} stroke="rgba(148,163,184,0.22)" strokeWidth={1} />

        {/* Y ticks */}
        {yTicks.map((v, i) => {
          const y = baseY - (v / maxV) * plotH;
          return (
            <SvgText
              key={i}
              x={padL - 8}
              y={y + 4}
              fill={C.neutral}
              fontSize={10}
              textAnchor="end"
            >
              ${Math.round(v)}
            </SvgText>
          );
        })}

        {/* X ticks */}
        {xTickIdx.map((idx) => (
          <SvgText
            key={idx}
            x={pts[idx]?.x ?? padL}
            y={baseY + 18}
            fill={C.neutral}
            fontSize={10}
            textAnchor="middle"
          >
            {pts[idx] ? fmtShort(pts[idx].raw.date) : ''}
          </SvgText>
        ))}

        {/* Axis labels */}
        <SvgText x={padL + plotW / 2} y={svgH - 8} fill={C.neutral} fontSize={11} textAnchor="middle">
          Dates
        </SvgText>
        <SvgText
          x={14}
          y={padT + plotH / 2}
          fill={C.neutral}
          fontSize={11}
          textAnchor="middle"
          transform={`rotate(-90 14 ${padT + plotH / 2})`}
        >
          Spending ($)
        </SvgText>

        {/* Line + fill (same style as Home) */}
        {areaD ? <Path d={areaD} fill="url(#wallet_g)" /> : null}
        {lineD ? (
          <Path
            d={lineD}
            fill="none"
            stroke={C.accent}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </Svg>
    </View>
  );
};

const TxItem = ({ icon: Icon, title, sub, amount, isLast }: any) => (
  <View style={[s.txItem, isLast && { borderBottomWidth: 0 }]}>
    <View style={s.txIconBox}><Icon size={18} color={C.accent} /></View>
    <View style={{ flex: 1 }}>
      <Text style={s.txTitle}>{title}</Text>
      <Text style={s.txSub}>{sub}</Text>
    </View>
    <Text style={s.txAmount}>{amount}</Text>
  </View>
);

const AddTransactionModal = ({ visible, onClose, onCreate }: any) => {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('court');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLog = async () => {
    setErrorText(null);
    const value = Number.parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setErrorText('Enter a valid amount.');
      return;
    }
    try {
      setLoading(true);
      await onCreate({ amount: value, category });
      setAmount('');
      setCategory('court');
      onClose();
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to log transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[s.modalHeader, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={onClose} style={s.modalBackBtn}>
            <ArrowLeft size={20} color={C.text} />
          </TouchableOpacity>
          <Text style={s.modalTitle}>Add Transaction</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={s.amountSection}>
            <Text style={s.amountLabel}>ENTER AMOUNT</Text>
            <View style={s.amountRow}>
              <Text style={s.dollarSign}>$</Text>
              <TextInput
                style={s.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={C.neutral}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>CATEGORY</Text>
            <View style={s.categoryGrid}>
              {CATEGORIES.map(cat => {
                const active = category === cat.id;
                return (
                  <TouchableOpacity key={cat.id} style={[s.catItem, active && s.catItemActive]}
                    onPress={() => setCategory(cat.id)}>
                    <cat.icon size={22} color={active ? C.accent : C.neutral} />
                    <Text style={[s.catLabel, active && { color: C.accent }]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleLog} disabled={loading}>
            <Text style={s.submitBtnText}>{loading ? 'SAVING…' : 'LOG TRANSACTION'}</Text>
          </TouchableOpacity>
          {errorText ? <Text style={s.modalError}>{errorText}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};



export const WalletScreen = () => {
  const insets = useSafeAreaInsets();
  const [showAdd, setShowAdd] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  const load = async () => {
    try {
      setErrorText(null);
      setLoading(true);
      const rows = await listMyExpenses(50);
      setExpenses(rows);
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to load wallet.');
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

  const totalOutflow = useMemo(() => (expenses ?? []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0), [expenses]);
  const monthOutflow = useMemo(() => {
    const now = new Date();
    return (expenses ?? []).reduce((acc, e) => {
      const dt = new Date(e.occurred_at);
      if (dt.getFullYear() !== now.getFullYear() || dt.getMonth() !== now.getMonth()) return acc;
      return acc + (Number(e.amount) || 0);
    }, 0);
  }, [expenses]);
  const dailySeries = useMemo(() => buildDailySpendingSeries(expenses, 8), [expenses]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <AppHeader />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={s.liquidityCard}>
          <View>
            <Text style={s.liquidityLabel}>TOTAL SPEND</Text>
            <Text style={s.liquidityAmount}>$ {totalOutflow.toFixed(2)}</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>MONTHLY SPENDING</Text>
          <View style={s.chartBox}>
            <SpendingChart series={dailySeries} />
          </View>
          <View style={s.spendingStats}>
            <View>
              <Text style={s.statLabel}>OUTFLOW</Text>
              <Text style={s.statValue}>-${monthOutflow.toFixed(2)}</Text>
            </View>
            <View>
              <Text style={s.statLabel}>SAVED</Text>
              <Text style={s.statValue}>—</Text>
            </View>
          </View>
        </View>

        <View style={s.activityHeader}>
          <Text style={s.activityTitle}>Activity History</Text>
          <TouchableOpacity onPress={() => {}}><Text style={s.viewAll}>View All</Text></TouchableOpacity>
        </View>
        <View style={s.card}>
          {loading ? (
            <Text style={{ color: C.neutral }}>Loading…</Text>
          ) : errorText ? (
            <Text style={{ color: '#F87171', fontWeight: '700' }}>{errorText}</Text>
          ) : expenses.length === 0 ? (
            <Text style={{ color: C.neutral }}>No activity yet.</Text>
          ) : (
            expenses.slice(0, 5).map((tx: any, idx: number) => {
              const dt = new Date(tx.occurred_at);
              const sub = `${dt.toLocaleDateString()} • ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
              const icon = tx.type === 'gear' ? ShoppingBag : tx.type === 'booking' ? Layers : CreditCard;
              const title = tx.note || (tx.type === 'gear' ? 'Gear' : tx.type === 'booking' ? 'Booking' : 'Expense');
              return (
                <TxItem
                  key={tx.id}
                  icon={icon}
                  title={title}
                  sub={sub}
                  amount={`-$${Number(tx.amount).toFixed(2)}`}
                  isLast={idx === Math.min(4, expenses.length - 1)}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => setShowAdd(true)}>
        <Plus size={24} color={C.bg} />
      </TouchableOpacity>

      <AddTransactionModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onCreate={async ({ amount, category }: any) => {
          const type = category === 'gear' ? 'gear' : category === 'court' ? 'booking' : 'other';
          await createExpense({ type, amount, note: category });
          await load();
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  liquidityCard:{backgroundColor:C.card,marginHorizontal:20,borderRadius:20,padding:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16,borderWidth:1,borderColor:C.border},
  liquidityLabel:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1,marginBottom:4},
  liquidityAmount:{color:C.accent,fontSize:28,fontWeight:'800'},
  card:{backgroundColor:C.card,marginHorizontal:20,borderRadius:20,padding:20,marginBottom:16,borderWidth:1,borderColor:C.border},
  cardTitle:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1,marginBottom:20},
  chartBox:{alignItems:'center',marginBottom:20},
  spendingStats:{flexDirection:'row',justifyContent:'space-between'},
  statLabel:{color:C.neutral,fontSize:10,fontWeight:'700',marginBottom:4},
  statValue:{color:C.text,fontSize:18,fontWeight:'700'},
  activityHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginHorizontal:20,marginBottom:12},
  activityTitle:{color:C.text,fontSize:16,fontWeight:'700'},
  viewAll:{color:C.accent,fontSize:12,fontWeight:'600'},
  txItem:{flexDirection:'row',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.border},
  txIconBox:{width:36,height:36,borderRadius:10,backgroundColor:C.accentMuted,justifyContent:'center',alignItems:'center',marginRight:12,borderWidth:1,borderColor:C.accentBorder},
  txTitle:{color:C.text,fontSize:14,fontWeight:'600',marginBottom:2},
  txSub:{color:C.neutral,fontSize:11},
  txAmount:{color:C.text,fontSize:14,fontWeight:'700'},
  fab:{position:'absolute',bottom:110,left:24,width:56,height:56,borderRadius:28,backgroundColor:C.accent,justifyContent:'center',alignItems:'center',elevation:5,shadowColor:C.accent,shadowOpacity:0.3,shadowRadius:10,shadowOffset:{width:0,height:5}},
  modalHeader:{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingBottom:16},
  modalBackBtn:{width:36,height:36,borderRadius:10,backgroundColor:C.card,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:C.border},
  modalTitle:{color:C.text,fontSize:16,fontWeight:'700',flex:1,textAlign:'center'},
  amountSection:{alignItems:'center',paddingVertical:40},
  amountLabel:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1,marginBottom:10},
  amountRow:{flexDirection:'row',alignItems:'center'},
  dollarSign:{color:C.accent,fontSize:32,fontWeight:'700',marginRight:4},
  amountInput:{color:C.text,fontSize:48,fontWeight:'800',minWidth:100,textAlign:'center'},
  section:{paddingHorizontal:20,marginBottom:30},
  sectionLabel:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1,marginBottom:16},
  categoryGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},
  catItem:{width:'48%',backgroundColor:C.card,borderRadius:16,padding:16,marginBottom:12,alignItems:'center',borderWidth:1,borderColor:C.border},
  catItemActive:{borderColor:C.accent,backgroundColor:C.accentMuted},
  catLabel:{color:C.neutral,fontSize:12,fontWeight:'600',marginTop:8},
  submitBtn:{backgroundColor:C.accent,marginHorizontal:20,paddingVertical:16,borderRadius:30,alignItems:'center'},
  submitBtnText:{color:C.bg,fontWeight:'800',fontSize:15},
  modalError:{color:'#F87171',fontWeight:'700',textAlign:'center',marginTop:12,marginHorizontal:20},
});
