import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  startOfDay,
  subtractDays,
  subtractMonths,
  subtractYears,
} from "../../src/date";

describe("addDays", () => {
  it("adds days within a month", () => {
    const result = addDays("2026-08-01", 5);
    expect(result.getDate()).toBe(6);
  });

  it("rolls over a month boundary", () => {
    const result = addDays("2026-08-30", 3);
    expect(result.getMonth()).toBe(8);
    expect(result.getDate()).toBe(2);
  });

  it("rolls over a year boundary", () => {
    const result = addDays("2026-12-30", 3);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(2);
  });

  it("supports negative amounts", () => {
    const result = addDays("2026-08-05", -10);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(26);
  });
});

describe("addWeeks", () => {
  it("adds 7 days per week", () => {
    const result = addWeeks("2026-08-01", 2);
    expect(result.getDate()).toBe(15);
  });
});

describe("addMonths", () => {
  it("adds months within the same year", () => {
    const result = addMonths("2026-01-15", 2);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(15);
  });

  it("clamps to the last day of a shorter month (Jan 31 + 1 month)", () => {
    const result = addMonths("2026-01-31", 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it("clamps correctly into a leap-year February", () => {
    const result = addMonths("2028-01-31", 1);
    expect(result.getFullYear()).toBe(2028);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
  });

  it("rolls over a year boundary", () => {
    const result = addMonths("2026-11-15", 3);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(1);
  });
});

describe("addYears", () => {
  it("adds full years", () => {
    const result = addYears("2026-08-11", 2);
    expect(result.getFullYear()).toBe(2028);
  });

  it("clamps Feb 29 to Feb 28 in a non-leap target year", () => {
    const result = addYears("2028-02-29", 1);
    expect(result.getFullYear()).toBe(2029);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });
});

describe("subtract helpers", () => {
  it("subtractDays mirrors addDays with a negated amount", () => {
    expect(subtractDays("2026-08-10", 5).getDate()).toBe(5);
  });

  it("subtractMonths clamps like addMonths", () => {
    const result = subtractMonths("2026-03-31", 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it("subtractYears handles leap-day clamping", () => {
    const result = subtractYears("2028-02-29", 1);
    expect(result.getFullYear()).toBe(2027);
    expect(result.getDate()).toBe(28);
  });
});

describe("startOfDay / endOfDay", () => {
  it("startOfDay zeroes the time components", () => {
    const result = startOfDay("2026-08-11T15:30:00");
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("endOfDay sets the last millisecond of the day", () => {
    const result = endOfDay("2026-08-11T15:30:00");
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });

  it("does not change the calendar day", () => {
    expect(startOfDay("2026-08-11").getDate()).toBe(11);
    expect(endOfDay("2026-08-11").getDate()).toBe(11);
  });
});
