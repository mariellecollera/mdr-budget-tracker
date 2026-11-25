import type { TxnType } from "../types";

export type SummaryFilter = "Daily" | "Weekly" | "Monthly";

export const FILTERS: SummaryFilter[] = ["Daily", "Weekly", "Monthly"];

export const TYPES: TxnType[] = ["Income", "Expense"];
