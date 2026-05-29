-- Booking flow extensions for CourtFund

alter table public.schedule_events
  add column if not exists sport text,
  add column if not exists venue_name text,
  add column if not exists venue_address text,
  add column if not exists venue_latitude numeric(10,7),
  add column if not exists venue_longitude numeric(10,7),
  add column if not exists booking_url text,
  add column if not exists estimated_cost numeric(10,2),
  add column if not exists player_count int,
  add column if not exists invited_friend_ids uuid[] default '{}'::uuid[];

alter table public.schedule_events
  add column if not exists source text default 'booking';

create index if not exists schedule_events_user_start_idx
  on public.schedule_events (user_id, start_time desc);

create index if not exists schedule_events_user_sport_idx
  on public.schedule_events (user_id, sport);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'overpass',
  osm_type text,
  osm_id bigint,
  name text not null,
  sport text,
  address text,
  latitude numeric(10,7) not null,
  longitude numeric(10,7) not null,
  rating numeric(3,2),
  price_level int,
  booking_url text,
  phone text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists venues_set_updated_at on public.venues;
create trigger venues_set_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

alter table public.venues enable row level security;

drop policy if exists venues_read_all on public.venues;
create policy venues_read_all on public.venues for select using (true);

drop policy if exists venues_write_auth on public.venues;
create policy venues_write_auth on public.venues
for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
