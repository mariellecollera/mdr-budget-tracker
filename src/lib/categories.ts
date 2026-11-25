import type { Category, CategoryDefinition, TxnType } from "../types";

export const CATEGORIES: CategoryDefinition[] = [
  { type: "Expense", name: "Food", color: "steel-blue" },
  { type: "Expense", name: "Groceries", color: "olive" },
  { type: "Expense", name: "Transport", color: "teal-grey" },
  { type: "Expense", name: "Bills and utilities", color: "navy" },
  { type: "Expense", name: "Subscriptions", color: "forest" },
  { type: "Expense", name: "Loans and debt", color: "umber" },
  { type: "Expense", name: "Shopping", color: "deep-teal" },
  { type: "Expense", name: "Health", color: "moss" },
  { type: "Expense", name: "Education", color: "ink" },
  { type: "Expense", name: "Entertainment", color: "mint" },
  { type: "Expense", name: "Other", color: "grey" },
  { type: "Income", name: "Salary", color: "forest" },
  { type: "Income", name: "Allowance", color: "sage" },
  { type: "Income", name: "Gifts", color: "olive" },
  { type: "Income", name: "Refunds", color: "steel-blue" },
  { type: "Income", name: "Other", color: "grey" },
];

/** Every category name once, for filters that span both types. */
export const CATEGORY_NAMES: Category[] = [
  ...new Set(CATEGORIES.map((c) => c.name)),
];

export function categoriesFor(type: TxnType): Category[] {
  return CATEGORIES.filter((c) => c.type === type).map((c) => c.name);
}

export function isCategoryFor(
  type: TxnType,
  category: unknown,
): category is Category {
  return CATEGORIES.some((c) => c.type === type && c.name === category);
}

function tokenVars(suffix: "" | "-bg"): Record<Category, string> {
  return Object.fromEntries(
    CATEGORIES.map((c) => [c.name, `var(--category-${c.color}${suffix})`]),
  ) as Record<Category, string>;
}

export const CATEGORY_COLORS = tokenVars("");

export const CATEGORY_BADGE_BACKGROUNDS = tokenVars("-bg");
