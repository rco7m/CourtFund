import { supabase } from '../lib/supabase';

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export type UserStats = {
  user_id: string;
  sessions_count: number;
  hours_total: number;
  avg_rating: number | null;
  streak_days: number;
};

export async function getMyProfile() {
  const { data, error } = await supabase.from('profiles').select('id,email,display_name,avatar_url').maybeSingle();
  if (error) throw error;
  return (data || { id: '', email: null, display_name: null, avatar_url: null }) as Profile;
}

export async function updateMyProfile(update: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) {
  const { data, error } = await supabase.from('profiles').update(update).select('id,email,display_name,avatar_url').single();
  if (error) throw error;
  return data as Profile;
}

export async function getMyStats() {
  const { data, error } = await supabase.from('user_stats').select('user_id,sessions_count,hours_total,avg_rating,streak_days').maybeSingle();
  if (error) throw error;
  if (!data) {
    return { user_id: '', sessions_count: 0, hours_total: 0, avg_rating: null, streak_days: 0 };
  }
  return data as UserStats;
}

export async function recomputeMyStats() {
  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;
  if (!userId) return;

  // Recompute from sessions and store into `user_stats` (client-side fallback).
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('duration_minutes,rating,occurred_at')
    .eq('user_id', userId)
    .order('occurred_at', { ascending: false });
  if (sessionsError) throw sessionsError;

  const sessionsCount = sessions?.length ?? 0;
  const hoursTotal = (sessions ?? []).reduce((acc, s) => acc + (s.duration_minutes ?? 0) / 60, 0);
  const ratings = (sessions ?? []).map(s => s.rating).filter((r): r is number => typeof r === 'number');
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  // Simple streak: consecutive days with >=1 session.
  const daysWithSession = new Set<string>();
  for (const s of sessions ?? []) {
    const d = new Date(s.occurred_at as string);
    daysWithSession.add(d.toISOString().slice(0, 10));
  }
  let streakDays = 0;
  const cursor = new Date();
  const todayStr = cursor.toISOString().slice(0, 10);
  if (!daysWithSession.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!daysWithSession.has(key)) break;
    streakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }


  const { error } = await supabase.from('user_stats').upsert({
    user_id: userId,
    sessions_count: sessionsCount,
    hours_total: Number(hoursTotal.toFixed(2)),
    avg_rating: avgRating ? Number(avgRating.toFixed(2)) : null,
    streak_days: streakDays,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) {
    console.warn('Failed to upsert user_stats:', error);
  }
}

