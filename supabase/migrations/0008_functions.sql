-- Functions the app calls over RPC. All are security invoker, so Row Level
-- Security still applies inside them.

-- Records a bill payment as an expense and moves the bill to its next due
-- date, or ends a one-time bill. Both happen or neither does.
create function public.pay_bill(bill_id uuid, amount numeric, paid_on date)
returns public.transactions
language plpgsql
security invoker
set search_path = ''
as $$
declare
  bill       public.bills;
  payment    public.transactions;
  day_wanted int;
  next_month date;
begin
  -- The row lock makes two payments of the same bill run one after the other.
  select b.* into bill
  from public.bills as b
  where b.id = pay_bill.bill_id and b.is_active
  for update;

  if not found then
    raise exception 'Bill not found or already paid' using errcode = 'P0002';
  end if;

  insert into public.transactions
    (type, name, amount, category_id, payment_method, occurred_on, bill_id)
  values
    ('expense', bill.name, pay_bill.amount, bill.category_id,
     bill.payment_method, pay_bill.paid_on, bill.id)
  returning * into payment;

  if bill.frequency = 'once' then
    update public.bills as b set is_active = false where b.id = bill.id;
  elsif bill.frequency = 'weekly' then
    update public.bills as b
    set next_due_date = bill.next_due_date + 7
    where b.id = bill.id;
  else
    -- Month-end rule: a bill due on the 31st falls on the last day of a
    -- shorter month, then returns to the 31st.
    day_wanted := coalesce(bill.due_day, extract(day from bill.next_due_date)::int);
    next_month := (
      date_trunc('month', bill.next_due_date::timestamp)
      + case bill.frequency
          when 'monthly' then interval '1 month'
          else interval '1 year'
        end
    )::date;

    update public.bills as b
    set due_day = day_wanted,
        next_due_date = next_month + least(
          day_wanted,
          extract(day from next_month + interval '1 month - 1 day')::int
        ) - 1
    where b.id = bill.id;
  end if;

  return payment;
end;
$$;

-- Totals for the signed-in user between two dates, both included. Leave a date
-- out to leave that side open; with neither, income minus expenses is the
-- current balance. "end" is a reserved word, hence the quotes.
create function public.get_period_summary("start" date default null, "end" date default null)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with period as (
    select t.type, t.amount, t.category_id, t.payment_method
    from public.transactions as t
    where t.user_id = (select auth.uid())
      and (get_period_summary."start" is null or t.occurred_on >= get_period_summary."start")
      and (get_period_summary."end" is null or t.occurred_on <= get_period_summary."end")
  ),
  by_category as (
    select p.category_id, c.name, c.type, c.color, sum(p.amount) as total
    from period as p
    join public.categories as c on c.id = p.category_id
    group by p.category_id, c.name, c.type, c.color
  ),
  by_payment_method as (
    select p.payment_method, p.type, sum(p.amount) as total
    from period as p
    group by p.payment_method, p.type
  )
  select jsonb_build_object(
    'income', coalesce((select sum(amount) from period where type = 'income'), 0),
    'expenses', coalesce((select sum(amount) from period where type = 'expense'), 0),
    'transaction_count', (select count(*) from period),
    'by_category', coalesce(
      (select jsonb_agg(to_jsonb(bc) order by bc.total desc, bc.name) from by_category as bc),
      '[]'::jsonb
    ),
    'by_payment_method', coalesce(
      (select jsonb_agg(to_jsonb(bp) order by bp.total desc, bp.payment_method) from by_payment_method as bp),
      '[]'::jsonb
    )
  );
$$;

-- Deletes the caller's transactions and returns how many there were.
create function public.delete_all_transactions()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted integer;
begin
  delete from public.transactions as t where t.user_id = (select auth.uid());
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

revoke execute on function
  public.pay_bill(uuid, numeric, date),
  public.get_period_summary(date, date),
  public.delete_all_transactions()
  from public, anon;

grant execute on function
  public.pay_bill(uuid, numeric, date),
  public.get_period_summary(date, date),
  public.delete_all_transactions()
  to authenticated, service_role;
