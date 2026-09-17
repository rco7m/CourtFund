import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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
  const userId = auth.currentUser?.uid;
  if (!userId) return { id: '', email: null, display_name: null, avatar_url: null } as Profile;

  const snap = await getDoc(doc(db, 'profiles', userId));
  if (!snap.exists()) {
    return { id: userId, email: auth.currentUser?.email ?? null, display_name: null, avatar_url: null } as Profile;
  }
  const data = snap.data();
  return {
    id: snap.id,
    email: data.email ?? null,
    display_name: data.display_name ?? null,
    avatar_url: data.avatar_url ?? null,
  } as Profile;
}

export async function updateMyProfile(update: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not signed in');

  await updateDoc(doc(db, 'profiles', userId), {
    ...update,
    updated_at: new Date().toISOString(),
  });
  return getMyProfile();
}

export async function getMyStats() {
  const userId = auth.currentUser?.uid;
  if (!userId) return { user_id: '', sessions_count: 0, hours_total: 0, avg_rating: null, streak_days: 0 } as UserStats;

  const snap = await getDoc(doc(db, 'user_stats', userId));
  if (!snap.exists()) {
    return { user_id: userId, sessions_count: 0, hours_total: 0, avg_rating: null, streak_days: 0 } as UserStats;
  }
  const data = snap.data();
  return {
    user_id: snap.id,
    sessions_count: data.sessions_count ?? 0,
    hours_total: data.hours_total ?? 0,
    avg_rating: data.avg_rating ?? null,
    streak_days: data.streak_days ?? 0,
  } as UserStats;
}

// Firestore has no server-side trigger equivalent (that would need Cloud
// Functions), so stats are recomputed client-side after every session write.
export async function recomputeMyStats() {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const sessionsSnap = await getDocs(query(collection(db, 'sessions'), where('user_id', '==', userId)));
  const sessions = sessionsSnap.docs.map(d => d.data() as { duration_minutes?: number; rating?: number; occurred_at: string });

  const sessionsCount = sessions.length;
  const hoursTotal = sessions.reduce((acc, s) => acc + (s.duration_minutes ?? 0) / 60, 0);
  const ratings = sessions.map(s => s.rating).filter((r): r is number => typeof r === 'number');
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  // Simple streak: consecutive days with >=1 session.
  const daysWithSession = new Set<string>();
  for (const s of sessions) {
    daysWithSession.add(new Date(s.occurred_at).toISOString().slice(0, 10));
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

  try {
    await setDoc(
      doc(db, 'user_stats', userId),
      {
        user_id: userId,
        sessions_count: sessionsCount,
        hours_total: Number(hoursTotal.toFixed(2)),
        avg_rating: avgRating ? Number(avgRating.toFixed(2)) : null,
        streak_days: streakDays,
        updated_at: new Date().toISOString(),
      },
      { merge: true },
    );
  } catch (error) {
    console.warn('Failed to upsert user_stats:', error);
  }
}
