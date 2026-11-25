export type ExpenseCategory =
  | "Food"
  | "Groceries"
  | "Transport"
  | "Bills and utilities"
  | "Subscriptions"
  | "Loans and debt"
  | "Shopping"
  | "Health"
  | "Education"
  | "Entertainment"
  | "Other";

export type IncomeCategory =
  | "Salary"
  | "Allowance"
  | "Gifts"
  | "Refunds"
  | "Other";

export type Category = ExpenseCategory | IncomeCategory;

/** Colour family names from the Figma Severance palette. */
export type ColorFamily =
  | "steel-blue"
  | "olive"
  | "teal-grey"
  | "navy"
  | "forest"
  | "umber"
  | "deep-teal"
  | "moss"
  | "ink"
  | "mint"
  | "sage"
  | "grey";

/** "Other" has one definition per transaction type. */
export type CategoryDefinition = { color: ColorFamily } & (
  | { type: "Expense"; name: ExpenseCategory }
  | { type: "Income"; name: IncomeCategory }
);
