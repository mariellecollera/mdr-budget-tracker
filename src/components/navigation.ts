import { ArrowLeftRight, ChartLine, LayoutDashboard, Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { matchPath } from "react-router-dom";

/** Stand-in until auth provides the signed-in user. */
export const PLACEHOLDER_USER = { initials: "MS", name: "Mark S." };

export interface NavItem {
  to: string;
  /** Folder tab label, also used as the page title on phones. */
  label: string;
  /** Bottom nav label on phones. */
  shortLabel: string;
  /** Omitted for the Account item, which shows the user's avatar instead. */
  icon?: LucideIcon;
  /** Overrides the visible label as the link's accessible name. */
  accessibleName?: string;
}

const DASHBOARD: NavItem = {
  to: "/",
  label: "Dashboard",
  shortLabel: "Home",
  icon: LayoutDashboard,
};
const TRANSACTIONS: NavItem = {
  to: "/transactions",
  label: "Transactions",
  shortLabel: "Activity",
  icon: ArrowLeftRight,
};
const BILLS: NavItem = {
  to: "/bills",
  label: "Bills",
  shortLabel: "Bills",
  icon: Receipt,
};
const SUMMARY: NavItem = {
  to: "/summary",
  label: "Summary",
  shortLabel: "Summary",
  icon: ChartLine,
};
const ACCOUNT: NavItem = {
  to: "/account",
  label: "Account",
  shortLabel: "Account",
  accessibleName: `Account, signed in as ${PLACEHOLDER_USER.name}`,
};

export const NAV_ITEMS = [DASHBOARD, TRANSACTIONS, BILLS, SUMMARY, ACCOUNT];

/** Routes without their own tab, and the tab they belong under. */
const SUB_PAGES = [
  { path: "/add", title: "Add Transaction", section: TRANSACTIONS },
  { path: "/transaction/:id", title: "View Transaction", section: TRANSACTIONS },
];

export interface CurrentPage {
  title: string;
  section: NavItem;
  /**
   * The `aria-current` value for the section's link: "page" when the link
   * points at this page, "true" when this page only sits under it.
   */
  current: "page" | "true";
}

export function getCurrentPage(pathname: string): CurrentPage | null {
  const item = NAV_ITEMS.find(({ to }) => matchPath(to, pathname));
  if (item) return { title: item.label, section: item, current: "page" };

  const subPage = SUB_PAGES.find(({ path }) => matchPath(path, pathname));
  if (!subPage) return null;
  return { title: subPage.title, section: subPage.section, current: "true" };
}
