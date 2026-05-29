import { supabase } from '../lib/supabase';

export async function requestAccountDeletion() {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) throw new Error('Not signed in');

  const { error } = await supabase.from('account_deletion_requests').insert({
    user_id: userId,
    status: 'pending',
  });
  if (error) throw error;
}

