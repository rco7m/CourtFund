import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  AlertTriangle, Activity, Sparkles,
  CalendarPlus, Divide, UserPlus, FileText,
} from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const FONTS = { headline: 'Lexend', body: 'Inter' };
const { width } = Dimensions.get('window');

const AnimatedChart = () => {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.spring(anim, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: false,
      tension: 60, friction: 10,
    }).start();
    setExpanded(e => !e);
  };

  const chartH = anim.interpolate({ inputRange: [0, 1], outputRange: [64, 140] });
  const chartW = width - 80;

  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.9}>
      <Animated.View style={{ height: chartH, overflow: 'hidden' }}>
        <Svg width={chartW} height={140}>
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.accent} stopOpacity="0.2" />
              <Stop offset="1" stopColor={C.accent} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          {[30,60,90,120].map((y,i) => (
            <Path key={i} d={`M 0 ${y} H ${chartW}`} stroke="rgba(148,163,184,0.08)" strokeWidth="1" />
          ))}
          <Path
            d="M 0 110 L 40 100 L 80 80 L 120 90 L 160 55 L 200 65 L 240 35 L 280 45 L 320 20"
            fill="none" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          />
          <Path
            d="M 0 110 L 40 100 L 80 80 L 120 90 L 160 55 L 200 65 L 240 35 L 280 45 L 320 20 L 320 140 L 0 140 Z"
            fill="url(#g)"
          />
        </Svg>
      </Animated.View>
      <Text style={s.chartHint}>{expanded ? 'Tap to collapse' : 'Tap chart to expand'}</Text>
    </TouchableOpacity>
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
    <View style={{ flex: 1 }}>
      <Text style={s.expenseTitle}>{title}</Text>
      <Text style={s.expenseSubtitle}>{subtitle}</Text>
    </View>
    <Text style={s.expenseAmount}>{amount}</Text>
  </View>
);

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={s.container}>
      <View style={{ paddingTop: insets.top + 10 }}>
        <AppHeader />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={s.topSection}>
          <View style={s.dashboardCard}>
            <Text style={s.myExpensesLabel}>MY EXPENSES</Text>
            <Text style={s.totalAmount}>$283<Text style={s.amountDecimal}>.50</Text></Text>
            <View style={s.statsRow}>
              <View>
                <Text style={s.statLabel}>THIS MONTH</Text>
                <Text style={s.statValue}>$283.50</Text>
              </View>
              <View style={s.statDivider} />
              <View>
                <Text style={s.statLabel}>AVG MONTHLY</Text>
                <Text style={s.statValue}>$340.00</Text>
              </View>
            </View>
            <AnimatedChart />
          </View>
        </View>

        <View style={s.contentSection}>
          <AlertsCard title="Shuttle Supply Alert"
            desc={<Text style={s.alertDesc}>Shuttles predicted to run out in <Text style={s.alertDescAccent}>7 days</Text>. Order now.</Text>}
            icon={AlertTriangle} />
          <AlertsCard title="Injury Risk Warning"
            desc={<Text style={s.alertDesc}>You've attended <Text style={s.alertDescAccent}>9 sessions</Text> this week (avg: 4). Rest advised.</Text>}
            icon={Activity} />
          <AlertsCard title="Cost Saving Found"
            desc={<Text style={s.alertDesc}>Switch supplier for AS-30. Save <Text style={s.alertDescAccent}>$42/month</Text>.</Text>}
            icon={Sparkles} />

          <Text style={s.sectionTitle}>QUICK ACTIONS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
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
            <ExpenseItem title="Court 2 Booking" subtitle="Today" amount="-$40.00" />
            <ExpenseItem title="Shuttle Tube (AS-30)" subtitle="Yesterday" amount="-$35.00" />
            <ExpenseItem title="Court 1 Booking" subtitle="Mar 11" amount="-$10.00" />
            <ExpenseItem title="Grip Tape" subtitle="Mar 10" amount="-$8.50" isLast />
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
  myExpensesLabel: { color: C.accent, fontFamily: FONTS.headline, fontSize: 11, fontWeight: '600', letterSpacing: 1.5 },
  totalAmount: { color: C.accent, fontFamily: FONTS.headline, fontSize: 48, fontWeight: '700', marginTop: 6, letterSpacing: -1 },
  amountDecimal: { fontSize: 30, fontWeight: '500' },
  statsRow: { flexDirection: 'row', marginTop: 18, alignItems: 'center' },
  statLabel: { color: C.neutral, fontFamily: FONTS.headline, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  statValue: { color: C.text, fontFamily: FONTS.body, fontSize: 15, fontWeight: '600', marginTop: 4 },
  statDivider: { width: 1, height: 32, backgroundColor: C.border, marginHorizontal: 20 },
  chartHint: { color: C.neutral, fontSize: 10, textAlign: 'center', marginTop: 6, letterSpacing: 0.5 },
  contentSection: { paddingHorizontal: 20, paddingTop: 4 },
  alertCard: { flexDirection: 'row', backgroundColor: C.card, padding: 16, borderRadius: 16, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border },
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
  expenseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent, marginRight: 14, opacity: 0.7 },
  expenseTitle: { fontSize: 14, fontFamily: FONTS.body, fontWeight: '600', color: C.text, marginBottom: 2 },
  expenseSubtitle: { fontSize: 12, fontFamily: FONTS.body, color: C.neutral },
  expenseAmount: { fontSize: 15, fontFamily: FONTS.headline, fontWeight: '700', color: C.accent },
});
