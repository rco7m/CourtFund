import { supabase } from '../lib/supabase';

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

export async function listMyNotifications(limit = 5) {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return [];

  const [sessionsRes, expensesRes, scheduleRes] = await Promise.all([
    supabase.from('sessions').select('id,title,occurred_at').eq('user_id', userId).order('occurred_at', { ascending: false }).limit(limit),
    supabase.from('expenses').select('id,type,amount,note,occurred_at').eq('user_id', userId).order('occurred_at', { ascending: false }).limit(limit),
    supabase.from('schedule_events').select('id,title,start_time,tag').eq('user_id', userId).order('start_time', { ascending: false }).limit(limit),
  ]);

  if (sessionsRes.error) throw sessionsRes.error;
  if (expensesRes.error) throw expensesRes.error;
  if (scheduleRes.error) throw scheduleRes.error;

  const items: AppNotification[] = [];

  for (const s of sessionsRes.data ?? []) {
    items.push({
      id: `session-${s.id}`,
      title: 'Session logged',
      desc: s.title,
      time: formatRelativeTime(s.occurred_at),
      icon: '🏸',
    });
  }

  for (const e of expensesRes.data ?? []) {
    items.push({
      id: `expense-${e.id}`,
      title: 'Expense recorded',
      desc: `${e.note || e.type} • $${Number(e.amount).toFixed(2)}`,
      time: formatRelativeTime(e.occurred_at),
      icon: '💰',
    });
  }

  for (const ev of scheduleRes.data ?? []) {
    items.push({
      id: `schedule-${ev.id}`,
      title: 'Upcoming event',
      desc: ev.title,
      time: formatRelativeTime(ev.start_time),
      icon: '📅',
    });
  }

  return items.slice(0, limit);
}
