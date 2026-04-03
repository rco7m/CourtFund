import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Bell, User, Plus, Package, Sparkles, Check, AlertTriangle, ArrowDownRight, ClipboardList } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LogGearModal } from '../components/LogGearModal';

const InventoryCard = ({ title, count, unit, trackColor, percentage, warning, sub1, sub2 }: any) => (
  <View style={styles.inventoryCard}>
    <View style={styles.invCardHeader}>
      <Package size={20} color="#5B738B" />
      {warning && <AlertTriangle size={18} color="#E07A5F" />}
    </View>
    <Text style={styles.invTitle}>{title}</Text>
    <View style={styles.invCountRow}>
      <Text style={styles.invCount}>{count}</Text>
      <Text style={styles.invUnit}>{unit}</Text>
    </View>
    <View style={styles.invProgressBarBg}>
      <View style={[styles.invProgressBarFill, { width: percentage, backgroundColor: trackColor }]} />
    </View>
    <View style={styles.invSubRow}>
      <Text style={styles.invSubText}>{sub1}</Text>
    </View>
    <View style={styles.invSubRow}>
      <Text style={styles.invSubText}>{sub2}</Text>
    </View>
  </View>
);

const PurchaseItem = ({ title, date, amount }: any) => (
  <View style={styles.purchaseItem}>
    <View style={styles.purchaseLeft}>
      <View style={styles.purchaseIconBox}>
        <ClipboardList size={18} color="#5B738B" />
      </View>
      <View>
        <Text style={styles.purchaseTitle}>{title}</Text>
        <Text style={styles.purchaseDate}>{date}</Text>
      </View>
    </View>
    <Text style={styles.purchaseAmount}>{amount}</Text>
  </View>
);

