import { describe, expect, it } from "vitest";
import { normalizeTransactions } from "./transactions";

const saved = {
  id: "a",
  name: "Lunch",
  date: "2026-11-25",
  type: "Expense",
  category: "Food",
  amount: 120,
};

function normalize(changes: Record<string, unknown>) {
  return normalizeTransactions([{ ...saved, ...changes }])[0];
}

describe("normalizeTransactions", () => {
  it.each([
    ["Expense", "Bills", "Bills and utilities"],
    ["Expense", "Grocery", "Groceries"],
    ["Expense", "Transport", "Transport"],
    ["Income", "Allowance", "Allowance"],
    ["Income", "Other", "Other"],
  ])("loads an %s saved as %s into %s", (type, category, expected) => {
    expect(normalize({ type, category }).category).toBe(expected);
  });

  it.each([
    ["Expense", "Housing"],
    ["Expense", "Allowance"],
    ["Expense", "constructor"],
    ["Expense", undefined],
    ["Income", "Food"],
    ["Income", "Bills"],
  ])("files an %s saved as %s under Other", (type, category) => {
    expect(normalize({ type, category })).toMatchObject({
      type,
      category: "Other",
    });
  });

  it("pays with cash when no payment method was saved", () => {
    expect(normalize({}).paymentMethod).toBe("cash");
  });

  it("pays with cash when the saved payment method is unknown", () => {
    expect(normalize({ paymentMethod: "cheque" }).paymentMethod).toBe("cash");
  });

  it("keeps a saved payment method", () => {
    expect(normalize({ paymentMethod: "bdo" }).paymentMethod).toBe("bdo");
  });

  it("treats a record with no type as an expense", () => {
    expect(normalize({ type: undefined }).type).toBe("Expense");
  });

  it("keeps every record, its order and its other fields", () => {
    const result = normalizeTransactions([
      { ...saved, note: "keep me" },
      { ...saved, id: "b", category: "Mystery" },
    ]);

    expect(result.map((t) => t.id)).toEqual(["a", "b"]);
    expect(result[0]).toEqual({
      ...saved,
      note: "keep me",
      paymentMethod: "cash",
    });
  });

  it("skips entries that are not records", () => {
    expect(normalizeTransactions([null, 5, "x", [], saved])).toHaveLength(1);
  });
});
