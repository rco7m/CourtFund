import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Package, Sparkles, Check, AlertTriangle, ClipboardList } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LogGearModal } from '../components/LogGearModal';
import { AppHeader } from '../components/AppHeader';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const GEAR_ITEMS = [
  { id: 1, name: 'Yonex AS-30', cat: 'Shuttles', stock: 2, unit: 'tubes', low: true },
  { id: 2, name: 'Wilson Pro Overgrip', cat: 'Grips', stock: 5, unit: 'rolls', low: false },
  { id: 3, name: 'Li-Ning No.1 0.65mm', cat: 'Strings', stock: 1, unit: 'set', low: true },
  { id: 4, name: 'Shoe Deodorizer', cat: 'Care', stock: 12, unit: 'uses', low: false },
];

const PurchaseItem = ({ name, date, price, isLast }: any) => (
  <View style={[s.purchaseRow, isLast && { borderBottomWidth: 0 }]}>
    <View>
      <Text style={s.purchaseName}>{name}</Text>
      <Text style={s.purchaseDate}>{date}</Text>
    </View>
    <Text style={s.purchasePrice}>${price}</Text>
  </View>
);

export const GearScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  return (
    <View style={s.container}>
      <View style={{ paddingTop: insets.top + 10 }}>
        <AppHeader />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={s.pageHeader}>
          <Text style={s.pageTitle}>Inventory</Text>
          <TouchableOpacity style={s.logBtn} onPress={() => setModalVisible(true)}>
            <Package size={14} color={C.accentBg} style={{ marginRight: 6 }} />
            <Text style={s.logBtnText}>Log Purchase</Text>
          </TouchableOpacity>
        </View>

        {/* AI Alert */}
        {!alertDismissed && (
        <View style={s.aiAlertCard}>
          <View style={s.aiAlertIconBox}>
            <Sparkles size={16} color={C.accent} />
          </View>
          <View style={s.aiAlertContent}>
            <Text style={s.aiAlertTitle}>AI Order Recommendation</Text>
            <Text style={s.aiAlertText}>
              Order <Text style={{ fontWeight: '700', color: C.text }}>6 shuttle tubes</Text> and{' '}
              <Text style={{ fontWeight: '700', color: C.text }}>8 grip rolls</Text> by{' '}
              <Text style={{ fontWeight: '700', color: C.text }}>Thursday</Text> to maintain inventory flow.
            </Text>
          </View>
          <TouchableOpacity style={s.aiAlertButton} onPress={() => setAlertDismissed(true)}>
            <Check size={13} color={C.accentBg} style={{ marginRight: 4 }} />
            <Text style={s.aiAlertButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
        )}

        {/* Inventory Grid */}
        <View style={s.gridContainer}>
          {GEAR_ITEMS.map(item => (
            <View key={item.id} style={s.gearCard}>
              <View style={s.gearHeader}>
                <View style={s.catBadge}><Text style={s.catText}>{item.cat}</Text></View>
                {item.low && <AlertTriangle size={14} color="#F87171" />}
              </View>
              <Text style={s.gearName}>{item.name}</Text>
              <View style={s.stockRow}>
                <Text style={[s.stockCount, item.low && { color: '#F87171' }]}>{item.stock}</Text>
                <Text style={s.unitText}>{item.unit} left</Text>
              </View>
              <View style={s.progressTrack}>
                <View style={[s.progressFill, { width: `${(item.stock / 15) * 100}%`, backgroundColor: item.low ? '#F87171' : C.accent }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Recent Purchases */}
        <View style={s.sectionHeader}>
          <ClipboardList size={16} color={C.neutral} style={{ marginRight: 8 }} />
          <Text style={s.sectionTitle}>Recent Purchases</Text>
        </View>
        <View style={s.listCard}>
          <PurchaseItem name="Yonex AS-30 (Tube)" date="Mar 12, 2024" price="35.00" />
          <PurchaseItem name="Wilson Overgrip (3-pk)" date="Mar 08, 2024" price="12.50" />
          <PurchaseItem name="Li-Ning No.1 String" date="Feb 28, 2024" price="15.00" isLast />
        </View>
      </ScrollView>

      <LogGearModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={(data) => console.log('Purchase logged:', data)} 
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: C.text },
  logBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  logBtnText: { color: C.accentBg, fontWeight: '700', fontSize: 13 },
  aiAlertCard: { flexDirection: 'row', backgroundColor: 'rgba(204,255,0,0.05)', marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.accentBorder, alignItems: 'center' },
  aiAlertIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.accentMuted, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  aiAlertContent: { flex: 1 },
  aiAlertTitle: { color: C.accent, fontSize: 13, fontWeight: '700', marginBottom: 4 },
  aiAlertText: { color: C.neutral, fontSize: 12, lineHeight: 18 },
  aiAlertButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginLeft: 12 },
  aiAlertButtonText: { color: C.accentBg, fontSize: 11, fontWeight: '800' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, justifyContent: 'space-between', marginBottom: 20 },
  gearCard: { width: '47%', backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  gearHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  catBadge: { backgroundColor: 'rgba(148,163,184,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  catText: { color: C.neutral, fontSize: 10, fontWeight: '700' },
  gearName: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 12, height: 40 },
  stockRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 10 },
  stockCount: { fontSize: 24, fontWeight: '800', color: C.accent, marginRight: 6 },
  unitText: { fontSize: 12, color: C.neutral },
  progressTrack: { height: 4, backgroundColor: 'rgba(148,163,184,0.1)', borderRadius: 2 },
  progressFill: { height: '100%', borderRadius: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: C.neutral, letterSpacing: 1.2, textTransform: 'uppercase' },
  listCard: { backgroundColor: C.card, marginHorizontal: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  purchaseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  purchaseName: { color: C.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  purchaseDate: { color: C.neutral, fontSize: 11 },
  purchasePrice: { color: C.accent, fontSize: 15, fontWeight: '700' },
});
