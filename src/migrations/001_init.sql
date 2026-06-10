-- SportFund initial schema (run in Supabase SQL editor or via Supabase CLI)

create extension if not exists pgcrypto;

-- Helper: updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Friends
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'friend_status'
      and n.nspname = 'public'
  ) then
    create type public.friend_status as enum ('pending', 'accepted', 'blocked');
  end if;
end $$;

create table if not exists public.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_user_id uuid not null references auth.users(id) on delete cascade,
  status public.friend_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friends_unique_pair unique (user_id, friend_user_id),
  constraint friends_not_self check (user_id <> friend_user_id)
);

drop trigger if exists friends_set_updated_at on public.friends;
create trigger friends_set_updated_at
before update on public.friends
for each row execute function public.set_updated_at();

-- Courts
create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_text text,
  hourly_rate numeric(10,2) not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists courts_set_updated_at on public.courts;
create trigger courts_set_updated_at
before update on public.courts
for each row execute function public.set_updated_at();

-- Bookings
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'booking_status'
      and n.nspname = 'public'
  ) then
    create type public.booking_status as enum ('draft', 'confirmed', 'cancelled', 'completed');
  end if;
end $$;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  court_id uuid references public.courts(id) on delete set null,
  title text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status public.booking_status not null default 'draft',
  total_cost numeric(10,2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_time_order check (end_time > start_time)
);

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

create table if not exists public.booking_participants (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  share_amount numeric(10,2),
  created_at timestamptz not null default now(),
  constraint booking_participants_unique unique (booking_id, user_id)
);

-- Schedule events (personal calendar)
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'schedule_status'
      and n.nspname = 'public'
  ) then
    create type public.schedule_status as enum ('pending', 'confirmed', 'declined');
  end if;
end $$;

create table if not exists public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  tag text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status public.schedule_status not null default 'pending',
  details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schedule_time_order check (end_time > start_time)
);

drop trigger if exists schedule_events_set_updated_at on public.schedule_events;
create trigger schedule_events_set_updated_at
before update on public.schedule_events
for each row execute function public.set_updated_at();

-- Sessions (workouts/matches)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  occurred_at timestamptz not null default now(),
  duration_minutes int not null default 60,
  rating int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessions_rating_range check (rating is null or (rating >= 1 and rating <= 5))
);

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

create table if not exists public.session_insights (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  insight text not null,
  created_at timestamptz not null default now()
);

-- Gear
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'gear_category'
      and n.nspname = 'public'
  ) then
    create type public.gear_category as enum ('racket', 'shoes', 'string', 'bag', 'accessory', 'other');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'gear_status'
      and n.nspname = 'public'
  ) then
    create type public.gear_status as enum ('active', 'retired');
  end if;
end $$;

create table if not exists public.gear_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category public.gear_category not null default 'other',
  brand text,
  quantity int not null default 1,
  unit text,
  purchase_date date,
  cost numeric(10,2),
  status public.gear_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists gear_items_set_updated_at on public.gear_items;
create trigger gear_items_set_updated_at
before update on public.gear_items
for each row execute function public.set_updated_at();

-- Wallet / expenses
do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'expense_type'
      and n.nspname = 'public'
  ) then
    create type public.expense_type as enum ('booking', 'gear', 'other');
  end if;
end $$;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.expense_type not null default 'other',
  booking_id uuid references public.bookings(id) on delete set null,
  gear_item_id uuid references public.gear_items(id) on delete set null,
  amount numeric(10,2) not null,
  currency text not null default 'USD',
  occurred_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);

-- Simple aggregated stats per user (optional cache)
create table if not exists public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sessions_count int not null default 0,
  hours_total numeric(10,2) not null default 0,
  avg_rating numeric(4,2),
  streak_days int not null default 0,
  updated_at timestamptz not null default now()
);

-- Enable RLS (policies below are permissive for now; tighten before production!)
alter table public.profiles enable row level security;
alter table public.friends enable row level security;
alter table public.courts enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_participants enable row level security;
alter table public.schedule_events enable row level security;
alter table public.sessions enable row level security;
alter table public.session_insights enable row level security;
alter table public.gear_items enable row level security;
alter table public.expenses enable row level security;
alter table public.user_stats enable row level security;

-- Profiles: users can manage their own profile (allow all ops for own row)
drop policy if exists profiles_all_own on public.profiles;
create policy profiles_all_own on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

-- Friends: allow user to read/write rows where they are involved
drop policy if exists friends_involved_all on public.friends;
create policy friends_involved_all on public.friends
for all using (auth.uid() = user_id or auth.uid() = friend_user_id)
with check (auth.uid() = user_id or auth.uid() = friend_user_id);

-- Courts: readable by everyone, writable by authenticated users
drop policy if exists courts_read_all on public.courts;
create policy courts_read_all on public.courts for select using (true);
drop policy if exists courts_write_auth on public.courts;
create policy courts_write_auth on public.courts
for insert with check (auth.role() = 'authenticated');
create policy courts_update_auth on public.courts
for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy courts_delete_auth on public.courts
for delete using (auth.role() = 'authenticated');

-- Bookings: own rows
drop policy if exists bookings_all_own on public.bookings;
create policy bookings_all_own on public.bookings
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Booking participants: allow if participant or booking owner
drop policy if exists booking_participants_access on public.booking_participants;
create policy booking_participants_access on public.booking_participants
for all using (
  auth.uid() = user_id
  or exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
) with check (
  auth.uid() = user_id
  or exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
);

-- Schedule events: own rows
drop policy if exists schedule_events_all_own on public.schedule_events;
create policy schedule_events_all_own on public.schedule_events
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Sessions: own rows
drop policy if exists sessions_all_own on public.sessions;
create policy sessions_all_own on public.sessions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Session insights: allow via session ownership
drop policy if exists session_insights_access on public.session_insights;
create policy session_insights_access on public.session_insights
for all using (
  exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid())
) with check (
  exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid())
);

-- Gear: own rows
drop policy if exists gear_items_all_own on public.gear_items;
create policy gear_items_all_own on public.gear_items
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Expenses: own rows
drop policy if exists expenses_all_own on public.expenses;
create policy expenses_all_own on public.expenses
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- User stats: own row
drop policy if exists user_stats_all_own on public.user_stats;
create policy user_stats_all_own on public.user_stats
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Automatically create profile + stats on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  update public.profiles
  set email = new.email
  where id = new.id and (email is null or email = '');

  insert into public.user_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
