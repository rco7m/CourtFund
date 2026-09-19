import { addDoc, collection, getDocs, limit as fsLimit, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type SessionRow = {
  id: string;
  user_id: string;
  title: string;
  occurred_at: string;
  duration_minutes: number;
  rating: number | null;
  notes: string | null;
};

export type SessionInsightRow = {
  id: string;
  session_id: string;
  insight: string;
};

export async function listMySessions() {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const q = query(collection(db, 'sessions'), where('user_id', '==', userId));
  const snap = await getDocs(q);
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() })) as SessionRow[];
  return rows.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
}

export async function getInsightForSession(sessionId: string) {
  const q = query(collection(db, 'session_insights'), where('session_id', '==', sessionId), fsLimit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as SessionInsightRow;
}

export async function createSession(input: {
  title: string;
  duration_minutes: number;
  rating?: number | null;
  notes?: string | null;
  occurred_at?: string;
  insight?: string | null;
}) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not signed in');

  const payload = {
    user_id: userId,
    title: input.title,
    duration_minutes: input.duration_minutes,
    rating: input.rating ?? null,
    notes: input.notes ?? null,
    occurred_at: input.occurred_at ?? new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, 'sessions'), payload);
  const session = { id: ref.id, ...payload } as SessionRow;

  if (input.insight) {
    await addDoc(collection(db, 'session_insights'), {
      session_id: session.id,
      insight: input.insight,
    });
  }

  return session;
}
