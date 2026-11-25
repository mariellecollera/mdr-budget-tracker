-- Reminders and presets for payments that have not happened yet.
create table public.bills (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles on delete cascade,
  name            text not null check (char_length(name) between 1 and 60),
  amount          numeric(12,2) not null check (amount > 0),
  category_id     uuid not null references public.categories,
  payment_method  public.payment_method not null default 'cash',
  frequency       public.bill_frequency not null default 'monthly',
  -- day of the month for monthly and yearly bills, so dates do not drift
  due_day         smallint check (due_day between 1 and 31),
  next_due_date   date not null,
  is_active       boolean not null default true,
  note            text check (char_length(note) <= 200),
  created_at      timestamptz not null default now()
);

create index bills_user_due_idx on public.bills (user_id, next_due_date) where is_active;
