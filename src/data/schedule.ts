import { supabase } from '../lib/supabase';

export type ScheduleEventRow = {
  id: string;
  user_id: string;
  title: string;
  tag: string | null;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'declined';
  details: string | null;
};

export async function listScheduleForRange(fromIso: string, toIso: string) {
  const { data, error } = await supabase
    .from('schedule_events')
    .select('id,user_id,title,tag,start_time,end_time,status,details')
    .gte('start_time', fromIso)
    .lt('start_time', toIso)
    .order('start_time', { ascending: true });
  if (error) throw error;
  return (data ?? []) as ScheduleEventRow[];
}

export async function setScheduleStatus(eventId: string, status: ScheduleEventRow['status']) {
  const { error } = await supabase.from('schedule_events').update({ status }).eq('id', eventId);
  if (error) throw error;
}

export async function createScheduleEvent(input: {
  title: string;
  tag?: string | null;
  start_time: string;
  end_time: string;
  details?: string | null;
}) {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('schedule_events')
    .insert({
      user_id: userId,
      title: input.title,
      tag: input.tag ?? null,
      start_time: input.start_time,
      end_time: input.end_time,
      details: input.details ?? null,
      status: 'pending',
    })
    .select('id,user_id,title,tag,start_time,end_time,status,details')
    .single();
  if (error) throw error;
  return data as ScheduleEventRow;
}

