import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type UserStatsRow = {
  user_id: string;
  sessions_count: number;
  hours_total: number;
  avg_rating: number | null;
  streak_days: number;
  updated_at: string;
};

export async function getMyUserStats() {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const snap = await getDoc(doc(db, 'user_stats', userId));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    user_id: snap.id,
    sessions_count: data.sessions_count ?? 0,
    hours_total: data.hours_total ?? 0,
    avg_rating: data.avg_rating ?? null,
    streak_days: data.streak_days ?? 0,
    updated_at: data.updated_at ?? new Date().toISOString(),
  } as UserStatsRow;
}
