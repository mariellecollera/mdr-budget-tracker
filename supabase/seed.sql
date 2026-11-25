-- Default categories, shared by every user (user_id is null). Safe to run
-- again. Names and color families match src/lib/categories.ts.
insert into public.categories (type, name, color, sort_order)
values
  ('expense', 'Food',                'steel-blue', 1),
  ('expense', 'Groceries',           'olive',      2),
  ('expense', 'Transport',           'teal-grey',  3),
  ('expense', 'Bills and utilities', 'navy',       4),
  ('expense', 'Subscriptions',       'forest',     5),
  ('expense', 'Loans and debt',      'umber',      6),
  ('expense', 'Shopping',            'deep-teal',  7),
  ('expense', 'Health',              'moss',       8),
  ('expense', 'Education',           'ink',        9),
  ('expense', 'Entertainment',       'mint',       10),
  ('expense', 'Other',               'grey',       11),
  ('income',  'Salary',              'forest',     1),
  ('income',  'Allowance',           'sage',       2),
  ('income',  'Gifts',               'olive',      3),
  ('income',  'Refunds',             'steel-blue', 4),
  ('income',  'Other',               'grey',       5)
on conflict (user_id, type, name)
  do update set color = excluded.color, sort_order = excluded.sort_order;
