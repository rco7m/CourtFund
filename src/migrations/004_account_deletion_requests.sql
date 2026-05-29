-- Track account deletion requests (actual auth user deletion must be done server-side).

create table if not exists public.account_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  note text
);

create index if not exists account_deletion_requests_user_requested_idx
  on public.account_deletion_requests (user_id, requested_at desc);

alter table public.account_deletion_requests enable row level security;

drop policy if exists account_deletion_requests_own on public.account_deletion_requests;
create policy account_deletion_requests_own on public.account_deletion_requests
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

