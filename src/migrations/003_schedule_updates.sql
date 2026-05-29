-- Schedule table updates for booking flow
-- Keep schema changes isolated in their own migration.

alter table public.schedule_events
  add column if not exists source text default 'booking',
  add column if not exists venue_latitude numeric(10,7),
  add column if not exists venue_longitude numeric(10,7),
  add column if not exists invited_friend_ids uuid[] default '{}'::uuid[];

create index if not exists schedule_events_user_start_idx
  on public.schedule_events (user_id, start_time desc);

create index if not exists schedule_events_user_sport_idx
  on public.schedule_events (user_id, sport);

