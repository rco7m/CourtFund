import { supabase } from '../lib/supabase';

export type UserStatsRow = {
  user_id: string;
  sessions_count: number;
  hours_total: number;
  avg_rating: number | null;
  streak_days: number;
  updated_at: string;
};

export async function getMyUserStats() {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return null;

  const { data, error } = await supabase
    .from('user_stats')
    .select('user_id,sessions_count,hours_total,avg_rating,streak_days,updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as UserStatsRow | null;
}
