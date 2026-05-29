import { supabase } from '../lib/supabase';

export type FriendRow = {
  id: string;
  user_id: string;
  friend_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at?: string;
};

export type FriendProfile = {
  id: string;
  display_name: string | null;
  email: string | null;
};

export type FriendListItem = FriendRow & {
  name: string;
  initial: string;
};

export async function listMyFriends() {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('friends')
    .select('id,user_id,friend_user_id,status,created_at')
    .or(`user_id.eq.${userId},friend_user_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as FriendRow[];
}

export async function findProfileById(id: string) {
  const { data, error } = await supabase.from('profiles').select('id,display_name,email').eq('id', id).single();
  if (error) throw error;
  return data as FriendProfile;
}

export async function sendFriendRequestById(friendId: string) {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('Not signed in');

  const id = friendId.trim();
  if (!id) throw new Error('Enter a valid ID');
  if (id === userId) throw new Error('You cannot add yourself');

  // Validate the user exists (also normalizes PostgREST error to a friendly message)
  try {
    await findProfileById(id);
  } catch {
    throw new Error('No user found with that ID');
  }

  const { error } = await supabase.from('friends').insert({
    user_id: userId,
    friend_user_id: id,
    status: 'pending',
  });
  if (error) throw error;
}

export async function acceptFriendRequest(requestId: string) {
  const { error } = await supabase.from('friends').update({ status: 'accepted' }).eq('id', requestId);
  if (error) throw error;
}

export async function declineFriendRequest(requestId: string) {
  const { error } = await supabase.from('friends').delete().eq('id', requestId);
  if (error) throw error;
}

export async function listMyFriendProfiles(opts?: { status?: Array<FriendRow['status']> }) {
  const rows = await listMyFriends();
  const { data: userRes } = await supabase.auth.getUser();
  const myId = userRes.user?.id;
  if (!myId) return [];

  const allowed = new Set((opts?.status ?? ['accepted']) as FriendRow['status'][]);
  const filtered = rows.filter(r => allowed.has(r.status));

  const otherIds = filtered
    .map(r => (r.user_id === myId ? r.friend_user_id : r.user_id))
    .filter(Boolean);

  if (otherIds.length === 0) return [];

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id,display_name,email')
    .in('id', otherIds);
  if (error) throw error;

  const map = new Map((profiles ?? []).map(p => [p.id, p]));

  return filtered.map(row => {
    const otherId = row.user_id === myId ? row.friend_user_id : row.user_id;
    const p = map.get(otherId);
    const name = (p?.display_name || p?.email || 'Teammate') as string;
    return {
      ...row,
      name,
      initial: name.slice(0, 1).toUpperCase(),
    } as FriendListItem;
  });
}
