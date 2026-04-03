import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Bell, User, ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const days = [
  { day: 'Mon', date: 15, hasEvent: false },
  { day: 'Tue', date: 16, hasEvent: true },
  { day: 'Wed', date: 17, hasEvent: true },
  { day: 'Thu', date: 18, hasEvent: true },
  { day: 'Fri', date: 19, hasEvent: false },
  { day: 'Sat', date: 20, hasEvent: true }, // The image shows dot on 20, wait, Monday has the dot. "Sat 20" has a dot when not selected. Yes, I'll put events for styling.
  { day: 'Sun', date: 21, hasEvent: false }
];

const EventCard = ({ title, tag, isClass, details, isConfirmed }: any) => (
  <View style={styles.eventCardWrapper}>
    <View style={styles.accentBorder} />
    <View style={styles.eventCard}>
      <View style={styles.eventCardTop}>
        <View style={styles.tagRow}>
          <View style={[styles.tag, isClass ? styles.tagClass : styles.tagSession]}>
            <Text style={[styles.tagText, isClass ? styles.tagTextClass : styles.tagTextSession]}>{tag}</Text>
          </View>
          {isConfirmed && (
            <View style={styles.confirmedRow}>
              <Check size={12} color="#208B59" style={{ marginRight: 4 }} />
              <Text style={styles.confirmedText}>Confirmed</Text>
            </View>
          )}
        </View>
        
        {!isConfirmed && (
             <View style={styles.actionButtonsRow}>
               <TouchableOpacity style={styles.actionAccept}>
                 <Check size={16} color="#208B59" />
               </TouchableOpacity>
               <TouchableOpacity style={styles.actionDecline}>
                 <X size={16} color="#5B738B" />
               </TouchableOpacity>
             </View>
        )}
      </View>
      
      <Text style={styles.eventTitle}>{title}</Text>
      <Text style={styles.eventDetails}>{details}</Text>
    </View>
  </View>
);

export const ScheduleScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [activeDate, setActiveDate] = useState(15);

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
         
         <View style={styles.pageHeader}>
           <Text style={styles.pageTitle}>Schedule</Text>
           <Text style={styles.pageDateText}>March 2026</Text>
         </View>

         <View style={styles.dateSelectorRow}>
           <TouchableOpacity><ChevronLeft size={20} color="#5B738B" /></TouchableOpacity>
           {days.map((item) => {
             const isActive = activeDate === item.date;
             return (
               <TouchableOpacity 
                 key={item.date} 
                 style={[styles.dateChip, isActive && styles.dateChipActive]}
                 onPress={() => setActiveDate(item.date)}
               >
                 <Text style={[styles.dayText, isActive && styles.textActive]}>{item.day}</Text>
                 <Text style={[styles.dateText, isActive && styles.textActive]}>{item.date}</Text>
                 {!isActive && item.hasEvent && <View style={styles.eventDot} />}
                 {isActive && item.hasEvent && <View style={[styles.eventDot, { backgroundColor: '#FFF' }]} />}
               </TouchableOpacity>
             )
           })}
           <TouchableOpacity><ChevronRight size={20} color="#5B738B" /></TouchableOpacity>
         </View>

         {activeDate === 15 ? (
           <>
             <View style={styles.summaryCard}>
               <View>
                 <Text style={styles.summaryDate}>Mon, Mar 15</Text>
                 <Text style={styles.summaryCount}>1 event</Text>
               </View>
               <View style={styles.durationChip}>
                 <Clock size={14} color="#208B59" style={{ marginRight: 6 }} />
                 <Text style={styles.durationText}>90 min</Text>
               </View>
             </View>
             
             <EventCard 
                title="Badminton Session"
                tag="SESSION"
                isConfirmed={true}
                details="6:00 PM • 90 min • Main Hall, Court 1"
             />
           </>
         ) : (
           <>
             <View style={styles.summaryCard}>
               <View>
                 <Text style={styles.summaryDate}>Sat, Mar 20</Text>
                 <Text style={styles.summaryCount}>2 events</Text>
               </View>
               <View style={styles.durationChip}>
                 <Clock size={14} color="#208B59" style={{ marginRight: 6 }} />
                 <Text style={styles.durationText}>180 min</Text>
               </View>
             </View>

             <EventCard 
                title="Weekend Open Play"
                tag="SESSION"
                isConfirmed={false}
                details="10:00 AM • 120 min • Main Hall"
             />
             <EventCard 
                title="Coaching Session"
                tag="CLASS"
                isClass={true}
                isConfirmed={false}
                details="2:00 PM • 60 min • Court 2"
             />
           </>
         )}

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
  
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginHorizontal: 20, marginTop: 24, marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#13284B' },
  pageDateText: { fontSize: 15, color: '#5B738B' },

  dateSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 24 },
  dateChip: { width: 44, paddingVertical: 10, backgroundColor: '#FFF', borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  dateChipActive: { backgroundColor: '#208B59' },
  dayText: { fontSize: 12, color: '#5B738B', marginBottom: 4 },
  dateText: { fontSize: 16, fontWeight: '700', color: '#13284B' },
  textActive: { color: '#FFF' },
  eventDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#DEA54B', marginTop: 4 },

  summaryCard: { marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  summaryDate: { fontSize: 16, fontWeight: '700', color: '#13284B', marginBottom: 4 },
  summaryCount: { fontSize: 13, color: '#5B738B' },
  durationChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  durationText: { color: '#208B59', fontWeight: '700', fontSize: 14 },

  eventCardWrapper: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, backgroundColor: '#FFF', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1, overflow: 'hidden' },
  accentBorder: { width: 6, backgroundColor: '#DEA54B' },
  eventCard: { flex: 1, padding: 20 },
  eventCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, minHeight: 28 },
  tagRow: { flexDirection: 'row', alignItems: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 12 },
  tagSession: { backgroundColor: '#E8F5E9' },
  tagClass: { backgroundColor: '#FFF3E0' },
  tagText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  tagTextSession: { color: '#208B59' },
  tagTextClass: { color: '#C18D37' },
  confirmedRow: { flexDirection: 'row', alignItems: 'center' },
  confirmedText: { fontSize: 12, color: '#208B59', fontWeight: '600' },
  actionButtonsRow: { flexDirection: 'row', alignItems: 'center', position: 'absolute', right: 0, top: -4 },
  actionAccept: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  actionDecline: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: '#13284B', marginBottom: 6 },
  eventDetails: { fontSize: 13, color: '#5B738B' }
});
