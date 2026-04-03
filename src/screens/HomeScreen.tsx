import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Bell, User, AlertTriangle, Activity, Sparkles, CalendarPlus, Divide, UserPlus, FileText, BarChart2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const CustomLineChart = () => (
  <Svg width={width - 64} height={60} style={{ alignSelf: 'center', marginTop: 20 }}>
    <Path
      d="M 10 50 Q 30 45 40 40 T 70 35 T 100 45 T 140 30 T 180 35 T 220 20 T 260 25 T 300 15"
      fill="none"
      stroke="#208B59"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M 10 50 Q 30 45 40 40 T 70 35 T 100 45 T 140 30 T 180 35 T 220 20 T 260 25 T 300 15 L 300 60 L 10 60 Z"
      fill="rgba(32, 139, 89, 0.1)"
    />
  </Svg>
);

const AlertsCard = ({ title, desc, icon: Icon, color, bg }: any) => (
  <View style={styles.alertCard}>
    <View style={[styles.iconContainer, { backgroundColor: bg }]}>
      <Icon color={color} size={20} />
    </View>
    <View style={styles.alertTextContainer}>
      <Text style={styles.alertTitle}>{title}</Text>
      <Text style={styles.alertDesc}>{desc}</Text>
    </View>
  </View>
);

const ActionIcon = ({ title, icon: Icon, active = false, onPress }: any) => (
  <TouchableOpacity style={styles.actionIconContainer} onPress={onPress}>
    <View style={[styles.actionCircle, active && styles.actionCircleActive]}>
      <Icon color={active ? '#DEA54B' : '#C18D37'} size={24} />
    </View>
    <Text style={styles.actionText}>{title}</Text>
  </TouchableOpacity>
);

