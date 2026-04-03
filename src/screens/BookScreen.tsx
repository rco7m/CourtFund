import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, Bell, User } from 'lucide-react-native';

const DateBox = ({ day, date, active }: any) => (
  <View style={[styles.dateBox, active && styles.dateBoxActive]}>
    <Text style={[styles.dateDay, active && styles.dateTextActive]}>{day}</Text>
    <Text style={[styles.dateNum, active && styles.dateTextActive]}>{date}</Text>
  </View>
);

const PlayerChip = ({ initial, name, active, color }: any) => (
  <View style={[styles.playerChip, active && styles.playerChipActive]}>
    <View style={[styles.playerAvatar, { backgroundColor: active ? 'transparent' : color, borderColor: active ? '#FFF' : 'transparent', borderWidth: active ? 1 : 0 }]}>
      {active && color ? (
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{initial}</Text>
        </View>
      ) : (
        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{initial}</Text>
      )}
    </View>
    <Text style={[styles.playerName, active && styles.playerNameActive]}>{name}</Text>
  </View>
);

const CourtCard = ({ title, location, price }: any) => (
  <TouchableOpacity style={styles.courtCard}>
    <View>
      <Text style={styles.courtTitle}>{title}</Text>
      <Text style={styles.courtSubtitle}>{location} • {price}</Text>
    </View>
    <ChevronRightIcon color="#8A9BB3" size={20} />
  </TouchableOpacity>
);

export const BookScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Court Tracker</Text>
        <TouchableOpacity 
          style={[styles.headerIconWrapper, { backgroundColor: '#208B59' }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <User color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Date Strip */}
        <View style={styles.dateStrip}>
          <TouchableOpacity><ChevronLeft color="#5B738B" size={24} /></TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: 8 }}>
            <DateBox day="Mon" date="15" active />
            <DateBox day="Tue" date="16" />
            <DateBox day="Wed" date="17" />
            <DateBox day="Thu" date="18" />
            <DateBox day="Fri" date="19" />
            <DateBox day="Sat" date="20" />
            <DateBox day="Sun" date="21" />
          </ScrollView>
          <TouchableOpacity><ChevronRight color="#5B738B" size={24} /></TouchableOpacity>
        </View>

        {/* Players */}
        <Text style={styles.sectionLabel}>SELECT PLAYERS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <PlayerChip initial="A" name="Alex" color="#208B59" active />
          <PlayerChip initial="S" name="Sarah" color="#DEA54B" active />
          <PlayerChip initial="M" name="Mike" color="#13284B" active />
          <PlayerChip initial="J" name="Jin" color="#208B59" active />
          <PlayerChip initial="P" name="Priya" color="#E07A5F" />
          <PlayerChip initial="T" name="Tom" color="#5B738B" />
        </ScrollView>

        {/* Courts */}
        <View style={styles.courtsList}>
          <CourtCard title="Court 1" location="Main Hall" price="$40/hr" />
          <CourtCard title="Court 2" location="Annex Building" price="$40/hr" />
          <CourtCard title="Court 3" location="Main Hall" price="$40/hr" />
        </View>

        {/* Cost Split Preview */}
        <View style={styles.costPreviewCard}>
          <View>
            <Text style={styles.costPreviewLabel}>Cost Split Preview</Text>
            <Text style={styles.costPreviewValue}>4 Players → <Text style={{ color: '#208B59' }}>$10.00</Text> / ea</Text>
          </View>
          <View style={styles.costAvatarsRow}>
            {['A', 'S', 'M', 'J'].map((initial, i) => (
              <View key={i} style={[styles.miniAvatar, { backgroundColor: ['#2B8055', '#DEA54B', '#13284B', '#208B59'][i], marginLeft: i > 0 ? -8 : 0, zIndex: 4 - i }]}>
                 <Text style={styles.miniAvatarText}>{initial}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.confirmButton} activeOpacity={0.8}>
           <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#13284B' },
  headerIconWrapper: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  dateStrip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 24 },
  dateBox: { width: 56, height: 72, backgroundColor: '#FFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  dateBoxActive: { backgroundColor: '#208B59' },
  dateDay: { fontSize: 13, color: '#5B738B', fontWeight: '500', marginBottom: 4 },
  dateNum: { fontSize: 18, color: '#13284B', fontWeight: 'bold' },
  dateTextActive: { color: '#FFF' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#5B738B', letterSpacing: 1, paddingHorizontal: 20, marginBottom: 12 },
  playerChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 24, marginRight: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  playerChipActive: { backgroundColor: '#208B59' },
  playerAvatar: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  playerName: { fontSize: 15, fontWeight: '500', color: '#13284B' },
  playerNameActive: { color: '#FFF' },
  courtsList: { paddingHorizontal: 20, marginTop: 24 },
  courtCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 16, alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  courtTitle: { fontSize: 16, fontWeight: 'bold', color: '#13284B', marginBottom: 4 },
  courtSubtitle: { fontSize: 14, color: '#5B738B' },
  costPreviewCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginHorizontal: 20, marginTop: 8, marginBottom: 24, alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  costPreviewLabel: { fontSize: 13, color: '#5B738B', marginBottom: 4 },
  costPreviewValue: { fontSize: 16, fontWeight: 'bold', color: '#13284B' },
  costAvatarsRow: { flexDirection: 'row' },
  miniAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  miniAvatarText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  confirmButton: { backgroundColor: '#A2CBB6', marginHorizontal: 20, paddingVertical: 18, borderRadius: 20, alignItems: 'center', elevation: 3, shadowColor: '#208B59', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 }, // Disabled green sort of
  confirmButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});
