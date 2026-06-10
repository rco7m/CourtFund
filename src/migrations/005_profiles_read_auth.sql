-- Allow authenticated users to look up other users' profiles (used by "Invite by ID")
-- NOTE: With client-side Supabase, any column is readable if SELECT is allowed by policy.
-- If you need stricter privacy (e.g., hide `email`), replace this with a SECURITY DEFINER RPC
-- that returns only the safe columns.

drop policy if exists profiles_read_auth on public.profiles;
create policy profiles_read_auth on public.profiles
for select
using (auth.role() = 'authenticated');

