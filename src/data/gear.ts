import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type GearItemRow = {
  id: string;
  user_id: string;
  name: string;
  category: 'racket' | 'shoes' | 'string' | 'bag' | 'accessory' | 'other';
  brand: string | null;
  quantity: number;
  unit: string | null;
  purchase_date: string | null;
  cost: number | null;
  status: 'active' | 'retired';
  notes: string | null;
};

export async function listMyGear() {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const q = query(collection(db, 'gear_items'), where('user_id', '==', userId), orderBy('created_at', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as GearItemRow[];
}

export async function createGearItem(input: Omit<GearItemRow, 'id' | 'user_id'>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not signed in');

  const ref = await addDoc(collection(db, 'gear_items'), {
    user_id: userId,
    ...input,
    created_at: new Date().toISOString(),
  });
  return { id: ref.id, user_id: userId, ...input } as GearItemRow;
}

export async function updateGearItem(id: string, update: Partial<Pick<GearItemRow, 'quantity' | 'cost'>>) {
  await updateDoc(doc(db, 'gear_items', id), { ...update, updated_at: new Date().toISOString() });
}
