import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { UserPlus, X, Check, Search, ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { acceptFriendRequest, declineFriendRequest, findProfileById, listMyFriends, sendFriendRequestById } from '../data/friends';
import { supabase } from '../lib/supabase';

const C = {
  bg: '#0A0F1E', card: '#1E293B', accent: '#CCFF00', accentBg: '#0A0F1E',
  neutral: '#94A3B8', text: '#E2E8F0', border: 'rgba(148,163,184,0.12)',
  accentMuted: 'rgba(204,255,0,0.08)', accentBorder: 'rgba(204,255,0,0.25)',
};

const AddFriendModal = ({ visible, onClose, onSend }: any) => {
  const [friendId, setFriendId] = useState('');
  const [sent, setSent] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<{ id: string; name: string } | null>(null);

  const handleSearch = async () => {
    setErrorText(null);
    const id = friendId.trim();
    if (!id) return;
    try {
      setSearching(true);
      setFound(null);
      const p = await findProfileById(id);
      const name = (p.display_name || p.email || 'Player') as string;
      setFound({ id: p.id, name });
    } catch (e: any) {
      setErrorText(e?.message ?? 'No user found with that ID.');
    } finally {
      setSearching(false);
    }
  };

  const handleSend = async () => {
    setErrorText(null);
    if (!found) return;
    try {
      setLoading(true);
      await onSend(found.id);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setFriendId('');
        setFound(null);
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
              <Text style={s.sentDesc}>Friend request sent.</Text>
            </View>
          ) : (
            <>
              <Text style={s.modalLabel}>INVITE BY ID</Text>
              <TextInput
                style={s.modalInput}
                placeholder="Paste teammate ID"
                placeholderTextColor={C.neutral}
                value={friendId}
                onChangeText={setFriendId}
                autoCapitalize="none"
              />
              <TouchableOpacity style={s.searchBtn} onPress={handleSearch} disabled={searching || !friendId.trim()}>
                {searching ? <ActivityIndicator color={C.accentBg} /> : <Search size={18} color={C.accentBg} style={{ marginRight: 8 }} />}
                <Text style={s.inviteBtnText}>Search</Text>
              </TouchableOpacity>

              {found ? (
                <View style={s.foundCard}>
                  <Text style={s.foundTitle}>{found.name}</Text>
                  <Text style={s.foundSub}>{found.id}</Text>
                </View>
              ) : null}

              {errorText ? <Text style={s.modalError}>{errorText}</Text> : null}
              <TouchableOpacity style={s.inviteBtn} onPress={handleSend} disabled={loading || !found}>
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
  const [teammates, setTeammates] = useState<Array<{ id: string; name: string; status: string; initial: string }>>([]);
  const [incoming, setIncoming] = useState<Array<{ id: string; name: string; initial: string; fromUserId: string }>>([]);
  const [outgoing, setOutgoing] = useState<Array<{ id: string; name: string; initial: string; toUserId: string }>>([]);

  const load = async () => {
    setErrorText(null);
    setLoading(true);
    try {
      const rows = await listMyFriends();
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id ?? null;
      if (!uid) {
        setTeammates([]);
        setIncoming([]);
        setOutgoing([]);
        return;
      }

      const otherIds = rows
        .map(r => (r.user_id === uid ? r.friend_user_id : r.user_id))
        .filter(Boolean);

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id,display_name,email')
        .in('id', otherIds.length ? otherIds : ['00000000-0000-0000-0000-000000000000']);
      if (error) throw error;
      const map = new Map((profiles ?? []).map(p => [p.id, p]));

      const accepted = rows.filter(r => r.status === 'accepted');
      const pendingIncoming = rows.filter(r => r.status === 'pending' && r.friend_user_id === uid);
      const pendingOutgoing = rows.filter(r => r.status === 'pending' && r.user_id === uid);

      setTeammates(accepted.map(r => {
        const otherId = r.user_id === uid ? r.friend_user_id : r.user_id;
        const p = map.get(otherId);
        const name = (p?.display_name || p?.email || 'Teammate') as string;
        return { id: r.id, name, status: 'accepted', initial: name.slice(0, 1).toUpperCase() };
      }));

      setIncoming(pendingIncoming.map(r => {
        const fromId = r.user_id;
        const p = map.get(fromId);
        const name = (p?.display_name || p?.email || 'Player') as string;
        return { id: r.id, fromUserId: fromId, name, initial: name.slice(0, 1).toUpperCase() };
      }));

      setOutgoing(pendingOutgoing.map(r => {
        const toId = r.friend_user_id;
        const p = map.get(toId);
        const name = (p?.display_name || p?.email || 'Player') as string;
        return { id: r.id, toUserId: toId, name, initial: name.slice(0, 1).toUpperCase() };
      }));
    } catch (e: any) {
      setErrorText(e?.message ?? 'Failed to load friends.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await load();
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleInvite = async (friendUserId: string) => {
    await sendFriendRequestById(friendUserId);
    await load();
  };

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
              placeholder="Search teammates..."
              placeholderTextColor={C.neutral}
              style={s.searchInput}
            />
          </View>
        </View>

        {incoming.length > 0 ? <Text style={s.sectionTitle}>FRIEND REQUESTS</Text> : null}
        {incoming.length > 0 ? (
          <View style={s.friendsList}>
            {incoming.map(req => (
              <View key={req.id} style={s.friendRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{req.initial}</Text>
                  <View style={s.statusDot} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.friendName}>{req.name}</Text>
                  <Text style={s.friendStatus}>Pending</Text>
                </View>
                <TouchableOpacity
                  style={[s.msgBtn, { backgroundColor: C.accent }]}
                  onPress={async () => {
                    await acceptFriendRequest(req.id);
                    await load();
                  }}
                >
                  <Text style={[s.msgBtnText, { color: C.accentBg }]}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.msgBtn, { marginLeft: 8 }]}
                  onPress={async () => {
                    await declineFriendRequest(req.id);
                    await load();
                  }}
                >
                  <Text style={s.msgBtnText}>Decline</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {outgoing.length > 0 ? <Text style={s.sectionTitle}>SENT REQUESTS</Text> : null}
        {outgoing.length > 0 ? (
          <View style={s.friendsList}>
            {outgoing.map(req => (
              <View key={req.id} style={s.friendRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{req.initial}</Text>
                  <View style={s.statusDot} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.friendName}>{req.name}</Text>
                  <Text style={s.friendStatus}>Pending</Text>
                </View>
                <View style={s.pendingBadge}>
                  <Text style={s.pendingText}>Sent</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

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
          ) : teammates.length === 0 ? (
            <View style={s.loadingRow}>
              <Text style={s.loadingText}>No teammates yet. Add someone by ID.</Text>
            </View>
          ) : (
            teammates.map(f => (
              <View key={f.id} style={s.friendRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{f.initial}</Text>
                  <View style={s.statusDot} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.friendName}>{f.name}</Text>
                  <Text style={s.friendStatus}>{f.status}</Text>
                </View>
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
  searchBtn: { marginTop: -8, marginBottom: 12, backgroundColor: C.accent, borderRadius: 14, height: 46, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  foundCard: { marginBottom: 12, backgroundColor: C.bg, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: C.border },
  foundTitle: { color: C.text, fontWeight: '800', marginBottom: 4 },
  foundSub: { color: C.neutral, fontSize: 11 },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.accent, paddingVertical: 15, borderRadius: 30 },
  inviteBtnText: { color: C.accentBg, fontSize: 15, fontWeight: '800' },
  pendingBadge: { backgroundColor: C.accentMuted, borderWidth: 1, borderColor: C.accentBorder, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  pendingText: { color: C.accent, fontWeight: '800', fontSize: 12 },
  sentState: { alignItems: 'center', paddingVertical: 20 },
  sentCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.accentMuted, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  sentTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 8 },
  sentDesc: { fontSize: 14, color: C.neutral, textAlign: 'center' },
  loadingRow: { padding: 18, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.neutral, fontSize: 13, marginTop: 10 },
  errorText: { color: '#F87171', fontWeight: '700', fontSize: 13, textAlign: 'center' },
});
