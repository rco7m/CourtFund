import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Bell, User, Calendar, Clock, Star, TrendingUp, Activity, Award } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const StatCard = ({ icon: Icon, value, label }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statIconBox}>
      <Icon size={20} color="#208B59" />
    </View>
    <View style={styles.statTextGroup}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
);

const ProgressBar = ({ label, percentage }: any) => (
  <View style={styles.skillBarContainer}>
    <View style={styles.skillBarTop}>
      <Text style={styles.skillLabel}>{label}</Text>
      <Text style={styles.skillPercent}>{percentage}</Text>
    </View>
    <View style={styles.skillBarTrack}>
      <View style={[styles.skillBarFill, { width: percentage }]} />
    </View>
  </View>
);

const RecentSession = ({ title, date, stars }: any) => (
  <View style={styles.recentSession}>
    <View>
      <Text style={styles.recentTitle}>{title}</Text>
      <Text style={styles.recentDate}>{date}</Text>
    </View>
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} color="#DEA54B" fill={s <= stars ? '#DEA54B' : 'transparent'} style={{ marginLeft: 2 }} />
      ))}
    </View>
  </View>
);

export const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
       {/* Global Header */}
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
            <TouchableOpacity style={[styles.headerIconWrapper, { backgroundColor: '#208B59', marginLeft: 12 }]}>
              <User color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
       </View>

       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
         
         <View style={styles.profileCard}>
           <View style={styles.avatarLarge}>
             <User size={36} color="#FFF" />
           </View>
           <View style={styles.profileInfo}>
             <Text style={styles.profileName}>Player Profile</Text>
             <Text style={styles.profileLevel}>Level: <Text style={{ color: '#DEA54B', fontWeight: 'bold' }}>A-</Text></Text>
             <Text style={styles.profileDesc}>Based on 5 logged sessions</Text>
           </View>
         </View>

         <View style={styles.gridContainer}>
           <StatCard icon={Calendar} value="5" label="SESSIONS" />
           <StatCard icon={Clock} value="6" label="HOURS PLAYED" />
           <StatCard icon={Star} value="4.0" label="AVG RATING" />
           <StatCard icon={TrendingUp} value="6 days" label="STREAK" />
         </View>

         <View style={styles.card}>
           <Text style={styles.cardTitle}>SESSIONS PER MONTH</Text>
           <View style={styles.chartContainer}>
             {/* Simple native bar chart approximation */}
             <View style={styles.barWrapper}><View style={[styles.barFill, { height: '30%', backgroundColor: '#8DB89B' }]} /><Text style={styles.barLabel}>Oct</Text></View>
             <View style={styles.barWrapper}><View style={[styles.barFill, { height: '50%', backgroundColor: '#8DB89B' }]} /><Text style={styles.barLabel}>Nov</Text></View>
             <View style={styles.barWrapper}><View style={[styles.barFill, { height: '40%', backgroundColor: '#8DB89B' }]} /><Text style={styles.barLabel}>Dec</Text></View>
             <View style={styles.barWrapper}><View style={[styles.barFill, { height: '70%', backgroundColor: '#8DB89B' }]} /><Text style={styles.barLabel}>Jan</Text></View>
             <View style={styles.barWrapper}><View style={[styles.barFill, { height: '50%', backgroundColor: '#8DB89B' }]} /><Text style={styles.barLabel}>Feb</Text></View>
             <View style={styles.barWrapper}><View style={[styles.barFill, { height: '90%', backgroundColor: '#208B59' }]} /><Text style={styles.barLabel}>Mar</Text></View>
           </View>
         </View>

         <View style={styles.injuryCard}>
           <View style={styles.injuryBorder} />
           <View style={styles.injuryContent}>
             <View style={styles.injuryIconBox}>
               <Activity size={20} color="#C18D37" />
             </View>
             <View style={styles.injuryTextGrp}>
               <Text style={styles.injuryTitle}>Injury Risk: Moderate</Text>
               <Text style={styles.injuryDesc}>~5 sessions this week. Consider taking a rest day.</Text>
             </View>
           </View>
         </View>

         <View style={styles.card}>
           <View style={styles.skillHeaderRow}>
             <Text style={styles.cardTitle}>SKILL PROGRESSION</Text>
             <View style={styles.skillBadge}>
               <Award size={14} color="#C18D37" />
               <Text style={styles.skillBadgeText}>A-</Text>
             </View>
           </View>
           <Text style={styles.skillSubTitle}>Calculated from your 5 session logs (type, level & performance ratings)</Text>
           
           <ProgressBar label="Net Play" percentage="77%" />
           <ProgressBar label="Smash Power" percentage="72%" />
           <ProgressBar label="Footwork" percentage="79%" />
           <ProgressBar label="Defense" percentage="72%" />
         </View>

         <Text style={styles.sectionTitle}>RECENT SESSIONS</Text>
         <View style={styles.listCard}>
           <RecentSession title="Doubles" date="Today • 60 min" stars={4} />
           <RecentSession title="Doubles" date="Mar 14 • 90 min" stars={4} />
           <RecentSession title="Class" date="Mar 12 • 60 min" stars={3} />
           <View style={{ borderBottomWidth: 0 }}>
             <RecentSession title="Singles" date="Mar 10 • 90 min" stars={5} />
           </View>
         </View>

         <Text style={styles.sectionTitle}>SPENDING THIS MONTH</Text>
         <View style={styles.spendingCard}>
           <View style={{ flex: 1 }}>
             <View style={styles.spendRow}>
               <View style={[styles.spendDot, { backgroundColor: '#8DB89B' }]} />
               <Text style={styles.spendLabel}>Court Bookings</Text>
               <Text style={styles.spendAmount}>$90.00</Text>
             </View>
             <View style={styles.spendRow}>
               <View style={[styles.spendDot, { backgroundColor: '#208B59' }]} />
               <Text style={styles.spendLabel}>Equipment & Gear</Text>
               <Text style={styles.spendAmount}>$193.50</Text>
             </View>
           </View>
           <View style={styles.totalBox}>
             <Text style={styles.totalValue}>$283.50</Text>
             <Text style={styles.totalLabel}>Total</Text>
           </View>
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

  profileCard: { backgroundColor: '#13284B', marginHorizontal: 20, marginTop: 24, borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#208B59', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  profileInfo: { flex: 1 },
  profileName: { color: '#FFF', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  profileLevel: { color: '#8A9BB3', fontSize: 14, marginBottom: 4 },
  profileDesc: { color: '#5B738B', fontSize: 13 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, justifyContent: 'space-between', marginTop: 16 },
  statCard: { width: '47%', backgroundColor: '#FFF', padding: 16, borderRadius: 20, marginBottom: 12, marginHorizontal: 4, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  statIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statTextGroup: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#13284B' },
  statLabel: { fontSize: 10, fontWeight: 'bold', color: '#5B738B', letterSpacing: 0.5, marginTop: 2 },

  card: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 12, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  cardTitle: { fontSize: 13, color: '#5B738B', fontWeight: 'bold', letterSpacing: 1, marginBottom: 20 },
  
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  barWrapper: { alignItems: 'center', flex: 1 },
  barFill: { width: '70%', borderRadius: 8, minHeight: 20 },
  barLabel: { fontSize: 11, color: '#8A9BB3', marginTop: 8 },

  injuryCard: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 16, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  injuryBorder: { width: 6, backgroundColor: '#DEA54B' },
  injuryContent: { flex: 1, padding: 20, flexDirection: 'row', alignItems: 'center' },
  injuryIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  injuryTextGrp: { flex: 1 },
  injuryTitle: { fontSize: 15, fontWeight: '700', color: '#13284B', marginBottom: 4 },
  injuryDesc: { fontSize: 13, color: '#5B738B', lineHeight: 18 },

  skillHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  skillBadge: { flexDirection: 'row', alignItems: 'center' },
  skillBadgeText: { fontSize: 14, fontWeight: 'bold', color: '#13284B', marginLeft: 4 },
  skillSubTitle: { fontSize: 12, color: '#5B738B', marginBottom: 24, marginTop: -12, lineHeight: 18 },
  skillBarContainer: { marginBottom: 16 },
  skillBarTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  skillLabel: { fontSize: 13, fontWeight: '600', color: '#13284B' },
  skillPercent: { fontSize: 13, color: '#5B738B' },
  skillBarTrack: { height: 6, backgroundColor: '#F0F2F5', borderRadius: 3 },
  skillBarFill: { height: '100%', backgroundColor: '#208B59', borderRadius: 3 },

  sectionTitle: { fontSize: 13, color: '#5B738B', fontWeight: 'bold', letterSpacing: 1, marginHorizontal: 24, marginTop: 32, marginBottom: 16 },
  listCard: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 24, paddingHorizontal: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  recentSession: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  recentTitle: { fontSize: 16, fontWeight: '600', color: '#13284B', marginBottom: 4 },
  recentDate: { fontSize: 13, color: '#8A9BB3' },
  starsRow: { flexDirection: 'row' },

  spendingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1, marginBottom: 40 },
  spendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  spendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  spendLabel: { flex: 1, fontSize: 13, color: '#13284B' },
  spendAmount: { fontSize: 13, fontWeight: '600', color: '#5B738B' },
  totalBox: { alignItems: 'flex-end', marginLeft: 20 },
  totalValue: { fontSize: 24, fontWeight: '800', color: '#13284B', marginBottom: 4 },
  totalLabel: { fontSize: 12, color: '#8A9BB3' }
});
