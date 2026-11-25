import { isCategoryFor } from "../../lib/categories";
import type { Category, PaymentMethod, TxnType } from "../../types";

/** Form state for the add and edit transaction screens. */
export interface TransactionForm {
  name: string;
  date: string;
  type: TxnType;
  /** Empty until the user picks one. */
  category: Category | "";
  /** Kept as a string while typing; converted to a number on save. */
  amount: string;
  paymentMethod: PaymentMethod;
}

export type TransactionFormErrors = Partial<Record<keyof TransactionForm, string>>;

/** Switches the type, clearing a category the new type doesn't offer. */
export function withType(
  form: TransactionForm,
  type: TxnType,
): TransactionForm {
  return {
    ...form,
    type,
    category: isCategoryFor(type, form.category) ? form.category : "",
  };
}
