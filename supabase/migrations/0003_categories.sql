-- Shared by transactions and bills. A null user_id marks a shared default.
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles on delete cascade,
  name        text not null check (char_length(name) between 1 and 30),
  type        public.txn_type not null,
  color       text not null, -- color family token, e.g. 'steel-blue'
  sort_order  int not null default 0,
  unique nulls not distinct (user_id, type, name)
);
