import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Bell, User, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const PlayerSplitRow = ({ initial, name, amount, status, color }: any) => (
  <View style={styles.playerSplitRow}>
    <View style={styles.playerInfoLeft}>
      <View style={[styles.playerObjAvatar, { backgroundColor: color || '#13284B' }]}>
        <Text style={styles.playerObjAvatarText}>{initial}</Text>
      </View>
      <View>
        <Text style={styles.playerObjName}>{name}</Text>
        <Text style={styles.playerObjAmount}>{amount}</Text>
      </View>
    </View>
    {status === 'Paid' ? (
      <View style={styles.paidStatus}>
        <Check color="#208B59" size={16} />
        <Text style={styles.paidText}>Paid</Text>
      </View>
    ) : (
      <TouchableOpacity style={styles.remindButton}>
        <Text style={styles.remindText}>Remind</Text>
      </TouchableOpacity>
    )}
  </View>
);

const SplitCard = ({ title, total, perPlayer, players }: any) => (
  <View style={styles.splitCard}>
    <View style={styles.splitCardHeader}>
      <Text style={styles.splitCardTitle}>{title}</Text>
      <Text style={styles.splitCardSub}>Total: {total} → <Text style={{ color: '#208B59', fontWeight: 'bold' }}>{perPlayer}</Text> per player</Text>
    </View>
    <View style={styles.splitCardContent}>
      {players.map((p: any, i: number) => (
        <PlayerSplitRow key={i} {...p} />
      ))}
    </View>
  </View>
);

export const SplitCostScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const yonexPlayers = [
    { initial: 'A', name: 'Alex', amount: '$4.38', status: 'Paid', color: '#13284B' },
    { initial: 'S', name: 'Sarah', amount: '$4.38', status: 'Paid', color: '#13284B' },
    { initial: 'M', name: 'Mike', amount: '$4.38', status: 'Remind', color: '#13284B' },
    { initial: 'J', name: 'Jin', amount: '$4.38', status: 'Paid', color: '#13284B' },
    { initial: 'P', name: 'Priya', amount: '$4.38', status: 'Remind', color: '#13284B' },
    { initial: 'T', name: 'Tom', amount: '$4.38', status: 'Paid', color: '#13284B' },
    { initial: 'L', name: 'Lena', amount: '$4.38', status: 'Paid', color: '#13284B' },
    { initial: 'R', name: 'Raj', amount: '$4.38', status: 'Remind', color: '#13284B' },
  ];

  const courtPlayers = [
    { initial: 'A', name: 'Alex', amount: '$10.00', status: 'Paid', color: '#13284B' },
    { initial: 'S', name: 'Sarah', amount: '$10.00', status: 'Paid', color: '#13284B' },
    { initial: 'M', name: 'Mike', amount: '$10.00', status: 'Paid', color: '#13284B' },
    { initial: 'J', name: 'Jin', amount: '$10.00', status: 'Remind', color: '#13284B' },
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

       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
         <Text style={styles.pageTitle}>Cost Splitting</Text>
         
         <SplitCard 
           title="Yonex AS-30 Shuttle Tube"
           total="$35.00"
           perPlayer="$4.38"
           players={yonexPlayers}
         />

         <SplitCard 
           title="Court 1 — Thursday 6 PM"
           total="$40.00"
           perPlayer="$10.00"
           players={courtPlayers}
         />
       </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  topSection: { backgroundColor: '#13284B', paddingHorizontal: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerLogoCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3A2E22', justifyContent: 'center', alignItems: 'center', opacity: 0.8 }, // From image logo seems a bit dim
  headerLogoText: { color: '#DEA54B', fontWeight: 'bold', fontSize: 18 },
  headerTextContainer: { flex: 1, marginLeft: 12 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerSubtitle: { color: '#8A9BB3', fontSize: 13, marginTop: 2 },
  headerIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#13284B', marginHorizontal: 20, marginTop: 24, marginBottom: 16 },
  splitCard: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 24, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden' },
  splitCardHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  splitCardTitle: { fontSize: 16, fontWeight: '700', color: '#13284B', marginBottom: 4 },
  splitCardSub: { fontSize: 14, color: '#5B738B' },
  splitCardContent: { paddingHorizontal: 20 },
  playerSplitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  playerInfoLeft: { flexDirection: 'row', alignItems: 'center' },
  playerObjAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  playerObjAvatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  playerObjName: { fontSize: 15, fontWeight: '500', color: '#13284B', marginBottom: 2 },
  playerObjAmount: { fontSize: 13, color: '#8A9BB3' },
  paidStatus: { flexDirection: 'row', alignItems: 'center' },
  paidText: { color: '#208B59', fontWeight: '600', fontSize: 14, marginLeft: 4 },
  remindButton: { backgroundColor: '#DEA54B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  remindText: { color: '#13284B', fontWeight: '600', fontSize: 13 },
});
