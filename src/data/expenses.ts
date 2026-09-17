import { addDoc, collection, getDocs, limit as fsLimit, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type ExpenseRow = {
  id: string;
  user_id: string;
  type: 'booking' | 'gear' | 'other';
  amount: number;
  currency: string;
  occurred_at: string;
  note: string | null;
  split_id: string | null;
  split_role: string | null;
  created_by: string | null;
};

export async function listMyExpenses(limitCount = 50) {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const q = query(
    collection(db, 'expenses'),
    where('user_id', '==', userId),
    orderBy('occurred_at', 'desc'),
    fsLimit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as ExpenseRow[];
}

export async function createExpense(input: {
  type: ExpenseRow['type'];
  amount: number;
  currency?: string;
  occurred_at?: string;
  note?: string | null;
}) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not signed in');

  await addDoc(collection(db, 'expenses'), {
    user_id: userId,
    type: input.type,
    amount: input.amount,
    currency: input.currency ?? 'USD',
    occurred_at: input.occurred_at ?? new Date().toISOString(),
    note: input.note ?? null,
    split_id: null,
    split_role: null,
    created_by: userId,
  });
}
