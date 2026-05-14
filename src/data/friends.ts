import { supabase } from '../lib/supabase';

export type FriendRow = {
  id: string;
  user_id: string;
  friend_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
};

export type FriendProfile = {
  id: string;
  display_name: string | null;
  email: string | null;
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

export async function findProfileByEmail(email: string) {
  const { data, error } = await supabase.from('profiles').select('id,display_name,email').eq('email', email).single();
  if (error) throw error;
  return data as FriendProfile;
}

export async function sendFriendRequest(friendEmail: string) {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('Not signed in');

  const friend = await findProfileByEmail(friendEmail);
  if (friend.id === userId) throw new Error('You cannot add yourself');

  const { error } = await supabase.from('friends').insert({
    user_id: userId,
    friend_user_id: friend.id,
    status: 'pending',
  });
  if (error) throw error;
}

