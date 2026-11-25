import { describe, expect, it } from "vitest";
import {
  endOfMonth,
  endOfWeek,
  formatCurrency,
  isWithinRange,
  shiftDate,
  startOfMonth,
  startOfWeek,
} from "./format";

describe("formatCurrency", () => {
  it("shows pesos with thousands separators and two decimals", () => {
    expect(formatCurrency(1234567.5)).toBe("₱1,234,567.50");
  });

  it("puts the minus sign before the peso sign", () => {
    expect(formatCurrency(-50)).toBe("-₱50.00");
  });

  it("falls back to zero for a value that is not a number", () => {
    expect(formatCurrency("abc")).toBe("₱0.00");
  });
});

describe("week range", () => {
  it("runs from Sunday to Saturday around a midweek date", () => {
    expect(startOfWeek("2026-11-25")).toBe("2026-11-22");
    expect(endOfWeek("2026-11-25")).toBe("2026-11-28");
  });

  it("starts on the same day for a Sunday", () => {
    expect(startOfWeek("2026-11-22")).toBe("2026-11-22");
  });

  it("crosses a year boundary", () => {
    expect(startOfWeek("2027-01-01")).toBe("2026-12-27");
    expect(endOfWeek("2026-12-31")).toBe("2027-01-02");
  });
});

describe("month range", () => {
  it("covers the first to the last day of the month", () => {
    expect(startOfMonth("2026-11-25")).toBe("2026-11-01");
    expect(endOfMonth("2026-11-25")).toBe("2026-11-30");
  });

  it("ends February on the 29th in a leap year", () => {
    expect(endOfMonth("2028-02-10")).toBe("2028-02-29");
  });
});

describe("shiftDate", () => {
  it("moves by one day, one week or one month", () => {
    expect(shiftDate("2026-11-25", "Daily", 1)).toBe("2026-11-26");
    expect(shiftDate("2026-11-25", "Weekly", -1)).toBe("2026-11-18");
    expect(shiftDate("2026-11-25", "Monthly", 1)).toBe("2026-12-25");
  });
});

describe("isWithinRange", () => {
  it("includes both ends of the range and nothing after it", () => {
    expect(isWithinRange("2026-11-01", "2026-11-01", "2026-11-30")).toBe(true);
    expect(isWithinRange("2026-11-30", "2026-11-01", "2026-11-30")).toBe(true);
    expect(isWithinRange("2026-12-01", "2026-11-01", "2026-11-30")).toBe(false);
  });
});
