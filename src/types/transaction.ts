import type { Category } from "./category";

export type TxnType = "Income" | "Expense";

export type PaymentMethod = "cash" | "gcash" | "bdo" | "maribank";

export interface Transaction {
  id: string;
  name: string;
  /** Local calendar date as YYYY-MM-DD. */
  date: string;
  type: TxnType;
  category: Category;
  amount: number;
}

/** What the form submits; the hook assigns the id. */
export type TransactionInput = Omit<Transaction, "id">;
