import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Bell, User, ArrowDownRight, ClipboardList } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const CustomLineChart = () => (
  <View style={styles.chartWrapper}>
    {/* Grid lines */}
    <View style={styles.chartGridLine} />
    <View style={styles.chartGridLine} />
    <View style={styles.chartGridLineLast} />
    <Svg width="100%" height={90} style={{ position: 'absolute', bottom: 0 }}>
      {/* Path approximation for the trend */}
      <Path
        d="M 10 70 L 60 75 L 120 55 L 180 60 L 240 25 L 300 35 L 360 15"
        fill="none"
        stroke="#13284B"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M 10 70 L 60 75 L 120 55 L 180 60 L 240 25 L 300 35 L 360 15 L 360 90 L 10 90 Z"
        fill="rgba(19, 40, 75, 0.05)"
      />
    </Svg>
  </View>
);

const ProgressBarItem = ({ label, amount, percentage }: any) => (
  <View style={styles.progressItem}>
    <View style={styles.progressItemRow}>
      <Text style={styles.progressItemLabel}>{label}</Text>
      <Text style={styles.progressItemAmount}>{amount}</Text>
    </View>
    <View style={styles.progressBarTrack}>
      <View style={[styles.progressBarFill, { width: percentage }]} />
    </View>
  </View>
);

const TransactionItem = ({ title, date, amount }: any) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionLeft}>
      <View style={styles.transactionIconBox}>
        <ClipboardList size={18} color="#5B738B" />
      </View>
      <View>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
    </View>
    <Text style={styles.transactionAmount}>{amount}</Text>
  </View>
);

export const WalletScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
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
       </View>

       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
         
         {/* Total Spent Card */}
         <View style={styles.totalSpentCard}>
           {/* Fake subtle grid inside card */}
           <View style={styles.totalGridCols}>
             <View style={styles.gridLineV} /><View style={styles.gridLineV} /><View style={styles.gridLineV} />
           </View>
           <View style={styles.totalGridRows}>
             <View style={styles.gridLineH} />
           </View>

           <View style={{ zIndex: 2 }}>
             <Text style={styles.totalSpentLabel}>TOTAL SPENT</Text>
             <Text style={styles.totalSpentAmount}>$283<Text style={styles.amountDecimal}>.50</Text></Text>
             <Text style={styles.totalSpentSub}>This month • Updated today</Text>
           </View>
         </View>

         {/* Spending Trend */}
         <View style={styles.card}>
           <Text style={styles.cardTitle}>SPENDING TREND</Text>
           <CustomLineChart />
           <View style={styles.legendRow}>
             <View style={styles.legendDash} />
             <Text style={styles.legendText}>Your spending</Text>
           </View>
         </View>

         {/* Expense Breakdown */}
         <View style={styles.card}>
           <View style={styles.cardTitleRow}>
             <ArrowDownRight size={18} color="#13284B" style={{ marginRight: 6 }} />
             <Text style={styles.cardTitleLine}>Expense Breakdown</Text>
           </View>
           
           <ProgressBarItem label="Court Rentals" amount="$90.00" percentage="35%" />
           <ProgressBarItem label="Shuttlecocks" amount="$168.00" percentage="65%" />
           <ProgressBarItem label="Equipment & Gear" amount="$25.50" percentage="10%" />
         </View>

         {/* Transaction History */}
         <Text style={styles.sectionTitle}>TRANSACTION HISTORY</Text>
         <View style={styles.transactionsContainer}>
           <TransactionItem title="Court 2 Booking" date="Today • Court" amount="-$40.00" />
           <TransactionItem title="Shuttle Tube (AS-30)" date="Yesterday • Gear" amount="-$35.00" />
           <TransactionItem title="Court 1 Booking" date="Mar 11 • Court" amount="-$10.00" />
           <TransactionItem title="Grip Tape" date="Mar 10 • Gear" amount="-$8.50" />
         </View>

       </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  topSection: { backgroundColor: '#13284B', paddingHorizontal: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerLogoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3A2E22', justifyContent: 'center', alignItems: 'center', opacity: 0.8 },
  headerLogoText: { color: '#DEA54B', fontWeight: 'bold', fontSize: 18 },
  headerTextContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#8A9BB3', fontSize: 13, marginTop: 2 },
  headerIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  
  totalSpentCard: { backgroundColor: '#0D1E3A', marginHorizontal: 20, marginTop: 16, borderRadius: 20, padding: 24, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  totalGridCols: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', justifyContent: 'space-evenly', opacity: 0.05 },
  gridLineV: { width: 1, backgroundColor: '#FFF', height: '100%' },
  totalGridRows: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', opacity: 0.05 },
  gridLineH: { height: 1, backgroundColor: '#FFF', width: '100%' },
  totalSpentLabel: { color: '#DEA54B', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  totalSpentAmount: { color: '#208B59', fontSize: 48, fontWeight: '800', marginTop: 8 },
  amountDecimal: { fontSize: 36 },
  totalSpentSub: { color: '#8A9BB3', fontSize: 12, marginTop: 8 },

  card: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 20, borderRadius: 20, padding: 24, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardTitle: { fontSize: 13, color: '#5B738B', fontWeight: '600', letterSpacing: 1, marginBottom: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cardTitleLine: { fontSize: 15, fontWeight: '700', color: '#13284B' },
  
  chartWrapper: { height: 100, justifyContent: 'flex-end', marginBottom: 16 },
  chartGridLine: { height: 1, backgroundColor: '#F0F2F5', width: '100%', marginBottom: 30 },
  chartGridLineLast: { height: 1, backgroundColor: '#F0F2F5', width: '100%' },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDash: { width: 12, height: 2, backgroundColor: '#13284B', marginRight: 8 },
  legendText: { fontSize: 12, color: '#5B738B' },

  progressItem: { marginBottom: 20 },
  progressItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressItemLabel: { fontSize: 13, color: '#5B738B' },
  progressItemAmount: { fontSize: 14, fontWeight: '700', color: '#13284B' },
  progressBarTrack: { height: 6, backgroundColor: '#F0F2F5', borderRadius: 3 },
  progressBarFill: { height: '100%', backgroundColor: '#5B738B', borderRadius: 3 },

  sectionTitle: { fontSize: 13, color: '#5B738B', fontWeight: '600', letterSpacing: 1, marginHorizontal: 24, marginTop: 32, marginBottom: 16 },
  transactionsContainer: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  transactionLeft: { flexDirection: 'row', alignItems: 'center' },
  transactionIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  transactionTitle: { fontSize: 15, fontWeight: '600', color: '#13284B', marginBottom: 4 },
  transactionDate: { fontSize: 12, color: '#8A9BB3' },
  transactionAmount: { fontSize: 16, fontWeight: '700', color: '#13284B' },
});
