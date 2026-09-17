import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type ScheduleEventRow = {
  id: string;
  user_id: string;
  title: string;
  tag: string | null;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'declined';
  details: string | null;
  sport?: string | null;
  venue_name?: string | null;
  venue_address?: string | null;
  venue_latitude?: number | null;
  venue_longitude?: number | null;
  booking_url?: string | null;
  estimated_cost?: number | null;
  player_count?: number | null;
  invited_friend_ids?: string[] | null;
};

export async function listScheduleForRange(fromIso: string, toIso: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const q = query(
    collection(db, 'schedule_events'),
    where('user_id', '==', userId),
    where('start_time', '>=', fromIso),
    where('start_time', '<', toIso),
    orderBy('start_time', 'asc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as ScheduleEventRow[];
}

// Used by ProfileScreen's activity feed: recent events regardless of date range.
export async function listMySchedule() {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const q = query(collection(db, 'schedule_events'), where('user_id', '==', userId), orderBy('start_time', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as ScheduleEventRow[];
}

export async function setScheduleStatus(eventId: string, status: ScheduleEventRow['status']) {
  await updateDoc(doc(db, 'schedule_events', eventId), { status, updated_at: new Date().toISOString() });
}

export async function updateScheduleEventDetails(eventId: string, update: Partial<ScheduleEventRow>) {
  await updateDoc(doc(db, 'schedule_events', eventId), { ...update, updated_at: new Date().toISOString() });
}

export async function createScheduleEvent(input: {
  title: string;
  tag?: string | null;
  start_time: string;
  end_time: string;
  details?: string | null;
}) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not signed in');

  const payload = {
    user_id: userId,
    title: input.title,
    tag: input.tag ?? null,
    start_time: input.start_time,
    end_time: input.end_time,
    details: input.details ?? null,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, 'schedule_events'), payload);
  return { id: ref.id, ...payload } as ScheduleEventRow;
}
