import { unwrap } from "../../lib/apiError";
import { isCategoryFor } from "../../lib/categories";
import { getSupabase } from "../../lib/supabase";
import type {
  Category,
  PaymentMethod,
  Transaction,
  TransactionInput,
  TxnType,
} from "../../types";
import type { Database } from "../../types/database";

export const PAGE_SIZE = 50;

type Tables = Database["public"]["Tables"];
type DbTxnType = Database["public"]["Enums"]["txn_type"];

const DB_TYPES: Record<TxnType, DbTxnType> = {
  Income: "income",
  Expense: "expense",
};

const COLUMNS =
  "id, name, amount, type, occurred_on, payment_method, categories(name)";

type TransactionRow = Pick<
  Tables["transactions"]["Row"],
  "id" | "name" | "amount" | "type" | "occurred_on" | "payment_method"
> & { categories: { name: string } | null };

export type CategoryRow = Pick<
  Tables["categories"]["Row"],
  "id" | "name" | "type"
>;

/** Every filter is optional; the ones given must all match. */
export interface TransactionFilters {
  /** Matches any part of the name, ignoring case. */
  search?: string;
  type?: TxnType;
  /** A category id, so income and expense "Other" stay separate. */
  categoryId?: string;
  paymentMethod?: PaymentMethod;
  /** First and last date to include, as YYYY-MM-DD. */
  from?: string;
  to?: string;
}

function toTransaction(row: TransactionRow): Transaction {
  const type: TxnType = row.type === "income" ? "Income" : "Expense";
  const category = row.categories?.name;
  return {
    id: row.id,
    name: row.name,
    date: row.occurred_on,
    type,
    // A category this version of the app doesn't know shows as "Other".
    category: isCategoryFor(type, category) ? category : "Other",
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
  };
}

function categoryIdFor(
  categories: CategoryRow[],
  type: TxnType,
  name: Category,
): string {
  const match = categories.find(
    (c) => c.type === DB_TYPES[type] && c.name === name,
  );
  if (!match) {
    throw new Error(`The database has no ${type} category called "${name}".`);
  }
  return match.id;
}

/** The row to save. The database fills in the id and the owner. */
function toRow(input: TransactionInput, categories: CategoryRow[]) {
  return {
    type: DB_TYPES[input.type],
    name: input.name.trim(),
    amount: input.amount,
    category_id: categoryIdFor(categories, input.type, input.category),
    payment_method: input.paymentMethod,
    occurred_on: input.date,
  };
}

/** Makes %, _ and \ in a search match themselves. */
function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, "\\$&");
}

/** The categories the signed-in user can choose from. */
export async function listCategories(): Promise<CategoryRow[]> {
  return unwrap(
    await getSupabase()
      .from("categories")
      .select("id, name, type")
      .order("sort_order"),
  );
}

/** One page of transactions, newest first. Pages start at 0. */
export async function listTransactions(
  filters: TransactionFilters = {},
  page = 0,
): Promise<Transaction[]> {
  let query = getSupabase().from("transactions").select(COLUMNS);

  const search = filters.search?.trim();
  if (search) query = query.ilike("name", `%${escapeLike(search)}%`);
  if (filters.type) query = query.eq("type", DB_TYPES[filters.type]);
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.paymentMethod) {
    query = query.eq("payment_method", filters.paymentMethod);
  }
  if (filters.from) query = query.gte("occurred_on", filters.from);
  if (filters.to) query = query.lte("occurred_on", filters.to);

  const rows = unwrap(
    await query
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      // A last tie-breaker, so a row can't move between pages.
      .order("id")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
  );
  return rows.map(toTransaction);
}

export async function createTransaction(
  input: TransactionInput,
  categories: CategoryRow[],
): Promise<Transaction> {
  const row = unwrap(
    await getSupabase()
      .from("transactions")
      .insert(toRow(input, categories))
      .select(COLUMNS)
      .single(),
  );
  return toTransaction(row);
}

export async function updateTransaction(
  id: string,
  input: TransactionInput,
  categories: CategoryRow[],
): Promise<Transaction> {
  const row = unwrap(
    await getSupabase()
      .from("transactions")
      .update(toRow(input, categories))
      .eq("id", id)
      .select(COLUMNS)
      .single(),
  );
  return toTransaction(row);
}

/** Fails if nothing was deleted: the row is gone or isn't the user's. */
export async function deleteTransaction(id: string): Promise<void> {
  unwrap(
    await getSupabase()
      .from("transactions")
      .delete()
      .eq("id", id)
      .select("id")
      .single(),
  );
}
