import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Dimensions, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Plus, ArrowRight, Layers, ShoppingBag, Target, CreditCard, ArrowLeft,
} from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const CATEGORIES = [
  { id: 'court', label: 'Court Fees', icon: Layers },
  { id: 'gear', label: 'Gear & Equip', icon: ShoppingBag },
  { id: 'training', label: 'Coaching', icon: Target },
  { id: 'other', label: 'Other', icon: CreditCard },
];

const TxItem = ({ icon: Icon, title, sub, amount, isLast }: any) => (
  <View style={[s.txItem, isLast && { borderBottomWidth: 0 }]}>
    <View style={s.txIconBox}><Icon size={18} color={C.accent} /></View>
    <View style={{ flex: 1 }}>
      <Text style={s.txTitle}>{title}</Text>
      <Text style={s.txSub}>{sub}</Text>
    </View>
    <Text style={s.txAmount}>{amount}</Text>
  </View>
);

const AddTransactionModal = ({ visible, onClose }: any) => {
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('court');

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[s.modalHeader, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={onClose} style={s.modalBackBtn}>
            <ArrowLeft size={20} color={C.text} />
          </TouchableOpacity>
          <Text style={s.modalTitle}>Add Transaction</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={s.amountSection}>
            <Text style={s.amountLabel}>ENTER AMOUNT</Text>
            <View style={s.amountRow}>
              <Text style={s.dollarSign}>$</Text>
              <TextInput
                style={s.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={C.neutral}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>CATEGORY</Text>
            <View style={s.categoryGrid}>
              {CATEGORIES.map(cat => {
                const active = category === cat.id;
                return (
                  <TouchableOpacity key={cat.id} style={[s.catItem, active && s.catItemActive]}
                    onPress={() => setCategory(cat.id)}>
                    <cat.icon size={22} color={active ? C.accent : C.neutral} />
                    <Text style={[s.catLabel, active && { color: C.accent }]}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={onClose}>
            <Text style={s.submitBtnText}>LOG TRANSACTION</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const AddFundsModal = ({ visible, onClose }: any) => {
  const [amount, setAmount] = useState('');
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: insets.bottom + 24, borderTopWidth: 1, borderColor: C.border }}>
          <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 20 }}>Add Funds</Text>
          <Text style={{ color: C.neutral, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 }}>AMOUNT ($)</Text>
          <TextInput
            style={{ backgroundColor: C.bg, borderRadius: 14, paddingHorizontal: 16, height: 54, fontSize: 24, color: C.accent, fontWeight: '700', borderWidth: 1, borderColor: C.border, marginBottom: 20 }}
            placeholder="0.00" placeholderTextColor={C.neutral}
            keyboardType="decimal-pad" value={amount} onChangeText={setAmount}
          />
          <TouchableOpacity style={{ backgroundColor: C.accent, borderRadius: 30, paddingVertical: 15, alignItems: 'center' }} onPress={onClose}>
            <Text style={{ color: C.bg, fontWeight: '800', fontSize: 15 }}>CONFIRM TOP-UP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={onClose}>
            <Text style={{ color: C.neutral, fontSize: 14 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const WalletScreen = () => {
  const insets = useSafeAreaInsets();
  const [showAdd, setShowAdd] = useState(false);
  const [showFunds, setShowFunds] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ paddingTop: insets.top + 10 }}>
        <AppHeader />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={s.liquidityCard}>
          <View>
            <Text style={s.liquidityLabel}>TOTAL LIQUIDITY</Text>
            <Text style={s.liquidityAmount}>$ 4,825.00</Text>
          </View>
          <TouchableOpacity style={s.addFundsBtn} onPress={() => setShowFunds(true)}>
            <Plus size={14} color={C.bg} style={{ marginRight: 6 }} />
            <Text style={s.addFundsText}>Add Funds</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>MONTHLY SPENDING</Text>
          <View style={s.chartBox}>
            <Svg width="200" height="120" viewBox="0 0 200 120">
              <Path d="M 20 100 Q 60 40 100 80 T 180 20" fill="none" stroke={C.accent} strokeWidth="3" />
            </Svg>
          </View>
          <View style={s.spendingStats}>
            <View>
              <Text style={s.statLabel}>OUTFLOW</Text>
              <Text style={s.statValue}>-$420.50</Text>
            </View>
            <View>
              <Text style={s.statLabel}>SAVED</Text>
              <Text style={s.statValue}>+$12.00</Text>
            </View>
          </View>
        </View>

        <View style={s.activityHeader}>
          <Text style={s.activityTitle}>Activity History</Text>
          <TouchableOpacity onPress={() => {}}><Text style={s.viewAll}>View All</Text></TouchableOpacity>
        </View>
        <View style={s.card}>
          <TxItem icon={Layers} title="Downtown Arena Rental" sub="Yesterday • 14:30" amount="-$120.00" />
          <TxItem icon={ShoppingBag} title="Shuttlecocks Order" sub="Mar 12 • 10:15" amount="-$85.00" />
          <TxItem icon={Target} title="Coaching Session" sub="Mar 10 • 18:00" amount="-$60.00" isLast />
        </View>
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => setShowAdd(true)}>
        <Plus size={24} color={C.bg} />
      </TouchableOpacity>

      <AddTransactionModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <AddFundsModal visible={showFunds} onClose={() => setShowFunds(false)} />
    </View>
  );
};

const s = StyleSheet.create({
  liquidityCard:{backgroundColor:C.card,marginHorizontal:20,borderRadius:20,padding:20,flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16,borderWidth:1,borderColor:C.border},
  liquidityLabel:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1,marginBottom:4},
  liquidityAmount:{color:C.accent,fontSize:28,fontWeight:'800'},
  addFundsBtn:{flexDirection:'row',alignItems:'center',backgroundColor:C.accent,paddingHorizontal:14,paddingVertical:8,borderRadius:20},
  addFundsText:{color:C.bg,fontWeight:'700',fontSize:12},
  card:{backgroundColor:C.card,marginHorizontal:20,borderRadius:20,padding:20,marginBottom:16,borderWidth:1,borderColor:C.border},
  cardTitle:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1,marginBottom:20},
  chartBox:{alignItems:'center',marginBottom:20},
  spendingStats:{flexDirection:'row',justifyContent:'space-between'},
  statLabel:{color:C.neutral,fontSize:10,fontWeight:'700',marginBottom:4},
  statValue:{color:C.text,fontSize:18,fontWeight:'700'},
  activityHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginHorizontal:20,marginBottom:12},
  activityTitle:{color:C.text,fontSize:16,fontWeight:'700'},
  viewAll:{color:C.accent,fontSize:12,fontWeight:'600'},
  txItem:{flexDirection:'row',alignItems:'center',paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.border},
  txIconBox:{width:36,height:36,borderRadius:10,backgroundColor:C.accentMuted,justifyContent:'center',alignItems:'center',marginRight:12,borderWidth:1,borderColor:C.accentBorder},
  txTitle:{color:C.text,fontSize:14,fontWeight:'600',marginBottom:2},
  txSub:{color:C.neutral,fontSize:11},
  txAmount:{color:C.text,fontSize:14,fontWeight:'700'},
  fab:{position:'absolute',bottom:110,left:24,width:56,height:56,borderRadius:28,backgroundColor:C.accent,justifyContent:'center',alignItems:'center',elevation:5,shadowColor:C.accent,shadowOpacity:0.3,shadowRadius:10,shadowOffset:{width:0,height:5}},
  modalHeader:{flexDirection:'row',alignItems:'center',paddingHorizontal:20,paddingBottom:16},
  modalBackBtn:{width:36,height:36,borderRadius:10,backgroundColor:C.card,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:C.border},
  modalTitle:{color:C.text,fontSize:16,fontWeight:'700',flex:1,textAlign:'center'},
  amountSection:{alignItems:'center',paddingVertical:40},
  amountLabel:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1,marginBottom:10},
  amountRow:{flexDirection:'row',alignItems:'center'},
  dollarSign:{color:C.accent,fontSize:32,fontWeight:'700',marginRight:4},
  amountInput:{color:C.text,fontSize:48,fontWeight:'800',minWidth:100,textAlign:'center'},
  section:{paddingHorizontal:20,marginBottom:30},
  sectionLabel:{color:C.neutral,fontSize:10,fontWeight:'700',letterSpacing:1,marginBottom:16},
  categoryGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},
  catItem:{width:'48%',backgroundColor:C.card,borderRadius:16,padding:16,marginBottom:12,alignItems:'center',borderWidth:1,borderColor:C.border},
  catItemActive:{borderColor:C.accent,backgroundColor:C.accentMuted},
  catLabel:{color:C.neutral,fontSize:12,fontWeight:'600',marginTop:8},
  submitBtn:{backgroundColor:C.accent,marginHorizontal:20,paddingVertical:16,borderRadius:30,alignItems:'center'},
  submitBtnText:{color:C.bg,fontWeight:'800',fontSize:15},
});
