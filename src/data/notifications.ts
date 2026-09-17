import { collection, getDocs, limit as fsLimit, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type AppNotification = {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: string;
};

const formatRelativeTime = (dateString: string) => {
  const diffMs = new Date(dateString).getTime() - Date.now();
  const absMinutes = Math.max(1, Math.floor(Math.abs(diffMs) / 60000));

  if (absMinutes < 60) return diffMs >= 0 ? `in ${absMinutes}m` : `${absMinutes}m ago`;
  const absHours = Math.floor(absMinutes / 60);
  if (absHours < 24) return diffMs >= 0 ? `in ${absHours}h` : `${absHours}h ago`;
  const absDays = Math.floor(absHours / 24);
  return diffMs >= 0 ? `in ${absDays}d` : `${absDays}d ago`;
};

export async function listMyNotifications(limitCount = 5) {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const [sessionsSnap, expensesSnap, scheduleSnap, appNotifSnap] = await Promise.all([
    getDocs(query(collection(db, 'sessions'), where('user_id', '==', userId), orderBy('occurred_at', 'desc'), fsLimit(limitCount))),
    getDocs(query(collection(db, 'expenses'), where('user_id', '==', userId), orderBy('occurred_at', 'desc'), fsLimit(limitCount))),
    getDocs(query(collection(db, 'schedule_events'), where('user_id', '==', userId), orderBy('start_time', 'desc'), fsLimit(limitCount))),
    getDocs(query(collection(db, 'app_notifications'), where('user_id', '==', userId), orderBy('created_at', 'desc'), fsLimit(limitCount))),
  ]);

  const items: Array<AppNotification & { createdAt: string }> = [];

  for (const doc of sessionsSnap.docs) {
    const s = doc.data();
    items.push({
      id: `session-${doc.id}`,
      title: 'Session logged',
      desc: s.title,
      time: formatRelativeTime(s.occurred_at),
      icon: '🏸',
      createdAt: s.occurred_at,
    });
  }

  for (const doc of expensesSnap.docs) {
    const e = doc.data();
    items.push({
      id: `expense-${doc.id}`,
      title: 'Expense recorded',
      desc: `${e.note || e.type} • $${Number(e.amount).toFixed(2)}`,
      time: formatRelativeTime(e.occurred_at),
      icon: '💰',
      createdAt: e.occurred_at,
    });
  }

  for (const doc of scheduleSnap.docs) {
    const ev = doc.data();
    items.push({
      id: `schedule-${doc.id}`,
      title: 'Upcoming event',
      desc: ev.title,
      time: formatRelativeTime(ev.start_time),
      icon: '📅',
      createdAt: ev.start_time,
    });
  }

  for (const doc of appNotifSnap.docs) {
    const notif = doc.data();
    items.push({
      id: `app-${doc.id}`,
      title: notif.title,
      desc: notif.body,
      time: formatRelativeTime(notif.created_at),
      icon: notif.kind === 'cost_split' ? '🧾' : '🔔',
      createdAt: notif.created_at,
    });
  }

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limitCount)
    .map(({ createdAt: _createdAt, ...item }) => item);
}
