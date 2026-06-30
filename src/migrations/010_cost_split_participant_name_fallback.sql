create or replace function public.create_cost_split(
  p_source_type text,
  p_source_record_id uuid,
  p_expense_type public.expense_type,
  p_title text,
  p_total_amount numeric,
  p_participant_ids uuid[],
  p_participant_names text[] default null
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
  idx int;
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
    raise exception 'Add at least one teammate before splitting';
  end if;

  participant_share := round((p_total_amount / participant_count_value)::numeric, 2);
  host_share := round((p_total_amount - (participant_share * (participant_count_value - 1)))::numeric, 2);

  select coalesce(display_name, email, 'You')
  into host_name
  from public.profiles
  where id = host_id;

  host_name := coalesce(host_name, 'You');

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
    host_name,
    host_share,
    'host',
    'posted',
    host_expense_id
  );

  for idx in 1 .. coalesce(array_length(participant_ids, 1), 0) loop
    participant_id := participant_ids[idx];
    participant_name := nullif(trim(coalesce(p_participant_names[idx], '')), '');

    if participant_name is null then
      select coalesce(display_name, email)
      into participant_name
      from public.profiles
      where id = participant_id;
    end if;

    participant_name := coalesce(participant_name, 'Teammate');

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
      host_name || ' added ' || p_title || ' to your expenses. Your share is $' || to_char(participant_share, 'FM999999990.00'),
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
