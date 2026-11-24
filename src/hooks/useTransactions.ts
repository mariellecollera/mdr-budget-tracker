import { useCallback, useEffect, useState } from "react";
import type { Transaction, TransactionInput } from "../types";

const STORAGE_KEY = "lumon-transactions";
const BUDGET_STORAGE_KEY = "lumon-budget";

function readFromStorage(): Transaction[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(transactions: Transaction[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    // storage can fail (quota, private mode) -- fail silently, in-memory
    // state still keeps the app usable for the current session.
  }
}

function readBudgetFromStorage(): number {
  try {
    const raw = window.localStorage.getItem(BUDGET_STORAGE_KEY);
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

function writeBudgetToStorage(budget: number) {
  try {
    window.localStorage.setItem(BUDGET_STORAGE_KEY, String(budget));
  } catch {
    // storage can fail (quota, private mode) -- fail silently, in-memory
    // state still keeps the app usable for the current session.
  }
}

/**
 * useTransactions
 * ----------------
 * A single reusable hook that owns all persistent read/write access to
 * transaction data (backed by localStorage here, but any component that
 * needs transactions calls this hook instead of touching storage directly).
 *
 * Returns:
 *  - transactions: the current list
 *  - addTransaction(data)
 *  - updateTransaction(id, data)
 *  - deleteTransaction(id)
 *  - getTransaction(id)
 */
export function useTransactions() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(readFromStorage);
  const [budget, setBudget] = useState<number>(readBudgetFromStorage);

  // Keep localStorage in sync whenever the list changes.
  useEffect(() => {
    writeToStorage(transactions);
  }, [transactions]);

  useEffect(() => {
    writeBudgetToStorage(budget);
  }, [budget]);

  const addTransaction = useCallback((data: TransactionInput) => {
    const newTransaction: Transaction = { id: crypto.randomUUID(), ...data };
    setTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((id: string, data: Partial<TransactionInput>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data, id } : t)),
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTransaction = useCallback(
    (id: string | undefined) => transactions.find((t) => t.id === id),
    [transactions],
  );

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransaction,
    budget,
    setBudget,
  };
}

export type TransactionsStore = ReturnType<typeof useTransactions>;
