import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { X, Package, Check, Users, Plus, MinusCircle } from 'lucide-react-native';
import { findProfileById, listMyFriendProfiles, type FriendListItem } from '../data/friends';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
  success: '#22C55E',
};

interface LogGearModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

type SplitParticipant = {
  id: string;
  name: string;
  initial: string;
};

export const LogGearModal: React.FC<LogGearModalProps> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [participantCode, setParticipantCode] = useState('');
  const [participantError, setParticipantError] = useState<string | null>(null);
  const [participantLoading, setParticipantLoading] = useState(false);
  const [participants, setParticipants] = useState<SplitParticipant[]>([]);
  const [friendRows, setFriendRows] = useState<FriendListItem[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible || !splitEnabled) return;
    let mounted = true;
    setFriendsLoading(true);
    listMyFriendProfiles()
      .then(rows => {
        if (mounted) setFriendRows(rows);
      })
      .catch(() => {
        if (mounted) setFriendRows([]);
      })
      .finally(() => {
        if (mounted) setFriendsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [visible, splitEnabled]);

  const handleClose = () => {
    setName('');
    setPrice('');
    setQuantity('1');
    setSplitEnabled(false);
    setParticipantCode('');
    setParticipantError(null);
    setSubmitError(null);
    setParticipants([]);
    onClose();
  };

  const handleAddParticipant = async () => {
    const code = participantCode.trim();
    if (!code) {
      setParticipantError('Enter a teammate code.');
      return;
    }

    if (participants.some(participant => participant.id === code)) {
      setParticipantError('That teammate is already added.');
      return;
    }

    try {
      setParticipantError(null);
      setParticipantLoading(true);
      const profile = await findProfileById(code);
      const displayName = profile.display_name || profile.email || 'Teammate';
      setParticipants(prev => [
        ...prev,
        {
          id: profile.id,
          name: displayName,
          initial: displayName.slice(0, 1).toUpperCase(),
        },
      ]);
      setParticipantCode('');
    } catch (error: any) {
      setParticipantError(error?.message ?? 'Could not find that teammate code.');
    } finally {
      setParticipantLoading(false);
    }
  };

  const handleAddFriendRow = (friend: FriendListItem) => {
    if (participants.some(participant => participant.id === friend.id)) {
      setParticipantError('That teammate is already added.');
      return;
    }
    setParticipantError(null);
    setParticipants(prev => [
      ...prev,
      {
        id: friend.id,
        name: friend.name,
        initial: friend.initial,
      },
    ]);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(prev => prev.filter(participant => participant.id !== id));
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      setSubmitting(true);
      await onSubmit({
        name,
        price,
        quantity,
        splitWith: splitEnabled ? participants.map(participant => participant.id) : [],
        splitParticipants: splitEnabled ? participants : [],
      });
      handleClose();
    } catch (error: any) {
      setSubmitError(error?.message ?? 'Could not save this purchase.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPayers = participants.length + 1;
  const splitAmount = useMemo(() => {
    const value = Number.parseFloat(price);
    if (!Number.isFinite(value) || value <= 0) return '0.00';
    return (value / totalPayers).toFixed(2);
  }, [price, totalPayers]);

  const totalSpending = useMemo(() => {
    const value = Number.parseFloat(price);
    if (!Number.isFinite(value) || value <= 0) return '0.00';
    return value.toFixed(2);
  }, [price]);

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
            <View style={s.heroCard}>
              <Text style={s.heroTitle}>Track the full purchase.</Text>
              <Text style={s.heroText}>If you add teammate codes, SportFund will split the expense automatically and drop the share into each teammate&apos;s notifications and wallet.</Text>
            </View>

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

            <View style={s.row}>
              <View style={[s.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={s.label}>TOTAL PRICE ($)</Text>
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

            <View style={s.splitToggleRow}>
              <View style={s.splitToggleLeft}>
                <Users size={16} color={C.accent} style={{ marginRight: 10 }} />
                <View>
                  <Text style={s.splitToggleLabel}>Split this purchase?</Text>
                  <Text style={s.splitToggleSub}>Use teammate codes to send the share automatically.</Text>
                </View>
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
                  onPress={() => {
                    setSplitEnabled(false);
                    setParticipants([]);
                    setParticipantCode('');
                    setParticipantError(null);
                  }}
                >
                  <Text style={[s.yesNoText, !splitEnabled && { color: C.accentBg }]}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {splitEnabled ? (
              <View style={s.splitPanel}>
                <Text style={s.label}>TEAMMATES</Text>
                <Text style={s.helperText}>Pick from your friends below or paste a teammate Player ID from their profile.</Text>

                <Text style={s.subSectionLabel}>MY FRIENDS</Text>
                {friendsLoading ? (
                  <View style={s.loadingRow}>
                    <ActivityIndicator color={C.accent} />
                    <Text style={s.loadingText}>Loading teammates…</Text>
                  </View>
                ) : friendRows.length === 0 ? (
                  <View style={s.emptyCodeState}>
                    <Text style={s.emptyText}>No accepted friends yet.</Text>
                  </View>
                ) : (
                  <View style={s.friendQuickList}>
                    {friendRows.map(friend => {
                      const alreadyAdded = participants.some(participant => participant.id === friend.id);
                      return (
                        <TouchableOpacity
                          key={friend.id}
                          style={[s.friendQuickRow, alreadyAdded && s.friendQuickRowActive]}
                          onPress={() => handleAddFriendRow(friend)}
                          disabled={alreadyAdded}
                        >
                          <View style={s.friendAvatar}>
                            <Text style={s.friendAvatarText}>{friend.initial}</Text>
                          </View>
                          <View style={s.participantBody}>
                            <Text style={s.friendName}>{friend.name}</Text>
                            <Text style={s.friendMeta}>{alreadyAdded ? 'Added to this split' : 'Tap to add instantly'}</Text>
                          </View>
                          <View style={[s.friendQuickPill, alreadyAdded && s.friendQuickPillActive]}>
                            <Text style={[s.friendQuickPillText, alreadyAdded && s.friendQuickPillTextActive]}>
                              {alreadyAdded ? 'Added' : 'Add'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                <Text style={s.subSectionLabel}>ADD BY CODE</Text>
                <View style={s.codeRow}>
                  <TextInput
                    style={[s.textInput, s.codeInput]}
                    placeholder="Enter teammate code"
                    placeholderTextColor={C.neutral}
                    value={participantCode}
                    onChangeText={setParticipantCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity style={s.addCodeBtn} onPress={handleAddParticipant} disabled={participantLoading}>
                    {participantLoading ? <ActivityIndicator color={C.accentBg} /> : <Plus size={16} color={C.accentBg} />}
                  </TouchableOpacity>
                </View>

                {participantError ? <Text style={s.errorText}>{participantError}</Text> : null}
                {submitError ? <Text style={s.errorText}>{submitError}</Text> : null}

                {participants.length === 0 ? (
                  <View style={s.emptyCodeState}>
                    <Text style={s.emptyText}>No teammate codes added yet.</Text>
                  </View>
                ) : (
                  <View style={s.participantList}>
                    {participants.map(participant => (
                      <View key={participant.id} style={s.participantRow}>
                        <View style={s.friendAvatar}>
                          <Text style={s.friendAvatarText}>{participant.initial}</Text>
                        </View>
                        <View style={s.participantBody}>
                          <Text style={s.friendName}>{participant.name}</Text>
                          <Text style={s.friendMeta}>Will receive a wallet expense and bell notification</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveParticipant(participant.id)}>
                          <MinusCircle size={18} color={C.neutral} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                <View style={s.breakdownCard}>
                  <Text style={s.breakdownTitle}>AUTO SPLIT PREVIEW</Text>
                  <View style={s.breakdownRow}>
                    <Text style={s.breakdownLabel}>You</Text>
                    <Text style={s.breakdownAmount}>${splitAmount}</Text>
                  </View>
                  {participants.map(participant => (
                    <View key={participant.id} style={s.breakdownRow}>
                      <Text style={s.breakdownLabel}>{participant.name}</Text>
                      <Text style={s.breakdownAmount}>${splitAmount}</Text>
                    </View>
                  ))}
                  <View style={s.totalSplitRow}>
                    <View>
                      <Text style={s.totalSplitLabel}>Purchase total</Text>
                      <Text style={s.totalSplitCaption}>Stored in gear as the full purchase amount.</Text>
                    </View>
                    <Text style={s.totalSplitAmount}>${totalSpending}</Text>
                  </View>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <TouchableOpacity style={s.submitButton} onPress={handleSubmit} disabled={submitting}>
            <Check size={16} color={C.accentBg} style={{ marginRight: 8 }} />
            <Text style={s.submitButtonText}>
              {submitting ? 'Saving…' : splitEnabled ? 'Add Purchase And Split' : 'Add Purchase'}
            </Text>
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
  heroCard: { backgroundColor: 'rgba(204,255,0,0.08)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.accentBorder, marginBottom: 18 },
  heroTitle: { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  heroText: { color: C.neutral, fontSize: 12, lineHeight: 18 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 10, fontWeight: '700', color: C.neutral, marginBottom: 8, letterSpacing: 1.2 },
  textInput: { backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.border },
  row: { flexDirection: 'row' },
  splitToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.bg, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  splitToggleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  splitToggleLabel: { color: C.text, fontSize: 14, fontWeight: '600' },
  splitToggleSub: { color: C.neutral, fontSize: 11, marginTop: 2 },
  yesNoRow: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 20, padding: 2 },
  yesNoBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 18 },
  yesNoBtnActive: { backgroundColor: C.accent },
  yesNoText: { color: C.neutral, fontWeight: '700', fontSize: 13 },
  splitPanel: { backgroundColor: C.bg, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 },
  helperText: { color: C.neutral, fontSize: 12, lineHeight: 18, marginBottom: 12 },
  subSectionLabel: { color: C.neutral, fontSize: 10, fontWeight: '700', letterSpacing: 1.1, marginBottom: 8, marginTop: 4 },
  friendQuickList: { marginBottom: 14 },
  friendQuickRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12, marginBottom: 10, backgroundColor: C.card },
  friendQuickRowActive: { backgroundColor: C.accentMuted, borderColor: C.accentBorder },
  friendQuickPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: C.accent, marginLeft: 10 },
  friendQuickPillActive: { backgroundColor: 'rgba(34,197,94,0.14)' },
  friendQuickPillText: { color: C.accentBg, fontWeight: '800', fontSize: 12 },
  friendQuickPillTextActive: { color: C.success },
  codeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  codeInput: { flex: 1, marginRight: 10 },
  addCodeBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#F87171', fontSize: 12, fontWeight: '700', marginBottom: 10 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginBottom: 12 },
  loadingText: { color: C.neutral, fontSize: 12, marginLeft: 8 },
  emptyCodeState: { borderRadius: 12, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', padding: 14, marginTop: 4 },
  emptyText: { color: C.neutral, fontSize: 12 },
  participantList: { marginTop: 6 },
  participantRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  friendAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.accentMuted, borderWidth: 1, borderColor: C.accentBorder, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  friendAvatarText: { color: C.accent, fontWeight: '700', fontSize: 14 },
  participantBody: { flex: 1 },
  friendName: { color: C.text, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  friendMeta: { color: C.neutral, fontSize: 11 },
  breakdownCard: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: C.border },
  breakdownTitle: { color: C.text, fontSize: 13, fontWeight: '700', marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  breakdownLabel: { color: C.neutral, fontSize: 13 },
  breakdownAmount: { color: C.text, fontSize: 13, fontWeight: '700' },
  totalSplitRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border },
  totalSplitLabel: { color: C.text, fontSize: 15, fontWeight: '700' },
  totalSplitCaption: { color: C.neutral, fontSize: 11, marginTop: 2 },
  totalSplitAmount: { color: C.accent, fontSize: 26, fontWeight: '800' },
  submitButton: { marginTop: 16, backgroundColor: C.accent, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  submitButtonText: { color: C.accentBg, fontSize: 16, fontWeight: '800' },
});
