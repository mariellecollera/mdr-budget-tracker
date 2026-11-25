import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  callTo,
  fail,
  mockSupabase,
  ok,
  type MockRequest,
  type MockResponse,
} from "../../test/supabaseMock";
import type { TransactionInput } from "../../types";
import {
  useAddTransaction,
  useDeleteTransaction,
  useTransactionsQuery,
  useUpdateTransaction,
} from "./hooks";

const supabase = vi.hoisted(() => ({ client: null as unknown }));

vi.mock("../../lib/supabase", () => ({
  getSupabase: () => supabase.client,
}));

const INPUT: TransactionInput = {
  name: "Lunch",
  date: "2026-11-25",
  type: "Expense",
  category: "Food",
  amount: 120,
  paymentMethod: "cash",
};

function row(id: string) {
  return {
    id,
    name: "Lunch",
    amount: 120,
    type: "expense",
    occurred_on: "2026-11-25",
    payment_method: "cash",
    categories: { name: "Food" },
  };
}

const rows = (count: number, from = 0) =>
  Array.from({ length: count }, (_, i) => row(`t${from + i}`));

let requests: MockRequest[];

/** Answers category requests itself; `respond` answers the transaction ones. */
function setUpDatabase(respond: (request: MockRequest) => MockResponse) {
  const mock = mockSupabase((request) =>
    request.table === "categories"
      ? ok([{ id: "food", name: "Food", type: "expense" }])
      : respond(request),
  );
  supabase.client = mock.client;
  requests = mock.requests;
}

const requestsTo = (table: string) =>
  requests.filter((request) => request.table === table);

/** Transaction requests that only read. */
const reads = () =>
  requestsTo("transactions").filter((request) => callTo(request, "range"));

let queryClient: QueryClient;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
});

describe("useTransactionsQuery", () => {
  it("loads further pages into one list until a short page", async () => {
    setUpDatabase((request) => {
      const first = callTo(request, "range")?.[1];
      return ok(first === 0 ? rows(50) : rows(3, 50));
    });

    const { result } = renderHook(() => useTransactionsQuery(), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(50));
    expect(result.current.hasNextPage).toBe(true);

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.data).toHaveLength(53));
    expect(result.current.hasNextPage).toBe(false);
  });

  it("reports a failed load", async () => {
    setUpDatabase(() => fail(500, "XX000"));

    const { result } = renderHook(() => useTransactionsQuery(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 500 });
  });

  it("fetches again when the filters change", async () => {
    setUpDatabase(() => ok([]));

    const { result, rerender } = renderHook(
      (search: string) => useTransactionsQuery({ search }),
      { wrapper, initialProps: "" },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    rerender("lunch");

    await waitFor(() => expect(reads()).toHaveLength(2));
    expect(callTo(reads()[1], "ilike")).toBeDefined();
  });
});

describe("transaction mutations", () => {
  function renderWithList<T>(useMutationHook: () => T) {
    return renderHook(
      () => ({ list: useTransactionsQuery(), mutation: useMutationHook() }),
      { wrapper },
    );
  }

  beforeEach(() => {
    setUpDatabase((request) =>
      ok(callTo(request, "single") ? row("a") : [row("a")]),
    );
  });

  it("refetches the list after adding", async () => {
    const { result } = renderWithList(useAddTransaction);
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

    await act(() => result.current.mutation.mutateAsync(INPUT));

    expect(reads()).toHaveLength(2);
  });

  it("refetches the list after updating", async () => {
    const { result } = renderWithList(useUpdateTransaction);
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

    await act(() =>
      result.current.mutation.mutateAsync({ id: "a", input: INPUT }),
    );

    expect(reads()).toHaveLength(2);
  });

  it("refetches the list after deleting", async () => {
    const { result } = renderWithList(useDeleteTransaction);
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

    await act(() => result.current.mutation.mutateAsync("a"));

    expect(reads()).toHaveLength(2);
  });

  it("fetches the categories once for several saves", async () => {
    const { result } = renderHook(useAddTransaction, { wrapper });

    await act(() => result.current.mutateAsync(INPUT));
    await act(() => result.current.mutateAsync(INPUT));

    expect(requestsTo("categories")).toHaveLength(1);
  });

  it("refetches the list even when the save fails", async () => {
    const { result } = renderWithList(useDeleteTransaction);
    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    setUpDatabase((request) =>
      callTo(request, "delete") ? fail(406, "PGRST116") : ok([]),
    );

    await act(() =>
      expect(result.current.mutation.mutateAsync("a")).rejects.toMatchObject({
        code: "PGRST116",
      }),
    );

    expect(reads()).toHaveLength(1);
    await waitFor(() => expect(result.current.list.data).toEqual([]));
  });
});
