import type { Category, TxnType } from "../../types";

/** Form state for the add and edit transaction screens. */
export interface TransactionForm {
  name: string;
  date: string;
  type: TxnType;
  /** Empty until the user picks one. */
  category: Category | "";
  /** Kept as a string while typing; converted to a number on save. */
  amount: string;
}

export type TransactionFormErrors = Partial<Record<keyof TransactionForm, string>>;
