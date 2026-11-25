import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../lib/apiError";
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
  createTransaction,
  deleteTransaction,
  listCategories,
  listTransactions,
  updateTransaction,
  type CategoryRow,
} from "./api";

const supabase = vi.hoisted(() => ({ client: null as unknown }));

vi.mock("../../lib/supabase", () => ({
  getSupabase: () => supabase.client,
}));

const CATEGORIES: CategoryRow[] = [
  { id: "food", name: "Food", type: "expense" },
  { id: "other-expense", name: "Other", type: "expense" },
  { id: "other-income", name: "Other", type: "income" },
];

const ROW = {
  id: "a",
  name: "Lunch",
  amount: 120.5,
  type: "expense",
  occurred_on: "2026-11-25",
  payment_method: "gcash",
  categories: { name: "Food" },
};

const INPUT: TransactionInput = {
  name: "  Lunch  ",
  date: "2026-11-25",
  type: "Expense",
  category: "Food",
  amount: 120.5,
  paymentMethod: "gcash",
};

const SAVED_ROW = {
  type: "expense",
  name: "Lunch",
  amount: 120.5,
  category_id: "food",
  payment_method: "gcash",
  occurred_on: "2026-11-25",
};

let requests: MockRequest[];

function respondWith(response: MockResponse) {
  const mock = mockSupabase(() => response);
  supabase.client = mock.client;
  requests = mock.requests;
}

beforeEach(() => respondWith(ok([])));

describe("listCategories", () => {
  it("asks for the categories in their set order", async () => {
    respondWith(ok(CATEGORIES));

    await expect(listCategories()).resolves.toEqual(CATEGORIES);
    expect(requests[0].table).toBe("categories");
    expect(callTo(requests[0], "order")).toEqual(["order", "sort_order"]);
  });
});

describe("listTransactions", () => {
  it("turns database rows into app transactions", async () => {
    respondWith(ok([ROW]));

    await expect(listTransactions()).resolves.toEqual([
      {
        id: "a",
        name: "Lunch",
        date: "2026-11-25",
        type: "Expense",
        category: "Food",
        amount: 120.5,
        paymentMethod: "gcash",
      },
    ]);
  });

  it("shows an unknown category as Other", async () => {
    respondWith(ok([{ ...ROW, categories: { name: "Pets" } }]));

    const [transaction] = await listTransactions();

    expect(transaction.category).toBe("Other");
  });

  it("lists newest first without filtering", async () => {
    await listTransactions();

    expect(requests[0].calls.map(([method]) => method)).toEqual([
      "select",
      "order",
      "order",
      "order",
      "range",
    ]);
    expect(callTo(requests[0], "order")).toEqual([
      "order",
      "occurred_on",
      { ascending: false },
    ]);
  });

  it.each([
    [0, 0, 49],
    [2, 100, 149],
  ])("fetches 50 rows for page %i", async (page, first, last) => {
    await listTransactions({}, page);

    expect(callTo(requests[0], "range")).toEqual(["range", first, last]);
  });

  it("applies every filter given", async () => {
    await listTransactions({
      search: " lunch ",
      type: "Income",
      categoryId: "other-income",
      paymentMethod: "bdo",
      from: "2026-11-01",
      to: "2026-11-30",
    });

    expect(requests[0].calls).toEqual(
      expect.arrayContaining([
        ["ilike", "name", "%lunch%"],
        ["eq", "type", "income"],
        ["eq", "category_id", "other-income"],
        ["eq", "payment_method", "bdo"],
        ["gte", "occurred_on", "2026-11-01"],
        ["lte", "occurred_on", "2026-11-30"],
      ]),
    );
  });

  it("searches for wildcard characters literally", async () => {
    await listTransactions({ search: "50%_\\" });

    expect(callTo(requests[0], "ilike")).toEqual([
      "ilike",
      "name",
      "%50\\%\\_\\\\%",
    ]);
  });

  it("ignores a blank search", async () => {
    await listTransactions({ search: "   " });

    expect(callTo(requests[0], "ilike")).toBeUndefined();
  });

  it("throws the status and code of a failed request", async () => {
    respondWith(fail(401, "PGRST301"));

    const error = await listTransactions().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, code: "PGRST301" });
  });
});

describe("createTransaction", () => {
  it("saves the trimmed name and the category's id", async () => {
    respondWith(ok(ROW));

    const saved = await createTransaction(INPUT, CATEGORIES);

    expect(callTo(requests[0], "insert")).toEqual(["insert", SAVED_ROW]);
    expect(saved.id).toBe("a");
  });

  it.each([
    ["Income", "other-income"],
    ["Expense", "other-expense"],
  ] as const)("uses the %s Other category", async (type, id) => {
    respondWith(ok(ROW));

    await createTransaction({ ...INPUT, type, category: "Other" }, CATEGORIES);

    expect(callTo(requests[0], "insert")?.[1]).toMatchObject({
      category_id: id,
    });
  });

  it("sends nothing when the database lacks the category", async () => {
    await expect(createTransaction(INPUT, [])).rejects.toThrow(/Food/);
    expect(requests.flatMap((r) => r.calls)).toEqual([]);
  });

  it("throws when a database rule rejects the row", async () => {
    respondWith(fail(400, "23514"));

    await expect(createTransaction(INPUT, CATEGORIES)).rejects.toMatchObject({
      code: "23514",
    });
  });
});

describe("updateTransaction", () => {
  it("saves the row with that id only", async () => {
    respondWith(ok(ROW));

    await updateTransaction("a", INPUT, CATEGORIES);

    expect(callTo(requests[0], "update")).toEqual(["update", SAVED_ROW]);
    expect(callTo(requests[0], "eq")).toEqual(["eq", "id", "a"]);
  });
});

describe("deleteTransaction", () => {
  it("deletes the row with that id only", async () => {
    respondWith(ok({ id: "a" }));

    await deleteTransaction("a");

    expect(callTo(requests[0], "delete")).toBeDefined();
    expect(callTo(requests[0], "eq")).toEqual(["eq", "id", "a"]);
  });

  it("fails when no row was deleted", async () => {
    respondWith(fail(406, "PGRST116"));

    await expect(deleteTransaction("gone")).rejects.toMatchObject({
      code: "PGRST116",
    });
  });
});
