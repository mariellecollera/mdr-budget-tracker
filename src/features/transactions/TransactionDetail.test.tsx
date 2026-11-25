import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ToastProvider } from "../../context/ToastProvider";
import { TransactionsProvider } from "../../context/TransactionsProvider";
import TransactionDetail from "./TransactionDetail";

const NOT_FOUND = /doesn't exist or was already deleted/;

function renderDetail(id: string) {
  window.localStorage.setItem(
    "lumon-transactions",
    JSON.stringify([
      {
        id: "a",
        name: "Lunch",
        date: "2026-11-25",
        type: "Expense",
        category: "Food",
        amount: 120,
        paymentMethod: "maribank",
      },
    ]),
  );
  render(
    <MemoryRouter initialEntries={[`/transaction/${id}`]}>
      <ToastProvider>
        <TransactionsProvider>
          <Routes>
            <Route path="/" element={<p>Dashboard screen</p>} />
            <Route path="/transaction/:id" element={<TransactionDetail />} />
          </Routes>
        </TransactionsProvider>
      </ToastProvider>
    </MemoryRouter>,
  );
}

function select(label: string) {
  return screen.getByLabelText(label) as HTMLSelectElement;
}

/** The selectable options, without the disabled placeholder. */
function optionsOf(label: string) {
  return Array.from(select(label).options)
    .filter((option) => !option.disabled)
    .map((option) => option.text);
}

describe("TransactionDetail", () => {
  it("says so when the transaction does not exist", () => {
    renderDetail("missing");

    expect(screen.getByText(NOT_FOUND)).toBeTruthy();
  });

  it("offers only the chosen type's categories when editing", () => {
    renderDetail("a");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(optionsOf("Category")).toContain("Groceries");
    expect(optionsOf("Category")).not.toContain("Salary");

    fireEvent.click(screen.getByRole("button", { name: "Income" }));

    expect(optionsOf("Category")).toContain("Salary");
    expect(optionsOf("Category")).not.toContain("Groceries");
    expect(select("Category").value).toBe("");
  });

  it("saves a new payment method", () => {
    renderDetail("a");
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(select("Payment method").value).toBe("maribank");

    fireEvent.change(select("Payment method"), { target: { value: "gcash" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("GCash")).toBeTruthy();
  });

  it("never shows the not found message while deleting", async () => {
    renderDetail("a");
    // The message would be gone again by the time the test could look, so
    // record every node that gets added to the page along the way.
    const added: string[] = [];
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          added.push(node.textContent ?? "");
        }
      }
    });
    observer.observe(document.body, { subtree: true, childList: true });

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    // The confirm button inside the dialog comes first in the document.
    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    expect(await screen.findByText("Dashboard screen")).toBeTruthy();
    observer.disconnect();
    expect(added.filter((text) => NOT_FOUND.test(text))).toEqual([]);
  });
});
