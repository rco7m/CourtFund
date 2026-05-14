import { supabase } from '../lib/supabase';

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
  const { data, error } = await supabase
    .from('sessions')
    .select('id,user_id,title,occurred_at,duration_minutes,rating,notes')
    .order('occurred_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SessionRow[];
}

export async function getInsightForSession(sessionId: string) {
  const { data, error } = await supabase.from('session_insights').select('id,session_id,insight').eq('session_id', sessionId).limit(1);
  if (error) throw error;
  return (data?.[0] ?? null) as SessionInsightRow | null;
}

export async function createSession(input: {
  title: string;
  duration_minutes: number;
  rating?: number | null;
  notes?: string | null;
  occurred_at?: string;
  insight?: string | null;
}) {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('Not signed in');

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      title: input.title,
      duration_minutes: input.duration_minutes,
      rating: input.rating ?? null,
      notes: input.notes ?? null,
      occurred_at: input.occurred_at ?? new Date().toISOString(),
    })
    .select('id,user_id,title,occurred_at,duration_minutes,rating,notes')
    .single();
  if (error) throw error;

  if (input.insight) {
    const { error: insightError } = await supabase.from('session_insights').insert({
      session_id: session.id,
      insight: input.insight,
    });
    if (insightError) throw insightError;
  }

  return session as SessionRow;
}

