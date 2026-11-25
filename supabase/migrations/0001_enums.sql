-- Value lists shared by transactions and bills.
create type public.txn_type as enum ('income', 'expense');
create type public.payment_method as enum ('cash', 'gcash', 'bdo', 'maribank');
create type public.bill_frequency as enum ('once', 'weekly', 'monthly', 'yearly');
