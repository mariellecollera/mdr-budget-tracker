import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../../context/ThemeProvider";
import { TransactionsProvider } from "../../context/TransactionsProvider";
import type { Transaction } from "../../types";
import Summary from "./Summary";

const expense = {
  category: "Food",
  type: "Expense",
  paymentMethod: "cash",
} as const;

const transactions: Transaction[] = [
  { ...expense, id: "1", name: "Today", date: "2026-11-25", amount: 100 },
  { ...expense, id: "2", name: "Monday", date: "2026-11-23", amount: 40 },
  {
    id: "3",
    name: "Pay",
    date: "2026-11-25",
    type: "Income",
    category: "Allowance",
    paymentMethod: "cash",
    amount: 500,
  },
  { ...expense, id: "4", name: "Earlier", date: "2026-10-31", amount: 999 },
];

/** The text of the value box that follows a stat label. */
function stat(label: string) {
  return screen.getByText(label).nextElementSibling?.textContent;
}

function click(name: string) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("Summary", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 10, 25, 12));
    window.localStorage.setItem(
      "lumon-transactions",
      JSON.stringify(transactions),
    );
    render(
      <ThemeProvider>
        <TransactionsProvider>
          <Summary />
        </TransactionsProvider>
      </ThemeProvider>,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("totals only today's transactions by default", () => {
    expect(stat("Total Expenses")).toBe("₱100.00");
    expect(stat("Total Income")).toBe("₱500.00");
    expect(stat("Total Transactions")).toBe("2");
    expect(stat("Net Flow")).toBe("₱400.00");
  });

  it("includes the rest of the week in the weekly view", () => {
    click("Weekly");

    expect(stat("Total Expenses")).toBe("₱140.00");
    expect(stat("Total Transactions")).toBe("3");
  });

  it("shows last month after stepping back in the monthly view", () => {
    click("Monthly");
    click("Previous period");

    expect(stat("Total Expenses")).toBe("₱999.00");
    expect(stat("Total Transactions")).toBe("1");
  });

  it("shows an empty state for a period with no transactions", () => {
    click("Next period");

    expect(
      screen.getByText("No transactions logged in this period."),
    ).toBeTruthy();
  });
});
