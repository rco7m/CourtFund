create or replace function public.is_cost_split_member(target_split_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.cost_split_members m
    where m.split_id = target_split_id
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_cost_split_owner(target_split_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.cost_splits s
    where s.id = target_split_id
      and s.created_by = auth.uid()
  );
$$;

drop policy if exists cost_splits_access on public.cost_splits;
create policy cost_splits_access on public.cost_splits
for select using (
  auth.uid() = created_by
  or public.is_cost_split_member(id)
);

drop policy if exists cost_split_members_access on public.cost_split_members;
create policy cost_split_members_access on public.cost_split_members
for select using (
  auth.uid() = user_id
  or public.is_cost_split_owner(split_id)
);