export const GearScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);

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
           <Text style={styles.pageTitle}>Equipment</Text>
           <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
             <Plus color="#FFF" size={16} style={{ marginRight: 4 }} />
             <Text style={styles.addButtonText}>Add Gear</Text>
           </TouchableOpacity>
         </View>

         {/* AI Recommendation Alert */}
         <View style={styles.aiAlertCard}>
           <View style={styles.aiAlertIconBox}>
             <Sparkles size={18} color="#C18D37" />
           </View>
           <View style={styles.aiAlertContent}>
             <Text style={styles.aiAlertTitle}>AI Order Recommendation</Text>
             <Text style={styles.aiAlertText}>
               Order <Text style={{fontWeight: '700'}}>6 shuttle tubes</Text> and <Text style={{fontWeight: '700'}}>8 grip rolls</Text> by <Text style={{fontWeight: '700'}}>Thursday</Text> to maintain inventory flow.
             </Text>
           </View>
           <TouchableOpacity style={styles.aiAlertButton}>
             <Check size={14} color="#FFF" style={{ marginRight: 4 }} />
             <Text style={styles.aiAlertButtonText}>Done</Text>
           </TouchableOpacity>
         </View>

         {/* Grid */}
         <View style={styles.gridContainer}>
           <InventoryCard 
             title="Yonex AS-30 Shuttles" count="3" unit="Tubes"
             percentage="20%" trackColor="#E07A5F" warning={true}
             sub1="↘ 2 tubes/week" sub2="~7 days remaining"
           />
           <InventoryCard 
             title="Victor Rackets" count="8" unit="Units"
             percentage="70%" trackColor="#208B59" warning={false}
             sub1="↘ 1 unit/month" sub2="~60 days remaining"
           />
           <InventoryCard 
             title="Badminton Nets" count="4" unit="Units"
             percentage="60%" trackColor="#208B59" warning={false}
             sub1="↘ Replaced quarterly" sub2="~45 days remaining"
           />
           <InventoryCard 
             title="Grip Tape Rolls" count="5" unit="Rolls"
             percentage="25%" trackColor="#E07A5F" warning={true}
             sub1="↘ 3 rolls/week" sub2="~12 days remaining"
           />
         </View>

         <Text style={styles.sectionTitle}>RECENT PURCHASES</Text>
         <View style={styles.purchasesContainer}>
           <PurchaseItem title="Shuttle Tube (AS-30)" date="Yesterday" amount="$35.00" />
           <PurchaseItem title="Grip Tape" date="Mar 10" amount="$8.50" />
           <PurchaseItem title="Shuttle Tubes × 3" date="Mar 12" amount="$105.00" />
           <PurchaseItem title="Grip Tape × 2" date="Mar 11" amount="$17.00" />
           <View style={{ borderBottomWidth: 0 }}><PurchaseItem title="Net Replacement" date="Mar 8" amount="$28.00" /></View>
         </View>

         <Text style={styles.sectionTitle}>PRICE COMPARISON</Text>
         <View style={styles.priceContainer}>
           <View style={styles.priceItem}>
             <View>
               <Text style={styles.priceTitle}>Current Supplier</Text>
               <Text style={styles.priceSubTitle}>AS-30 Tube</Text>
             </View>
             <Text style={styles.priceAmount}>$35.00</Text>
           </View>
           <View style={styles.priceItemGood}>
             <View>
               <Text style={styles.priceTitleGood}>BadmintonDirect</Text>
               <Text style={styles.priceSubTitleGood}>AS-30 Tube</Text>
             </View>
             <View style={{ alignItems: 'flex-end' }}>
               <Text style={styles.priceAmountGood}>$28.50</Text>
               <Text style={styles.priceSaveGood}>Save $6.50</Text>
             </View>
           </View>
         </View>

       </ScrollView>

       <LogGearModal 
         visible={modalVisible} 
         onClose={() => setModalVisible(false)}
         onSubmit={() => console.log("Added gear")}
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
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#13284B' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#208B59', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  addButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },

  aiAlertCard: { marginHorizontal: 20, backgroundColor: '#E8EBEF', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  aiAlertIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5DEB3', justifyContent: 'center', alignItems: 'center', marginRight: 12 }, // Faint gold bg
  aiAlertContent: { flex: 1, marginRight: 12 },
  aiAlertTitle: { fontSize: 14, fontWeight: '700', color: '#13284B', marginBottom: 4 },
  aiAlertText: { fontSize: 13, color: '#5B738B', lineHeight: 18 },
  aiAlertButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#208B59', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  aiAlertButtonText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, justifyContent: 'space-between' },
  inventoryCard: { width: '47%', backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 12, marginHorizontal: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  invCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  invTitle: { fontSize: 15, fontWeight: '600', color: '#13284B', marginBottom: 8 },
  invCountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  invCount: { fontSize: 24, fontWeight: '800', color: '#13284B', marginRight: 6 },
  invUnit: { fontSize: 13, color: '#5B738B' },
  invProgressBarBg: { height: 6, backgroundColor: '#F0F2F5', borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  invProgressBarFill: { height: '100%', borderRadius: 3 },
  invSubRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  invSubText: { fontSize: 11, color: '#5B738B' },

  sectionTitle: { fontSize: 13, color: '#5B738B', fontWeight: '600', letterSpacing: 1, marginHorizontal: 24, marginTop: 24, marginBottom: 16 },
  purchasesContainer: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 20, paddingHorizontal: 20, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  purchaseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  purchaseLeft: { flexDirection: 'row', alignItems: 'center' },
  purchaseIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  purchaseTitle: { fontSize: 15, fontWeight: '600', color: '#13284B', marginBottom: 4 },
  purchaseDate: { fontSize: 12, color: '#8A9BB3' },
  purchaseAmount: { fontSize: 16, fontWeight: '700', color: '#13284B' },

  priceContainer: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 20, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, overflow: 'hidden' },
  priceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  priceTitle: { fontSize: 15, fontWeight: '600', color: '#13284B', marginBottom: 2 },
  priceSubTitle: { fontSize: 12, color: '#8A9BB3' },
  priceAmount: { fontSize: 15, fontWeight: '700', color: '#13284B' },
  
  priceItemGood: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#E8F5E9' }, // Light green
  priceTitleGood: { fontSize: 15, fontWeight: '600', color: '#13284B', marginBottom: 2 },
  priceSubTitleGood: { fontSize: 12, color: '#208B59' },
  priceAmountGood: { fontSize: 15, fontWeight: '700', color: '#208B59', marginBottom: 2 },
  priceSaveGood: { fontSize: 12, color: '#208B59' }
});
