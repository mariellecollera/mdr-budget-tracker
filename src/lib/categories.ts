import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  "Food",
  "Bills",
  "Grocery",
  "Subscriptions",
  "Transport",
  "Shopping",
  "Allowance",
  "Other",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "var(--category-food-text)",
  Bills: "var(--category-bills-text)",
  Grocery: "var(--category-grocery-text)",
  Subscriptions: "var(--category-subscriptions-text)",
  Transport: "var(--category-transport-text)",
  Shopping: "var(--category-shopping-text)",
  Allowance: "var(--category-allowance-text)",
  Other: "var(--category-other-text)",
};

export const CATEGORY_BADGE_BACKGROUNDS: Record<Category, string> = {
  Food: "var(--category-food-bg)",
  Bills: "var(--category-bills-bg)",
  Grocery: "var(--category-grocery-bg)",
  Subscriptions: "var(--category-subscriptions-bg)",
  Transport: "var(--category-transport-bg)",
  Shopping: "var(--category-shopping-bg)",
  Allowance: "var(--category-allowance-bg)",
  Other: "var(--category-other-bg)",
};
