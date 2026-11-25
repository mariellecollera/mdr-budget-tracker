import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "../context/ThemeProvider";
import { ToastProvider } from "../context/ToastProvider";
import { TransactionsProvider } from "../context/TransactionsProvider";
import App from "./App";

const ACCOUNT_NAME = "Account, signed in as Mark S.";

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <ToastProvider>
          <TransactionsProvider>
            <App />
          </TransactionsProvider>
        </ToastProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

/**
 * The folder tabs and the bottom nav. The stylesheet shows one at a time,
 * but both are in the document here.
 */
function navs() {
  const [tabs, bottom] = screen.getAllByRole("navigation", {
    name: "Primary",
  });
  return { tabs, bottom };
}

/** Each link marked as current, with its `aria-current` value. */
function currentLinks(nav: HTMLElement) {
  return within(nav)
    .getAllByRole("link")
    .filter((link) => link.hasAttribute("aria-current"))
    .map((link) => [
      link.getAttribute("href"),
      link.getAttribute("aria-current"),
    ]);
}

describe("App navigation", () => {
  it.each(["/", "/transactions", "/bills", "/summary", "/account"])(
    "marks only the %s link as the current page",
    (path) => {
      renderAt(path);
      const { tabs, bottom } = navs();

      expect(currentLinks(tabs)).toEqual([[path, "page"]]);
      expect(currentLinks(bottom)).toEqual([[path, "page"]]);
    },
  );

  it.each(["/add", "/transaction/missing"])(
    "marks Transactions as the current section on %s",
    (path) => {
      renderAt(path);
      const { tabs, bottom } = navs();

      expect(currentLinks(tabs)).toEqual([["/transactions", "true"]]);
      expect(currentLinks(bottom)).toEqual([["/transactions", "true"]]);
    },
  );

  it("marks nothing as current on an unknown path", () => {
    renderAt("/nowhere");
    const { tabs, bottom } = navs();

    expect(currentLinks(tabs)).toEqual([]);
    expect(currentLinks(bottom)).toEqual([]);
  });

  it("names the five links for the tabs and the bottom nav", () => {
    renderAt("/");
    const { tabs, bottom } = navs();

    for (const [nav, names] of [
      [tabs, ["Dashboard", "Transactions", "Bills", "Summary"]],
      [bottom, ["Home", "Activity", "Bills", "Summary"]],
    ] as const) {
      expect(within(nav).getAllByRole("link")).toHaveLength(5);
      for (const name of [...names, ACCOUNT_NAME]) {
        expect(within(nav).getByRole("link", { name })).toBeTruthy();
      }
    }
  });

  it.each([
    ["/transactions", "Transactions"],
    ["/bills", "Bills"],
    ["/account", "Account"],
  ])("renders the %s placeholder page", (path, title) => {
    renderAt(path);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeTruthy();
    expect(screen.getByText("This page is coming soon.")).toBeTruthy();
  });

  it("moves to another page from a tab", () => {
    renderAt("/");

    fireEvent.click(within(navs().tabs).getByRole("link", { name: "Bills" }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Bills" }),
    ).toBeTruthy();
    expect(currentLinks(navs().bottom)).toEqual([["/bills", "page"]]);
  });

  it.each([
    ["/add", "Add Transaction"],
    ["/transaction/missing", "View Transaction"],
  ])("titles the phone folder tab on %s", (path, title) => {
    renderAt(path);

    expect(screen.getByText(title)).toBeTruthy();
  });
});
