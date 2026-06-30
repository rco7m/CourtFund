do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'split_member_role'
      and n.nspname = 'public'
  ) then
    create type public.split_member_role as enum ('host', 'member');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'split_member_status'
      and n.nspname = 'public'
  ) then
    create type public.split_member_status as enum ('posted', 'sent');
  end if;
end $$;

create table if not exists public.cost_splits (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  source_record_id uuid,
  expense_type public.expense_type not null default 'other',
  title text not null,
  currency text not null default 'USD',
  total_amount numeric(10,2) not null,
  share_amount numeric(10,2) not null,
  participant_count int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cost_splits_total_positive check (total_amount > 0),
  constraint cost_splits_share_positive check (share_amount > 0),
  constraint cost_splits_participants_min check (participant_count >= 2)
);

drop trigger if exists cost_splits_set_updated_at on public.cost_splits;
create trigger cost_splits_set_updated_at
before update on public.cost_splits
for each row execute function public.set_updated_at();

create unique index if not exists cost_splits_unique_source_idx
  on public.cost_splits (source_type, source_record_id)
  where source_record_id is not null;

create table if not exists public.cost_split_members (
  id uuid primary key default gen_random_uuid(),
  split_id uuid not null references public.cost_splits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  participant_name text not null,
  amount numeric(10,2) not null,
  role public.split_member_role not null,
  status public.split_member_status not null default 'sent',
  expense_id uuid references public.expenses(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint cost_split_members_amount_positive check (amount > 0),
  constraint cost_split_members_unique unique (split_id, user_id)
);

create index if not exists cost_split_members_user_idx
  on public.cost_split_members (user_id, created_at desc);

create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  kind text not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists app_notifications_user_created_idx
  on public.app_notifications (user_id, created_at desc);

alter table public.expenses
  add column if not exists split_id uuid references public.cost_splits(id) on delete set null,
  add column if not exists split_role text,
  add column if not exists created_by uuid references auth.users(id) on delete set null;

update public.expenses
set created_by = user_id
where created_by is null;

alter table public.cost_splits enable row level security;
alter table public.cost_split_members enable row level security;
alter table public.app_notifications enable row level security;

drop policy if exists cost_splits_access on public.cost_splits;
create policy cost_splits_access on public.cost_splits
for select using (
  auth.uid() = created_by
  or exists (
    select 1
    from public.cost_split_members m
    where m.split_id = id
      and m.user_id = auth.uid()
  )
);

drop policy if exists cost_split_members_access on public.cost_split_members;
create policy cost_split_members_access on public.cost_split_members
for select using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.cost_splits s
    where s.id = split_id
      and s.created_by = auth.uid()
  )
);

drop policy if exists app_notifications_select_own on public.app_notifications;
create policy app_notifications_select_own on public.app_notifications
for select using (auth.uid() = user_id);

drop policy if exists app_notifications_update_own on public.app_notifications;
create policy app_notifications_update_own on public.app_notifications
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.create_cost_split(
  p_source_type text,
  p_source_record_id uuid,
  p_expense_type public.expense_type,
  p_title text,
  p_total_amount numeric,
  p_participant_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  host_id uuid := auth.uid();
  participant_ids uuid[] := '{}'::uuid[];
  participant_id uuid;
  split_uuid uuid;
  participant_count_value int;
  participant_share numeric(10,2);
  host_share numeric(10,2);
  host_name text;
  participant_name text;
  host_expense_id uuid;
  member_expense_id uuid;
begin
  if host_id is null then
    raise exception 'Not signed in';
  end if;

  if p_title is null or btrim(p_title) = '' then
    raise exception 'Split title is required';
  end if;

  if p_total_amount is null or p_total_amount <= 0 then
    raise exception 'Split amount must be greater than zero';
  end if;

  select coalesce(
    array_agg(distinct participant)
      filter (where participant is not null and participant <> host_id),
    '{}'::uuid[]
  )
  into participant_ids
  from unnest(coalesce(p_participant_ids, '{}'::uuid[])) participant;

  participant_count_value := coalesce(array_length(participant_ids, 1), 0) + 1;
  if participant_count_value < 2 then
    raise exception 'Add at least one teammate code before splitting';
  end if;

  participant_share := round((p_total_amount / participant_count_value)::numeric, 2);
  host_share := round((p_total_amount - (participant_share * (participant_count_value - 1)))::numeric, 2);

  select coalesce(display_name, email, 'You')
  into host_name
  from public.profiles
  where id = host_id;

  insert into public.cost_splits (
    created_by,
    source_type,
    source_record_id,
    expense_type,
    title,
    total_amount,
    share_amount,
    participant_count
  )
  values (
    host_id,
    p_source_type,
    p_source_record_id,
    p_expense_type,
    p_title,
    round(p_total_amount::numeric, 2),
    participant_share,
    participant_count_value
  )
  returning id into split_uuid;

  insert into public.expenses (
    user_id,
    type,
    amount,
    currency,
    occurred_at,
    note,
    split_id,
    split_role,
    created_by
  )
  values (
    host_id,
    p_expense_type,
    host_share,
    'USD',
    now(),
    'Split share • ' || p_title,
    split_uuid,
    'host',
    host_id
  )
  returning id into host_expense_id;

  insert into public.cost_split_members (
    split_id,
    user_id,
    participant_name,
    amount,
    role,
    status,
    expense_id
  )
  values (
    split_uuid,
    host_id,
    coalesce(host_name, 'You'),
    host_share,
    'host',
    'posted',
    host_expense_id
  );

  foreach participant_id in array participant_ids loop
    select coalesce(display_name, email, 'Teammate')
    into participant_name
    from public.profiles
    where id = participant_id;

    if participant_name is null then
      raise exception 'Teammate profile not found';
    end if;

    insert into public.expenses (
      user_id,
      type,
      amount,
      currency,
      occurred_at,
      note,
      split_id,
      split_role,
      created_by
    )
    values (
      participant_id,
      p_expense_type,
      participant_share,
      'USD',
      now(),
      'Split share • ' || p_title,
      split_uuid,
      'member',
      host_id
    )
    returning id into member_expense_id;

    insert into public.cost_split_members (
      split_id,
      user_id,
      participant_name,
      amount,
      role,
      status,
      expense_id
    )
    values (
      split_uuid,
      participant_id,
      participant_name,
      participant_share,
      'member',
      'sent',
      member_expense_id
    );

    insert into public.app_notifications (
      user_id,
      created_by,
      kind,
      title,
      body,
      metadata
    )
    values (
      participant_id,
      host_id,
      'cost_split',
      'New split added',
      coalesce(host_name, 'A teammate') || ' added ' || p_title || ' to your expenses. Your share is $' || to_char(participant_share, 'FM999999990.00'),
      jsonb_build_object(
        'split_id', split_uuid,
        'title', p_title,
        'amount', participant_share,
        'source_type', p_source_type
      )
    );
  end loop;

  insert into public.app_notifications (
    user_id,
    created_by,
    kind,
    title,
    body,
    metadata
  )
  values (
    host_id,
    host_id,
    'cost_split_created',
    'Split created',
    'You split ' || p_title || ' with ' || (participant_count_value - 1) || ' teammate(s).',
    jsonb_build_object(
      'split_id', split_uuid,
      'title', p_title,
      'amount', host_share,
      'source_type', p_source_type
    )
  );

  return split_uuid;
end;
$$;
