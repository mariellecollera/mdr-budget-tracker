import type { Category, Transaction, TxnType } from "../types";
import { isCategoryFor } from "./categories";
import { DEFAULT_PAYMENT_METHOD, isPaymentMethod } from "./paymentMethods";

/** Old category names that now go by another one. */
const RENAMED_CATEGORIES = new Map<unknown, Category>([
  ["Bills", "Bills and utilities"],
  ["Grocery", "Groceries"],
]);

function normalizeCategory(type: TxnType, saved: unknown): Category {
  const category = RENAMED_CATEGORIES.get(saved) ?? saved;
  return isCategoryFor(type, category) ? category : "Other";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Brings saved transactions up to the current shape. Every saved record is
 * kept with all its other fields. The category and payment method are replaced
 * only when the saved value is not valid, and a type other than "Income" counts
 * as an expense. Entries that are not objects hold no transaction and are
 * skipped.
 */
export function normalizeTransactions(saved: unknown[]): Transaction[] {
  return saved.filter(isRecord).map((record) => {
    const type: TxnType = record.type === "Income" ? "Income" : "Expense";
    return {
      ...(record as unknown as Transaction),
      type,
      category: normalizeCategory(type, record.category),
      paymentMethod: isPaymentMethod(record.paymentMethod)
        ? record.paymentMethod
        : DEFAULT_PAYMENT_METHOD,
    };
  });
}
