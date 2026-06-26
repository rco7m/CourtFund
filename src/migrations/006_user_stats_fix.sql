create table if not exists public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sessions_count int not null default 0,
  hours_total numeric(10,2) not null default 0,
  avg_rating numeric(4,2),
  streak_days int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_stats enable row level security;

drop policy if exists user_stats_all_own on public.user_stats;
create policy user_stats_all_own on public.user_stats
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
