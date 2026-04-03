import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Modal } from 'react-native';
import { Bell, User, UserPlus, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const FriendCard = ({ initial, name, sessions, level, color }: any) => (
  <View style={styles.friendCard}>
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
    <View>
      <Text style={styles.friendName}>{name}</Text>
      <Text style={styles.friendStats}>{sessions} sessions • Level {level}</Text>
    </View>
  </View>
);

export const FriendsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);

  const friends = [
    { initial: 'S', name: 'Sarah', sessions: 38, level: 'B+', color: '#208B59' },
    { initial: 'M', name: 'Mike', sessions: 52, level: 'A-', color: '#C18D37' },
    { initial: 'J', name: 'Jin', sessions: 24, level: 'B', color: '#13284B' },
    { initial: 'L', name: 'Lena', sessions: 12, level: 'C+', color: '#5B738B' },
    { initial: 'R', name: 'Raj', sessions: 18, level: 'C+', color: '#E07A5F' }
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
         <Text style={styles.pageTitle}>Friends</Text>
         <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
           <UserPlus color="#FFF" size={16} style={{ marginRight: 6 }} />
           <Text style={styles.addButtonText}>Add Friend</Text>
         </TouchableOpacity>
       </View>

       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
         {friends.map((f, i) => (
           <FriendCard key={i} {...f} />
         ))}
       </ScrollView>

       <Modal visible={modalVisible} transparent animationType="fade">
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>Add a Friend</Text>
               <TouchableOpacity onPress={() => setModalVisible(false)}>
                 <X color="#5B738B" size={24} />
               </TouchableOpacity>
             </View>
             
             <View style={styles.inputContainer}>
               <Text style={styles.searchIcon}>🔍</Text>
               <TextInput 
                 style={styles.textInput}
                 placeholder="Enter friend's name..."
                 placeholderTextColor="#8A9BB3"
               />
             </View>

             <TouchableOpacity style={styles.submitButton} onPress={() => setModalVisible(false)}>
               <Text style={styles.submitButtonText}>Add Friend</Text>
             </TouchableOpacity>

           </View>
         </View>
       </Modal>
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
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#208B59', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  addButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  friendCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  friendName: { fontSize: 16, fontWeight: '700', color: '#13284B', marginBottom: 4 },
  friendStats: { fontSize: 13, color: '#5B738B' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#13284B' },
  inputContainer: { flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 16, height: 50, alignItems: 'center', paddingHorizontal: 16, marginBottom: 24 },
  searchIcon: { fontSize: 16, marginRight: 12, color: '#8A9BB3' },
  textInput: { flex: 1, fontSize: 15, color: '#13284B' },
  submitButton: { backgroundColor: '#A2CBB6', paddingVertical: 16, borderRadius: 16, alignItems: 'center' }, // Light green
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
