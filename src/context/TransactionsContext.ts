import { createContext, useContext } from "react";
import type { TransactionsStore } from "../hooks/useTransactions";

export const TransactionsContext = createContext<TransactionsStore | undefined>(
  undefined,
);

export function useTransactions() {
  const context = useContext(TransactionsContext);

  if (context === undefined) {
    throw new Error(
      "useTransactions() must be used inside a <TransactionsProvider>",
    );
  }

  return context;
}
