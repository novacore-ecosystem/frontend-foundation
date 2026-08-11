import { describe, expect, it } from "vitest";
import { isAfter, isBefore, isSameDay, isSameMonth, isSameYear } from "../../src/date";

describe("isBefore / isAfter", () => {
  it("compares two dates chronologically", () => {
    expect(isBefore("2026-08-01", "2026-08-02")).toBe(true);
    expect(isBefore("2026-08-02", "2026-08-01")).toBe(false);
    expect(isAfter("2026-08-02", "2026-08-01")).toBe(true);
  });

  it("returns false for equal instants", () => {
    expect(isBefore("2026-08-01", "2026-08-01")).toBe(false);
    expect(isAfter("2026-08-01", "2026-08-01")).toBe(false);
  });
});

describe("isSameDay", () => {
  it("returns true for the same calendar day at different times", () => {
    expect(isSameDay("2026-08-11T01:00:00", "2026-08-11T23:00:00")).toBe(true);
  });

  it("returns false across a day boundary", () => {
    expect(isSameDay("2026-08-11", "2026-08-12")).toBe(false);
  });
});

describe("isSameMonth", () => {
  it("returns true within the same month/year", () => {
    expect(isSameMonth("2026-08-01", "2026-08-30")).toBe(true);
  });

  it("returns false across a year boundary even if the month number matches", () => {
    expect(isSameMonth("2026-08-01", "2027-08-01")).toBe(false);
  });
});

describe("isSameYear", () => {
  it("returns true within the same year", () => {
    expect(isSameYear("2026-01-01", "2026-12-31")).toBe(true);
  });

  it("returns false across years", () => {
    expect(isSameYear("2026-12-31", "2027-01-01")).toBe(false);
  });
});
