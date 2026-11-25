import { describe, expect, it } from "vitest";
import {
  CATEGORY_BADGE_BACKGROUNDS,
  CATEGORY_COLORS,
  categoriesFor,
  CATEGORY_NAMES,
  isCategoryFor,
} from "./categories";

describe("categoriesFor", () => {
  it("lists only the expense categories for an expense", () => {
    expect(categoriesFor("Expense")).toEqual([
      "Food",
      "Groceries",
      "Transport",
      "Bills and utilities",
      "Subscriptions",
      "Loans and debt",
      "Shopping",
      "Health",
      "Education",
      "Entertainment",
      "Other",
    ]);
  });

  it("lists only the income categories for income", () => {
    expect(categoriesFor("Income")).toEqual([
      "Salary",
      "Allowance",
      "Gifts",
      "Refunds",
      "Other",
    ]);
  });
});

describe("isCategoryFor", () => {
  it("accepts Other for both types", () => {
    expect(isCategoryFor("Income", "Other")).toBe(true);
    expect(isCategoryFor("Expense", "Other")).toBe(true);
  });

  it("rejects a category of the other type", () => {
    expect(isCategoryFor("Income", "Food")).toBe(false);
    expect(isCategoryFor("Expense", "Salary")).toBe(false);
  });
});

describe("CATEGORY_NAMES", () => {
  it("lists Other only once", () => {
    expect(CATEGORY_NAMES.filter((name) => name === "Other")).toHaveLength(1);
  });
});

describe("category color tokens", () => {
  it("points each category at its color family", () => {
    expect(CATEGORY_COLORS["Loans and debt"]).toBe("var(--category-umber)");
    expect(CATEGORY_BADGE_BACKGROUNDS["Loans and debt"]).toBe(
      "var(--category-umber-bg)",
    );
  });
});
