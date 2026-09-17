import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export async function requestAccountDeletion() {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not signed in');

  await addDoc(collection(db, 'account_deletion_requests'), {
    user_id: userId,
    status: 'pending',
    created_at: new Date().toISOString(),
  });
}
