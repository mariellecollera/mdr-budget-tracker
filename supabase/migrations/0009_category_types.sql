-- A transaction's category must have the transaction's type, and a bill's
-- category must be an expense, because paying a bill records an expense.
alter table public.categories
  add constraint categories_id_type_key unique (id, type);

-- Each new key replaces the single-column one. Keeping both would leave two
-- relationships, and the API could not tell which one categories(name) means.
alter table public.transactions
  drop constraint transactions_category_id_fkey,
  add constraint transactions_category_type_fkey
    foreign key (category_id, type) references public.categories (id, type);

-- Bills have no type of their own, so this column holds the only one allowed.
alter table public.bills
  add column category_type public.txn_type not null default 'expense'
    constraint bills_category_type_check check (category_type = 'expense'),
  drop constraint bills_category_id_fkey,
  add constraint bills_category_type_fkey
    foreign key (category_id, category_type) references public.categories (id, type);
