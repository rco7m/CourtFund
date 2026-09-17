import { collection, doc, getDoc, getDocs, orderBy, query, where, writeBatch } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

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

const round2 = (value: number) => Math.round(value * 100) / 100;

// Client-side reimplementation of the old Postgres `create_cost_split`
// function. Note this means the host's client directly writes expense,
// cost_split_member, and notification documents for OTHER users' accounts —
// Firestore security rules allow this specifically for split fan-out
// (see firestore.rules), which is inherently less locked-down than the old
// `security definer` Postgres function. Traded off deliberately for staying
// on Cloud Functions-free / free-tier Firebase.
export async function createCostSplit(input: {
  sourceType: 'gear' | 'expense';
  sourceRecordId: string | null;
  expenseType: 'gear' | 'booking' | 'other';
  title: string;
  totalAmount: number;
  participants: SplitParticipantInput[];
}) {
  const hostId = auth.currentUser?.uid;
  if (!hostId) throw new Error('Not signed in');

  const title = input.title?.trim();
  if (!title) throw new Error('Split title is required');
  if (!input.totalAmount || input.totalAmount <= 0) throw new Error('Split amount must be greater than zero');

  const participantIds = Array.from(
    new Set(input.participants.map(p => p.id).filter(id => id && id !== hostId)),
  );
  const participantCount = participantIds.length + 1;
  if (participantCount < 2) throw new Error('Add at least one teammate before splitting');

  const participantShare = round2(input.totalAmount / participantCount);
  const hostShare = round2(input.totalAmount - participantShare * (participantCount - 1));

  const hostProfileSnap = await getDoc(doc(db, 'profiles', hostId));
  const hostProfile = hostProfileSnap.exists() ? hostProfileSnap.data() : null;
  const hostName = hostProfile?.display_name || hostProfile?.email || 'You';

  // Resolve participant display names: explicit name from input wins,
  // otherwise fall back to their profile, otherwise 'Teammate'.
  const providedNames = new Map(input.participants.map(p => [p.id, p.name?.trim()]));
  const resolvedNames = new Map<string, string>();
  for (const participantId of participantIds) {
    const provided = providedNames.get(participantId);
    if (provided) {
      resolvedNames.set(participantId, provided);
      continue;
    }
    const snap = await getDoc(doc(db, 'profiles', participantId));
    const data = snap.exists() ? snap.data() : null;
    resolvedNames.set(participantId, data?.display_name || data?.email || 'Teammate');
  }

  const now = new Date().toISOString();
  const batch = writeBatch(db);

  const splitRef = doc(collection(db, 'cost_splits'));
  batch.set(splitRef, {
    created_by: hostId,
    source_type: input.sourceType,
    source_record_id: input.sourceRecordId,
    expense_type: input.expenseType,
    title,
    currency: 'USD',
    total_amount: round2(input.totalAmount),
    share_amount: participantShare,
    participant_count: participantCount,
    // Denormalized so Firestore security rules can check "am I a member of
    // this split" without a query-based lookup (rules only support get()).
    member_ids: [hostId, ...participantIds],
    created_at: now,
    updated_at: now,
  });

  const hostExpenseRef = doc(collection(db, 'expenses'));
  batch.set(hostExpenseRef, {
    user_id: hostId,
    type: input.expenseType,
    amount: hostShare,
    currency: 'USD',
    occurred_at: now,
    note: `Split share • ${title}`,
    split_id: splitRef.id,
    split_role: 'host',
    created_by: hostId,
  });

  batch.set(doc(collection(db, 'cost_split_members')), {
    split_id: splitRef.id,
    user_id: hostId,
    participant_name: hostName,
    amount: hostShare,
    role: 'host',
    status: 'posted',
    expense_id: hostExpenseRef.id,
    created_at: now,
  });

  for (const participantId of participantIds) {
    const participantName = resolvedNames.get(participantId) ?? 'Teammate';

    const memberExpenseRef = doc(collection(db, 'expenses'));
    batch.set(memberExpenseRef, {
      user_id: participantId,
      type: input.expenseType,
      amount: participantShare,
      currency: 'USD',
      occurred_at: now,
      note: `Split share • ${title}`,
      split_id: splitRef.id,
      split_role: 'member',
      created_by: hostId,
    });

    batch.set(doc(collection(db, 'cost_split_members')), {
      split_id: splitRef.id,
      user_id: participantId,
      participant_name: participantName,
      amount: participantShare,
      role: 'member',
      status: 'sent',
      expense_id: memberExpenseRef.id,
      created_at: now,
    });

    batch.set(doc(collection(db, 'app_notifications')), {
      user_id: participantId,
      created_by: hostId,
      kind: 'cost_split',
      title: 'New split added',
      body: `${hostName} added ${title} to your expenses. Your share is $${participantShare.toFixed(2)}`,
      metadata: { split_id: splitRef.id, title, amount: participantShare, source_type: input.sourceType },
      created_at: now,
    });
  }

  batch.set(doc(collection(db, 'app_notifications')), {
    user_id: hostId,
    created_by: hostId,
    kind: 'cost_split_created',
    title: 'Split created',
    body: `You split ${title} with ${participantCount - 1} teammate(s).`,
    metadata: { split_id: splitRef.id, title, amount: hostShare, source_type: input.sourceType },
    created_at: now,
  });

  await batch.commit();
  return splitRef.id;
}

export async function listMyCostSplitActivity(limitCount = 10) {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const [createdSnap, memberSnap] = await Promise.all([
    getDocs(query(collection(db, 'cost_splits'), where('created_by', '==', userId), orderBy('created_at', 'desc'))),
    getDocs(
      query(
        collection(db, 'cost_split_members'),
        where('user_id', '==', userId),
        where('role', '==', 'member'),
        orderBy('created_at', 'desc'),
      ),
    ),
  ]);

  const map = new Map<string, CostSplitActivity>();

  for (const splitDoc of createdSnap.docs) {
    const split = splitDoc.data();
    const membersSnap = await getDocs(query(collection(db, 'cost_split_members'), where('split_id', '==', splitDoc.id)));
    const members = membersSnap.docs.map(m => {
      const data = m.data();
      return {
        id: m.id,
        user_id: data.user_id,
        participant_name: data.participant_name,
        amount: Number(data.amount || 0),
        role: data.role,
        status: data.status,
      };
    });
    const mine = members.find(m => m.role === 'host');

    map.set(splitDoc.id, {
      id: splitDoc.id,
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

  for (const memberDoc of memberSnap.docs) {
    const memberRow = memberDoc.data();
    if (map.has(memberRow.split_id)) continue;

    const splitSnap = await getDoc(doc(db, 'cost_splits', memberRow.split_id));
    if (!splitSnap.exists()) continue;
    const split = splitSnap.data();

    map.set(memberRow.split_id, {
      id: memberRow.split_id,
      title: split.title,
      total_amount: Number(split.total_amount || 0),
      share_amount: Number(split.share_amount || 0),
      participant_count: split.participant_count,
      source_type: split.source_type,
      created_at: split.created_at,
      created_by: split.created_by,
      mine_amount: Number(memberRow.amount || 0),
      mine_role: 'member',
      members: [
        {
          participant_name: memberRow.participant_name,
          amount: Number(memberRow.amount || 0),
          role: memberRow.role,
          status: memberRow.status,
        },
      ],
    });
  }

  return Array.from(map.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limitCount);
}
