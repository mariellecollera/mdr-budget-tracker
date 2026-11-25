import {
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { TransactionInput } from "../../types";
import {
  createTransaction,
  deleteTransaction,
  listCategories,
  listTransactions,
  PAGE_SIZE,
  updateTransaction,
  type TransactionFilters,
} from "./api";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (filters: TransactionFilters) => ["transactions", filters] as const,
};

/** Default categories rarely change, so they are fetched once. */
export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: listCategories,
  staleTime: Infinity,
});

/**
 * The matching transactions, newest first. `data` is one flat list;
 * `fetchNextPage` loads more while `hasNextPage` is true.
 */
export function useTransactionsQuery(filters: TransactionFilters = {}) {
  return useInfiniteQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: ({ pageParam }) => listTransactions(filters, pageParam),
    initialPageParam: 0,
    // A short page is the last one.
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.length === PAGE_SIZE ? lastPageParam + 1 : undefined,
    select: (data) => data.pages.flat(),
  });
}

/** Refetches every transaction list once a change settles, saved or not. */
function useInvalidateTransactions() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TransactionInput) =>
      createTransaction(
        input,
        await queryClient.ensureQueryData(categoriesQuery),
      ),
    onSettled: useInvalidateTransactions(),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: TransactionInput;
    }) =>
      updateTransaction(
        id,
        input,
        await queryClient.ensureQueryData(categoriesQuery),
      ),
    onSettled: useInvalidateTransactions(),
  });
}

export function useDeleteTransaction() {
  return useMutation({
    mutationFn: deleteTransaction,
    onSettled: useInvalidateTransactions(),
  });
}
