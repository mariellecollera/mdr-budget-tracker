import type { ReactNode } from "react";
import { TransactionsContext } from "./TransactionsContext";
import { useTransactions as useTransactionsData } from "../hooks/useTransactions";

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const value = useTransactionsData();

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}
