import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Package, Sparkles, Check, AlertTriangle, ClipboardList } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LogGearModal } from '../components/LogGearModal';
import { AppHeader } from '../components/AppHeader';
import { createGearItem, listMyGear } from '../data/gear';
import { createExpense } from '../data/expenses';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

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
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [gearItems, setGearItems] = useState<any[]>([]);

  const load = async () => {
    try {
      setErrorText(null);
      setLoading(true);
      const rows = await listMyGear();
      setGearItems(rows);
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
          {loading ? (
            <Text style={{ color: C.neutral, paddingHorizontal: 20 }}>Loading…</Text>
          ) : errorText ? (
            <Text style={{ color: '#F87171', paddingHorizontal: 20, fontWeight: '700' }}>{errorText}</Text>
          ) : gearItems.length === 0 ? (
            <Text style={{ color: C.neutral, paddingHorizontal: 20 }}>No gear yet. Log a purchase.</Text>
          ) : (
            gearItems.map(item => {
              const low = (item.quantity ?? 0) <= 1;
              const cat = String(item.category || 'other').toUpperCase();
              return (
                <View key={item.id} style={s.gearCard}>
                  <View style={s.gearHeader}>
                    <View style={s.catBadge}><Text style={s.catText}>{cat}</Text></View>
                    {low && <AlertTriangle size={14} color="#F87171" />}
                  </View>
                  <Text style={s.gearName}>{item.name}</Text>
                  <View style={s.stockRow}>
                    <Text style={[s.stockCount, low && { color: '#F87171' }]}>{item.quantity ?? 1}</Text>
                    <Text style={s.unitText}>{item.unit ?? 'pcs'} left</Text>
                  </View>
                  <View style={s.progressTrack}>
                    <View style={[s.progressFill, { width: `${Math.min(100, ((item.quantity ?? 1) / 15) * 100)}%`, backgroundColor: low ? '#F87171' : C.accent }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Recent Purchases */}
        <View style={s.sectionHeader}>
          <ClipboardList size={16} color={C.neutral} style={{ marginRight: 8 }} />
          <Text style={s.sectionTitle}>Recent Purchases</Text>
        </View>
        <View style={s.listCard}>
          {(gearItems ?? []).slice(0, 3).map((g, idx) => {
            const dt = g.purchase_date ? new Date(g.purchase_date) : null;
            const dateLabel = dt ? dt.toLocaleDateString() : '—';
            const price = g.cost != null ? Number(g.cost).toFixed(2) : '0.00';
            return <PurchaseItem key={g.id} name={g.name} date={dateLabel} price={price} isLast={idx === Math.min(2, gearItems.length - 1)} />;
          })}
        </View>
      </ScrollView>

      <LogGearModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        onSubmit={async (data) => {
          const amount = Number.parseFloat(data.price || '0');
          const qty = Number.parseInt(data.quantity || '1', 10) || 1;
          const created = await createGearItem({
            name: data.name || 'Gear Item',
            category: 'other',
            brand: null,
            quantity: qty,
            unit: 'pcs',
            purchase_date: new Date().toISOString().slice(0, 10),
            cost: Number.isFinite(amount) ? amount : null,
            status: 'active',
            notes: data.splitWith?.length ? `Split with ${data.splitWith.length} friend(s)` : null,
          });
          if (Number.isFinite(amount) && amount > 0) {
            await createExpense({ type: 'gear', amount, note: `Gear: ${created.name}` });
          }
          await load();
        }} 
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
