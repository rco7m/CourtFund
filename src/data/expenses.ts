import { supabase } from '../lib/supabase';

export type ExpenseRow = {
  id: string;
  user_id: string;
  type: 'booking' | 'gear' | 'other';
  amount: number;
  currency: string;
  occurred_at: string;
  note: string | null;
};

export async function listMyExpenses(limit = 50) {
  const { data, error } = await supabase
    .from('expenses')
    .select('id,user_id,type,amount,currency,occurred_at,note')
    .order('occurred_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ExpenseRow[];
}

export async function createExpense(input: {
  type: ExpenseRow['type'];
  amount: number;
  currency?: string;
  occurred_at?: string;
  note?: string | null;
}) {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('Not signed in');

  const { error } = await supabase.from('expenses').insert({
    user_id: userId,
    type: input.type,
    amount: input.amount,
    currency: input.currency ?? 'USD',
    occurred_at: input.occurred_at ?? new Date().toISOString(),
    note: input.note ?? null,
  });
  if (error) throw error;
}

