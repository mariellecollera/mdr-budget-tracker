-- Records of money that already moved. Amounts are always positive.
create table public.transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references public.profiles on delete cascade,
  type            public.txn_type not null,
  name            text not null check (char_length(name) between 1 and 60),
  amount          numeric(12,2) not null check (amount > 0 and amount < 10000000000),
  category_id     uuid not null references public.categories,
  payment_method  public.payment_method not null default 'cash',
  occurred_on     date not null default current_date,
  note            text check (char_length(note) <= 200),
  bill_id         uuid references public.bills on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index transactions_user_date_idx on public.transactions (user_id, occurred_on desc);
create index transactions_user_category_idx on public.transactions (user_id, category_id);
