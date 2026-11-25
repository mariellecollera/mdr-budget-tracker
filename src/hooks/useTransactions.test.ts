import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { TransactionInput } from "../types";
import { useTransactions } from "./useTransactions";

const STORAGE_KEY = "lumon-transactions";

const lunch: TransactionInput = {
  name: "Lunch",
  date: "2026-11-25",
  type: "Expense",
  category: "Food",
  amount: 120,
  paymentMethod: "gcash",
};

function seed(...ids: string[]) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(ids.map((id) => ({ ...lunch, id }))),
  );
}

function stored() {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
}

describe("useTransactions", () => {
  it("adds a transaction with an id and saves it", () => {
    const { result } = renderHook(() => useTransactions());

    act(() => {
      result.current.addTransaction(lunch);
    });

    expect(result.current.transactions).toEqual([
      { ...lunch, id: expect.any(String) },
    ]);
    expect(stored()).toEqual(result.current.transactions);
  });

  it("lists the newest transaction first", () => {
    const { result } = renderHook(() => useTransactions());

    act(() => {
      result.current.addTransaction(lunch);
      result.current.addTransaction({ ...lunch, name: "Dinner" });
    });

    expect(result.current.transactions.map((t) => t.name)).toEqual([
      "Dinner",
      "Lunch",
    ]);
  });

  it("updates only the matching transaction and keeps its id", () => {
    seed("a", "b");
    const { result } = renderHook(() => useTransactions());

    act(() => {
      result.current.updateTransaction("a", { amount: 200 });
    });

    expect(stored()).toEqual([
      { ...lunch, id: "a", amount: 200 },
      { ...lunch, id: "b" },
    ]);
  });

  it("deletes a transaction from state and storage", () => {
    seed("a");
    const { result } = renderHook(() => useTransactions());

    act(() => {
      result.current.deleteTransaction("a");
    });

    expect(result.current.getTransaction("a")).toBeUndefined();
    expect(stored()).toEqual([]);
  });

  it("upgrades old saved data and writes it back", () => {
    const old = {
      id: "a",
      name: "Water",
      date: "2026-11-25",
      type: "Expense",
      category: "Bills",
      amount: 300,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([old]));

    const { result } = renderHook(() => useTransactions());

    const upgraded = [
      { ...old, category: "Bills and utilities", paymentMethod: "cash" },
    ];
    expect(result.current.transactions).toEqual(upgraded);
    expect(stored()).toEqual(upgraded);
  });

  it.each(["not json", '{"id":"a"}'])(
    "starts empty when storage holds %s",
    (raw) => {
      window.localStorage.setItem(STORAGE_KEY, raw);

      const { result } = renderHook(() => useTransactions());

      expect(result.current.transactions).toEqual([]);
    },
  );
});