const ExpenseItem = ({ title, subtitle, amount, isFirst, isLast }: any) => (
  <View style={[styles.expenseItem, isFirst && styles.expenseItemFirst, isLast && styles.expenseItemLast]}>
    <View>
      <Text style={styles.expenseTitle}>{title}</Text>
      <Text style={styles.expenseSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.expenseAmount}>{amount}</Text>
  </View>
);

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header & Dashboard Section */}
        <View style={[styles.topSection, { paddingTop: insets.top + 16 }]}>
          
          <View style={styles.header}>
            <View style={styles.headerLogoCircle}>
              <Text style={styles.headerLogoText}>CF</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>CourtFund</Text>
              <Text style={styles.headerSubtitle}>Personal Tracker</Text>
            </View>
            <TouchableOpacity style={styles.headerIconWrapper}><Bell color="#8A9BB3" size={20} /></TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerIconWrapper, { backgroundColor: '#208B59', marginLeft: 12 }]}
              onPress={() => navigation.navigate('Profile')}
            >
              <User color="#FFF" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.dashboardCard}>
            <Text style={styles.myExpensesLabel}>MY EXPENSES</Text>
            <Text style={styles.totalAmount}>$283<Text style={styles.amountDecimal}>.50</Text></Text>

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>THIS MONTH</Text>
                <Text style={styles.statValue}>$283.50</Text>
              </View>
              <View style={styles.statDivider} />
              <View>
                <Text style={styles.statLabel}>AVG MONTHLY</Text>
                <Text style={styles.statValue}>$340.00</Text>
              </View>
            </View>

            <CustomLineChart />
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          
          <AlertsCard 
            title="Shuttle Supply Alert"
            desc={<Text>Shuttles predicted to run out in <Text style={{ color: '#E07A5F', fontWeight: 'bold' }}>7 days</Text>. Order now to avoid disruption.</Text>}
            icon={AlertTriangle} bg="#FFF3E0" color="#E07A5F"
          />
          <AlertsCard 
            title="Injury Risk Warning"
            desc={<Text>You've attended <Text style={{ color: '#E07A5F', fontWeight: 'bold' }}>9 sessions</Text> this week (avg: 4). Consider taking a rest day.</Text>}
            icon={Activity} bg="#FFF3E0" color="#E07A5F"
          />
          <AlertsCard 
            title="Cost Saving Found"
            desc={<Text>Switch to BadmintonDirect for AS-30 shuttles. Potential saving: <Text style={{ color: '#208B59', fontWeight: 'bold' }}>$42/month</Text>.</Text>}
            icon={Sparkles} bg="#E8F5E9" color="#208B59"
          />

          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <ActionIcon title="New Booking" icon={CalendarPlus} onPress={() => navigation.navigate('Book')} />
            <ActionIcon title="Split Cost" icon={Divide} onPress={() => navigation.navigate('SplitCost')} />
            <ActionIcon title="Add Friend" icon={UserPlus} onPress={() => navigation.navigate('Friends')} />
            <ActionIcon title="Log Session" icon={FileText} onPress={() => navigation.navigate('SessionLog', { openModal: true })} />
            <ActionIcon title="Insights" icon={BarChart2} />
          </ScrollView>

          <Text style={styles.sectionTitle}>RECENT EXPENSES</Text>
          <View style={styles.expenseList}>
            <ExpenseItem title="Court 2 Booking" subtitle="Today" amount="-$40.00" isFirst />
            <ExpenseItem title="Shuttle Tube (AS-30)" subtitle="Yesterday" amount="-$35.00" />
            <ExpenseItem title="Court 1 Booking" subtitle="Mar 11" amount="-$10.00" />
            <ExpenseItem title="Grip Tape" subtitle="Mar 10" amount="-$8.50" isLast />
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  topSection: { backgroundColor: '#13284B', paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  headerLogoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#DEA54B', justifyContent: 'center', alignItems: 'center', opacity: 0.8 },
  headerLogoText: { color: '#13284B', fontWeight: 'bold', fontSize: 18 },
  headerTextContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#8A9BB3', fontSize: 13, marginTop: 2 },
  headerIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  dashboardCard: { backgroundColor: '#0D1E3A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1F3452' }, // Needs inner grid normally, simplified here
  myExpensesLabel: { color: '#DEA54B', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  totalAmount: { color: '#208B59', fontSize: 44, fontWeight: '800', marginTop: 8 },
  amountDecimal: { fontSize: 32 },
  statsRow: { flexDirection: 'row', marginTop: 16 },
  statLabel: { color: '#8A9BB3', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  statValue: { color: '#FFF', fontSize: 16, fontWeight: '600', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#1F3452', marginHorizontal: 24 },
  contentSection: { padding: 16, marginTop: -20 },
  alertCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 20, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  alertTextContainer: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#13284B', marginBottom: 4 },
  alertDesc: { fontSize: 13, color: '#5B738B', lineHeight: 18 },
  sectionTitle: { fontSize: 13, color: '#5B738B', fontWeight: '600', letterSpacing: 1, marginTop: 24, marginBottom: 16, marginLeft: 4, textTransform: 'uppercase' },
  actionIconContainer: { alignItems: 'center', marginRight: 24 },
  actionCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  actionCircleActive: { borderColor: '#DEA54B', borderWidth: 2 },
  actionText: { marginTop: 8, fontSize: 12, color: '#13284B', fontWeight: '600' },
  expenseList: { backgroundColor: '#FFF', borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  expenseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  expenseItemFirst: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  expenseItemLast: { borderBottomWidth: 0, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  expenseTitle: { fontSize: 15, fontWeight: '600', color: '#13284B', marginBottom: 4 },
  expenseSubtitle: { fontSize: 13, color: '#8A9BB3' },
  expenseAmount: { fontSize: 16, fontWeight: '700', color: '#13284B' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#D4AF37', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999 },
  modalContent: { margin: 16, flex: 1, backgroundColor: '#F0F2F5', borderRadius: 24, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  modalHeader: { flexDirection: 'row', backgroundColor: '#13284B', padding: 20, justifyContent: 'space-between', alignItems: 'center' },
  modalHeaderTitleBlock: { flexDirection: 'row', alignItems: 'center' },
  modalHeaderTitleText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  chatSection: { flex: 1, padding: 20 },
  botBubble: { backgroundColor: '#E2E8F0', padding: 16, borderRadius: 16, borderTopLeftRadius: 4, alignSelf: 'flex-start', maxWidth: '85%' },
  botBubbleText: { fontSize: 15, color: '#13284B', lineHeight: 22 },
  chipsScrollWrapper: { height: 60 },
  chipsScroll: { paddingHorizontal: 16 },
  chip: { backgroundColor: '#E2E8F0', paddingHorizontal: 16, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  chipText: { color: '#13284B', fontSize: 13 },
  inputWrapper: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  inputBox: { flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 24, paddingLeft: 20, paddingRight: 8, height: 48, alignItems: 'center' },
  textInput: { flex: 1, fontSize: 15, color: '#13284B' },
  sendButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#A0AEC0', justifyContent: 'center', alignItems: 'center' },
});
