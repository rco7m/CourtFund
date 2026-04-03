import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, User, Plus, Sparkles, ClipboardList, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LogSessionModal } from '../components/LogSessionModal';
import { useRoute } from '@react-navigation/native';

const SessionCard = ({ title, date, stars, insight }: any) => (
  <View style={styles.sessionCard}>
    <View style={styles.sessionHeader}>
      <View style={styles.sessionTitleRow}>
        <ClipboardList color="#DEA54B" size={16} style={{ marginRight: 8 }} />
        <View>
           <Text style={styles.sessionTitle}>{title}</Text>
           <Text style={styles.sessionDate}>{date}</Text>
        </View>
      </View>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={14} color="#DEA54B" fill={s <= stars ? '#DEA54B' : 'transparent'} style={{ marginLeft: 2 }} />
        ))}
      </View>
    </View>
    <View style={styles.insightBox}>
      <View style={styles.insightHeader}>
        <Sparkles color="#DEA54B" size={12} style={{ marginRight: 4 }} />
        <Text style={styles.insightLabel}>AI INSIGHT</Text>
      </View>
      <Text style={styles.insightText}>{insight}</Text>
    </View>
  </View>
);

export const SessionLogScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (route.params?.openModal) {
      setModalVisible(true);
    }
  }, [route.params]);

  const sessions = [
    { title: 'Doubles — Advanced', date: 'Mar 14 • 90 min', stars: 4, insight: 'Strong doubles play. Your net game improved 12% over last 5 sessions.' },
    { title: 'Class — Intermediate', date: 'Mar 12 • 60 min', stars: 3, insight: 'Consistent performance. Footwork drills paying off.' },
    { title: 'Singles — Advanced', date: 'Mar 10 • 90 min', stars: 5, insight: 'Peak performance! Your win rate in singles is up 20% this month.' },
    { title: 'Drills — Advanced', date: 'Mar 8 • 60 min', stars: 4, insight: 'Good drill session. Defense reactions getting sharper.' }
  ];

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

       <View style={styles.pageHeader}>
         <Text style={styles.pageTitle}>Session Log</Text>
         <TouchableOpacity style={styles.logButton} onPress={() => setModalVisible(true)}>
           <Plus color="#FFF" size={16} style={{ marginRight: 4 }} />
           <Text style={styles.logButtonText}>Log Session</Text>
         </TouchableOpacity>
       </View>

       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
         {sessions.map((s, i) => (
           <SessionCard key={i} {...s} />
         ))}
       </ScrollView>

       <LogSessionModal 
         visible={modalVisible} 
         onClose={() => setModalVisible(false)}
         onSubmit={() => console.log("Submitted")}
       />
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
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 24, marginBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#13284B' },
  logButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#208B59', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  logButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  sessionCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  sessionTitleRow: { flexDirection: 'row', paddingTop: 2 },
  sessionTitle: { fontSize: 16, fontWeight: '700', color: '#13284B', marginBottom: 4 },
  sessionDate: { fontSize: 13, color: '#5B738B' },
  starsRow: { flexDirection: 'row' },
  insightBox: { backgroundColor: '#F5FAE8', padding: 16, borderRadius: 16 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  insightLabel: { fontSize: 11, fontWeight: 'bold', color: '#13284B', letterSpacing: 0.5 },
  insightText: { fontSize: 13, color: '#5B738B', lineHeight: 18 }
});
