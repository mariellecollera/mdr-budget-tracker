-- Row Level Security decides which rows a user sees; grants decide which
-- tables a role can reach at all. Both are needed.
alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.bills        enable row level security;
alter table public.transactions enable row level security;

-- Each user sees and changes only their own rows.
create policy "own profile" on public.profiles
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "own bills" on public.bills
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own transactions" on public.transactions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Default categories are readable by everyone signed in.
create policy "read categories" on public.categories
  for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));

-- Explicit grants, so the result does not depend on the project's defaults.
revoke all on public.profiles, public.categories, public.bills, public.transactions
  from anon, authenticated;

-- Profiles are created by a trigger and removed along with the auth user.
grant select, update on public.profiles to authenticated;
grant select on public.categories to authenticated;
grant select, insert, update, delete on public.bills, public.transactions to authenticated;

-- The keep-alive job queries categories with the public key. No policy covers
-- anon, so it always gets an empty list.
grant select on public.categories to anon;

grant all on public.profiles, public.categories, public.bills, public.transactions
  to service_role;
