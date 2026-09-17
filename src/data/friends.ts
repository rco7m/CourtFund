import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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

export type FriendListItem = Omit<FriendRow, 'id'> & {
  friendship_id: string;
  id: string;
  teammate_user_id: string;
  name: string;
  initial: string;
};

// Firebase Auth UIDs aren't UUIDs (typically a 28-char alphanumeric string),
// so this just guards against obviously malformed input.
function isValidUid(value: string) {
  return /^[A-Za-z0-9]{16,64}$/.test(value);
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export async function listMyFriends() {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const [asUser, asFriend] = await Promise.all([
    getDocs(query(collection(db, 'friends'), where('user_id', '==', userId))),
    getDocs(query(collection(db, 'friends'), where('friend_user_id', '==', userId))),
  ]);

  const rows = [...asUser.docs, ...asFriend.docs].map(d => ({ id: d.id, ...d.data() })) as FriendRow[];
  return rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function findProfileById(id: string) {
  const trimmed = id.trim();
  if (!isValidUid(trimmed)) throw new Error('Enter a valid teammate ID');

  const snap = await getDoc(doc(db, 'profiles', trimmed));
  if (!snap.exists()) throw new Error('No user found with that ID');

  const data = snap.data();
  return { id: snap.id, display_name: data.display_name ?? null, email: data.email ?? null } as FriendProfile;
}

export async function sendFriendRequestById(friendId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not signed in');

  const id = friendId.trim();
  if (!id) throw new Error('Enter a valid ID');
  if (!isValidUid(id)) throw new Error('Enter a valid teammate ID');
  if (id === userId) throw new Error('You cannot add yourself');

  try {
    await findProfileById(id);
  } catch {
    throw new Error('No user found with that ID');
  }

  await addDoc(collection(db, 'friends'), {
    user_id: userId,
    friend_user_id: id,
    status: 'pending',
    created_at: new Date().toISOString(),
  });
}

export async function acceptFriendRequest(requestId: string) {
  await updateDoc(doc(db, 'friends', requestId), { status: 'accepted', updated_at: new Date().toISOString() });
}

export async function declineFriendRequest(requestId: string) {
  await deleteDoc(doc(db, 'friends', requestId));
}

export async function listMyFriendProfiles(opts?: { status?: Array<FriendRow['status']> }) {
  const rows = await listMyFriends();
  const myId = auth.currentUser?.uid;
  if (!myId) return [];

  const allowed = new Set((opts?.status ?? ['accepted']) as FriendRow['status'][]);
  const filtered = rows.filter(r => allowed.has(r.status));

  const otherIds = Array.from(
    new Set(filtered.map(r => (r.user_id === myId ? r.friend_user_id : r.user_id)).filter(Boolean)),
  );
  if (otherIds.length === 0) return [];

  const profileMap = new Map<string, { display_name: string | null; email: string | null }>();
  for (const idChunk of chunk(otherIds, 30)) {
    const snap = await getDocs(query(collection(db, 'profiles'), where(documentId(), 'in', idChunk)));
    for (const d of snap.docs) {
      const data = d.data();
      profileMap.set(d.id, { display_name: data.display_name ?? null, email: data.email ?? null });
    }
  }

  return filtered.map(row => {
    const otherId = row.user_id === myId ? row.friend_user_id : row.user_id;
    const p = profileMap.get(otherId);
    const name = (p?.display_name || p?.email || 'Teammate') as string;
    return {
      friendship_id: row.id,
      id: otherId,
      teammate_user_id: otherId,
      user_id: row.user_id,
      friend_user_id: row.friend_user_id,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      name,
      initial: name.slice(0, 1).toUpperCase(),
    } as FriendListItem;
  });
}
