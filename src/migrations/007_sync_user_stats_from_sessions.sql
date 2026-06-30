create or replace function public.refresh_user_stats_for_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sessions_count_value int := 0;
  hours_total_value numeric(10,2) := 0;
  avg_rating_value numeric(4,2) := null;
  streak_days_value int := 0;
  session_days date[] := '{}';
  cursor_day date := null;
begin
  if target_user_id is null then
    return;
  end if;

  select
    count(*)::int,
    coalesce(sum(coalesce(duration_minutes, 0)) / 60.0, 0)::numeric(10,2),
    avg(rating)::numeric(4,2)
  into
    sessions_count_value,
    hours_total_value,
    avg_rating_value
  from public.sessions
  where user_id = target_user_id;

  select coalesce(array_agg(distinct timezone('utc', occurred_at)::date), '{}')
  into session_days
  from public.sessions
  where user_id = target_user_id;

  if current_date = any(session_days) then
    cursor_day := current_date;
  elsif (current_date - 1) = any(session_days) then
    cursor_day := current_date - 1;
  end if;

  while cursor_day is not null and cursor_day = any(session_days) loop
    streak_days_value := streak_days_value + 1;
    cursor_day := cursor_day - 1;
  end loop;

  insert into public.user_stats (
    user_id,
    sessions_count,
    hours_total,
    avg_rating,
    streak_days,
    updated_at
  )
  values (
    target_user_id,
    sessions_count_value,
    hours_total_value,
    avg_rating_value,
    streak_days_value,
    now()
  )
  on conflict (user_id) do update
  set
    sessions_count = excluded.sessions_count,
    hours_total = excluded.hours_total,
    avg_rating = excluded.avg_rating,
    streak_days = excluded.streak_days,
    updated_at = now();
end;
$$;

create or replace function public.sync_user_stats_from_sessions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_user_stats_for_user(coalesce(new.user_id, old.user_id));

  if tg_op = 'UPDATE' and new.user_id is distinct from old.user_id then
    perform public.refresh_user_stats_for_user(old.user_id);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists sessions_sync_user_stats on public.sessions;
create trigger sessions_sync_user_stats
after insert or update or delete on public.sessions
for each row execute function public.sync_user_stats_from_sessions();

insert into public.user_stats (user_id)
select distinct user_id
from public.sessions
where user_id is not null
on conflict (user_id) do nothing;

do $$
declare
  session_owner_id uuid;
begin
  for session_owner_id in
    select distinct user_id from public.sessions where user_id is not null
  loop
    perform public.refresh_user_stats_for_user(session_owner_id);
  end loop;
end;
$$;
