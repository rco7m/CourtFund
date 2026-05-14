import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Bell, User, UserPlus, X, Check, Search, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { listMyFriends, sendFriendRequest } from '../data/friends';
import { supabase } from '../lib/supabase';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const AddFriendModal = ({ visible, onClose, onSend }: any) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setErrorText(null);
    if (!email.trim()) return;
    try {
      setLoading(true);
      await onSend(email.trim());
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setEmail('');
        onClose();
      }, 1200);
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Add Teammate</Text>
            <TouchableOpacity onPress={onClose}><X size={20} color={C.neutral} /></TouchableOpacity>
          </View>
          {sent ? (
            <View style={s.sentState}>
              <View style={s.sentCircle}><Check size={30} color={C.accent} /></View>
              <Text style={s.sentTitle}>Request Sent!</Text>
              <Text style={s.sentDesc}>We've sent an invitation to {email}</Text>
            </View>
          ) : (
            <>
              <Text style={s.modalLabel}>INVITE BY EMAIL</Text>
              <TextInput
                style={s.modalInput}
                placeholder="teammate@example.com"
                placeholderTextColor={C.neutral}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              {errorText ? <Text style={s.modalError}>{errorText}</Text> : null}
              <TouchableOpacity style={s.inviteBtn} onPress={handleSend} disabled={loading}>
                <UserPlus size={18} color={C.accentBg} style={{ marginRight: 8 }} />
                <Text style={s.inviteBtnText}>{loading ? 'Sending…' : 'Send Friend Request'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export const FriendsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [friends, setFriends] = useState<Array<{ id: string; name: string; status: string; initial: string }>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErrorText(null);
        setLoading(true);
        const rows = await listMyFriends();
        const { data: userRes } = await supabase.auth.getUser();
        const myId = userRes.user?.id;
        const otherIds = rows
          .map(r => (r.user_id === myId ? r.friend_user_id : r.user_id))
          .filter(Boolean);

        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id,display_name,email')
          .in('id', otherIds);
        if (error) throw error;
        const map = new Map((profiles ?? []).map(p => [p.id, p]));

        const mapped = rows.map(r => {
          const otherId = r.user_id === myId ? r.friend_user_id : r.user_id;
          const p = map.get(otherId);
          const name = (p?.display_name || p?.email || 'Teammate') as string;
          return {
            id: r.id,
            name,
            status: r.status,
            initial: name.slice(0, 1).toUpperCase(),
          };
        });

        if (!mounted) return;
        setFriends(mapped);
      } catch (e: any) {
        if (!mounted) return;
        setErrorText(e?.message ?? 'Failed to load friends.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleInvite = async (email: string) => {
    await sendFriendRequest(email);
    // refresh
    const rows = await listMyFriends();
    const { data: userRes } = await supabase.auth.getUser();
    const myId = userRes.user?.id;
    const otherIds = rows.map(r => (r.user_id === myId ? r.friend_user_id : r.user_id));
    const { data: profiles } = await supabase.from('profiles').select('id,display_name,email').in('id', otherIds);
    const map = new Map((profiles ?? []).map(p => [p.id, p]));
    setFriends(
      rows.map(r => {
        const otherId = r.user_id === myId ? r.friend_user_id : r.user_id;
        const p = map.get(otherId);
        const name = (p?.display_name || p?.email || 'Teammate') as string;
        return { id: r.id, name, status: r.status, initial: name.slice(0, 1).toUpperCase() };
      })
    );
  };

  const hasFriends = friends.length > 0;

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={C.accent} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Friends</Text>
        <TouchableOpacity style={s.addBtn} onPress={() => setShowAdd(true)}>
          <UserPlus size={18} color={C.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.searchSection}>
          <View style={s.searchBar}>
            <Search size={18} color={C.neutral} style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Search friends..."
              placeholderTextColor={C.neutral}
              style={s.searchInput}
            />
          </View>
        </View>

        <Text style={s.sectionTitle}>MY TEAMMATES</Text>
        <View style={s.friendsList}>
          {loading ? (
            <View style={s.loadingRow}>
              <ActivityIndicator color={C.accent} />
              <Text style={s.loadingText}>Loading…</Text>
            </View>
          ) : errorText ? (
            <View style={s.loadingRow}>
              <Text style={s.errorText}>{errorText}</Text>
            </View>
          ) : !hasFriends ? (
            <View style={s.loadingRow}>
              <Text style={s.loadingText}>No friends yet. Invite someone.</Text>
            </View>
          ) : (
            friends.map(f => (
              <View key={f.id} style={s.friendRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{f.initial}</Text>
                  <View style={s.statusDot} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.friendName}>{f.name}</Text>
                  <Text style={s.friendStatus}>{f.status}</Text>
                </View>
                <TouchableOpacity style={s.msgBtn} disabled>
                  <Text style={s.msgBtnText}>Message</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <AddFriendModal visible={showAdd} onClose={() => setShowAdd(false)} onSend={handleInvite} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  searchSection: { paddingHorizontal: 20, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, color: C.text, fontSize: 15 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: C.neutral, letterSpacing: 1.2, marginHorizontal: 20, marginBottom: 12 },
  friendsList: { backgroundColor: C.card, marginHorizontal: 20, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  friendRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accentMuted, justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: C.accentBorder },
  avatarText: { color: C.accent, fontSize: 16, fontWeight: '700' },
  statusDot: { position: 'absolute', bottom: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: C.neutral, borderWidth: 2, borderColor: C.card },
  friendName: { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 2 },
  friendStatus: { fontSize: 12, color: C.neutral },
  msgBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(148,163,184,0.1)' },
  msgBtnText: { color: C.text, fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: C.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.text },
  modalLabel: { fontSize: 10, fontWeight: '700', color: C.neutral, marginBottom: 8, letterSpacing: 1 },
  modalInput: { backgroundColor: C.bg, borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.border, marginBottom: 20 },
  modalError: { color: '#F87171', fontSize: 12, fontWeight: '700', marginTop: -10, marginBottom: 12 },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.accent, paddingVertical: 15, borderRadius: 30 },
  inviteBtnText: { color: C.accentBg, fontSize: 15, fontWeight: '800' },
  sentState: { alignItems: 'center', paddingVertical: 20 },
  sentCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.accentMuted, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  sentTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 8 },
  sentDesc: { fontSize: 14, color: C.neutral, textAlign: 'center' },
  loadingRow: { padding: 18, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.neutral, fontSize: 13, marginTop: 10 },
  errorText: { color: '#F87171', fontWeight: '700', fontSize: 13, textAlign: 'center' },
});
