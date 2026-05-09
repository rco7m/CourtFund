import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Switch } from 'react-native';
import { X, Package, Check, Users } from 'lucide-react-native';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const FRIENDS = [
  { id: 1, name: 'Sarah', initial: 'S' },
  { id: 2, name: 'Mike', initial: 'M' },
  { id: 3, name: 'Jin', initial: 'J' },
  { id: 4, name: 'Lena', initial: 'L' },
  { id: 5, name: 'Raj', initial: 'R' },
];

interface LogGearModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const LogGearModal: React.FC<LogGearModalProps> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [notified, setNotified] = useState<number[]>([]);

  const handleClose = () => {
    setName(''); setPrice(''); setQuantity('1');
    setSplitEnabled(false); setSelectedFriends([]); setNotified([]);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({ name, price, quantity, splitWith: selectedFriends });
    handleClose();
  };

  const toggleFriend = (id: number) => {
    setSelectedFriends(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const notifyFriend = (id: number) => {
    setNotified(prev => [...prev, id]);
  };

  const totalPayers = selectedFriends.length + 1;
  const splitAmount = price && !isNaN(parseFloat(price))
    ? (parseFloat(price) / totalPayers).toFixed(2)
    : '0.00';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.headerRow}>
            <View style={s.titleRow}>
              <View style={s.titleIcon}><Package size={16} color={C.accent} /></View>
              <Text style={s.modalTitle}>Log Gear Purchase</Text>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <X size={16} color={C.neutral} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Item Name */}
            <View style={s.inputGroup}>
              <Text style={s.label}>ITEM NAME</Text>
              <TextInput
                style={s.textInput}
                placeholder="e.g. Yonex AS-30 Shuttles"
                placeholderTextColor={C.neutral}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Price + Qty */}
            <View style={s.row}>
              <View style={[s.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={s.label}>PRICE ($)</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="35.00"
                  placeholderTextColor={C.neutral}
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
              <View style={[s.inputGroup, { flex: 1 }]}>
                <Text style={s.label}>QUANTITY</Text>
                <TextInput
                  style={s.textInput}
                  placeholder="1"
                  placeholderTextColor={C.neutral}
                  keyboardType="number-pad"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
            </View>

            {/* Split toggle */}
            <View style={s.splitToggleRow}>
              <View style={s.splitToggleLeft}>
                <Users size={16} color={C.accent} style={{ marginRight: 10 }} />
                <Text style={s.splitToggleLabel}>Split cost with friends?</Text>
              </View>
              <View style={s.yesNoRow}>
                <TouchableOpacity
                  style={[s.yesNoBtn, splitEnabled && s.yesNoBtnActive]}
                  onPress={() => setSplitEnabled(true)}
                >
                  <Text style={[s.yesNoText, splitEnabled && { color: C.accentBg }]}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.yesNoBtn, !splitEnabled && s.yesNoBtnActive]}
                  onPress={() => { setSplitEnabled(false); setSelectedFriends([]); }}
                >
                  <Text style={[s.yesNoText, !splitEnabled && { color: C.accentBg }]}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Friends list */}
            {splitEnabled && (
              <View style={s.friendsList}>
                <Text style={s.label}>SELECT FRIENDS TO SPLIT WITH</Text>
                {FRIENDS.map(f => {
                  const selected = selectedFriends.includes(f.id);
                  const wasNotified = notified.includes(f.id);
                  return (
                    <View key={f.id} style={s.friendRow}>
                      <TouchableOpacity
                        style={[s.friendCheck, selected && s.friendCheckActive]}
                        onPress={() => toggleFriend(f.id)}
                      >
                        {selected && <Check size={14} color={C.accentBg} />}
                      </TouchableOpacity>
                      <View style={s.friendAvatar}>
                        <Text style={s.friendAvatarText}>{f.initial}</Text>
                      </View>
                      <Text style={s.friendName}>{f.name}</Text>
                      {selected && !wasNotified && (
                        <TouchableOpacity
                          style={s.notifyBtn}
                          onPress={() => notifyFriend(f.id)}
                        >
                          <Text style={s.notifyBtnText}>Notify</Text>
                        </TouchableOpacity>
                      )}
                      {selected && wasNotified && (
                        <View style={s.notifiedBadge}>
                          <Check size={12} color={C.accent} />
                        </View>
                      )}
                    </View>
                  );
                })}

                <View style={s.splitBreakdown}>
                  <Text style={s.breakdownTitle}>PAYMENT BREAKDOWN</Text>
                  <View style={s.breakdownRow}>
                    <Text style={s.breakdownLabel}>You (Host)</Text>
                    <Text style={s.breakdownAmount}>${splitAmount}</Text>
                  </View>
                  {FRIENDS.filter(f => selectedFriends.includes(f.id)).map(f => (
                    <View key={f.id} style={s.breakdownRow}>
                      <Text style={s.breakdownLabel}>{f.name}</Text>
                      <Text style={s.breakdownAmount}>${splitAmount}</Text>
                    </View>
                  ))}
                  <View style={s.totalSplitRow}>
                    <Text style={s.totalSplitLabel}>Total spending:</Text>
                    <Text style={s.totalSplitAmount}>${price || '0.00'}</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={s.submitButton} onPress={handleSubmit}>
            <Check size={16} color={C.accentBg} style={{ marginRight: 8 }} />
            <Text style={s.submitButtonText}>Add Purchase</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, maxHeight: '90%', borderTopWidth: 1, borderColor: C.border },
  handle: { width: 40, height: 4, backgroundColor: C.neutral, borderRadius: 2, alignSelf: 'center', marginBottom: 20, opacity: 0.4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  titleIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: C.accentMuted, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: C.accentBorder },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(148,163,184,0.1)', justifyContent: 'center', alignItems: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '700', color: C.neutral, marginBottom: 8, letterSpacing: 1.2 },
  textInput: { backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.border },
  row: { flexDirection: 'row' },
  splitToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.bg, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  splitToggleLeft: { flexDirection: 'row', alignItems: 'center' },
  splitToggleLabel: { color: C.text, fontSize: 14, fontWeight: '500' },
  yesNoRow: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 20, padding: 2 },
  yesNoBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 18 },
  yesNoBtnActive: { backgroundColor: C.accent },
  yesNoText: { color: C.neutral, fontWeight: '600', fontSize: 13 },
  friendsList: { backgroundColor: C.bg, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  friendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  friendCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: C.neutral, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  friendCheckActive: { backgroundColor: C.accent, borderColor: C.accent },
  friendAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.accentMuted, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: C.accentBorder },
  friendAvatarText: { color: C.accent, fontWeight: '700', fontSize: 12 },
  friendName: { flex: 1, color: C.text, fontSize: 14, fontWeight: '500' },
  notifyBtn: { backgroundColor: C.accentMuted, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: C.accentBorder },
  notifyBtnText: { color: C.accent, fontSize: 11, fontWeight: '700' },
  notifiedBadge: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  splitBreakdown: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border },
  breakdownTitle: { fontSize: 10, fontWeight: '700', color: C.neutral, marginBottom: 12, letterSpacing: 1 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  breakdownLabel: { color: C.neutral, fontSize: 13 },
  breakdownAmount: { color: C.text, fontSize: 13, fontWeight: '600' },
  totalSplitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  totalSplitLabel: { color: C.text, fontSize: 14, fontWeight: '600' },
  totalSplitAmount: { color: C.accent, fontSize: 20, fontWeight: '800' },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.accent, paddingVertical: 15, borderRadius: 30, marginTop: 8 },
  submitButtonText: { color: C.accentBg, fontSize: 15, fontWeight: '800' },
});
