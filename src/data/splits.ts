import { supabase } from '../lib/supabase';

export type SplitParticipantInput = {
  id: string;
  name: string;
  initial: string;
};

export type CostSplitActivity = {
  id: string;
  title: string;
  total_amount: number;
  share_amount: number;
  participant_count: number;
  source_type: string;
  created_at: string;
  created_by: string;
  mine_amount: number;
  mine_role: 'host' | 'member';
  members: Array<{
    id?: string;
    user_id?: string;
    participant_name: string;
    amount: number;
    role: 'host' | 'member';
    status: string;
  }>;
};

export async function createCostSplit(input: {
  sourceType: 'gear' | 'expense';
  sourceRecordId: string | null;
  expenseType: 'gear' | 'booking' | 'other';
  title: string;
  totalAmount: number;
  participants: SplitParticipantInput[];
}) {
  const participantIds = input.participants.map(participant => participant.id);
  const participantNames = input.participants.map(participant => participant.name);
  const { data, error } = await supabase.rpc('create_cost_split', {
    p_source_type: input.sourceType,
    p_source_record_id: input.sourceRecordId,
    p_expense_type: input.expenseType,
    p_title: input.title,
    p_total_amount: input.totalAmount,
    p_participant_ids: participantIds,
    p_participant_names: participantNames,
  });

  if (error) throw error;
  return data as string;
}

export async function listMyCostSplitActivity(limit = 10) {
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return [];

  const [createdRes, memberRes] = await Promise.all([
    supabase
      .from('cost_splits')
      .select('id,title,total_amount,share_amount,participant_count,source_type,created_at,created_by,cost_split_members(id,user_id,participant_name,amount,role,status)')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('cost_split_members')
      .select('split_id,participant_name,amount,role,status,cost_splits(id,title,total_amount,share_amount,participant_count,source_type,created_at,created_by)')
      .eq('user_id', userId)
      .eq('role', 'member')
      .order('created_at', { ascending: false })
      .limit(limit),
  ]);

  if (createdRes.error) throw createdRes.error;
  if (memberRes.error) throw memberRes.error;

  const map = new Map<string, CostSplitActivity>();

  for (const split of createdRes.data ?? []) {
    const members = ((split as any).cost_split_members ?? []).map((member: any) => ({
      id: member.id,
      user_id: member.user_id,
      participant_name: member.participant_name,
      amount: Number(member.amount || 0),
      role: member.role,
      status: member.status,
    }));

    const mine = members.find((member: { role: string }) => member.role === 'host');
    map.set(split.id, {
      id: split.id,
      title: split.title,
      total_amount: Number(split.total_amount || 0),
      share_amount: Number(split.share_amount || 0),
      participant_count: split.participant_count,
      source_type: split.source_type,
      created_at: split.created_at,
      created_by: split.created_by,
      mine_amount: mine?.amount ?? Number(split.share_amount || 0),
      mine_role: 'host',
      members,
    });
  }

  for (const memberRow of memberRes.data ?? []) {
    const split = (memberRow as any).cost_splits;
    if (!split || map.has(split.id)) continue;

    map.set(split.id, {
      id: split.id,
      title: split.title,
      total_amount: Number(split.total_amount || 0),
      share_amount: Number(split.share_amount || 0),
      participant_count: split.participant_count,
      source_type: split.source_type,
      created_at: split.created_at,
      created_by: split.created_by,
      mine_amount: Number(memberRow.amount || 0),
      mine_role: 'member',
      members: [{
        participant_name: memberRow.participant_name,
        amount: Number(memberRow.amount || 0),
        role: memberRow.role,
        status: memberRow.status,
      }],
    });
  }

  return Array.from(map.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}
