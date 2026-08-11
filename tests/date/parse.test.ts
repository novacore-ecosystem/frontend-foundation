import { describe, expect, it } from "vitest";
import { parseDateInput } from "../../src/date";

describe("parseDateInput", () => {
  it("clones Date instances", () => {
    const original = new Date(2026, 0, 1);
    const result = parseDateInput(original);
    expect(result.getTime()).toBe(original.getTime());
    expect(result).not.toBe(original);
  });

  it("throws for an invalid Date instance", () => {
    expect(() => parseDateInput(new Date("not a date"))).toThrow(TypeError);
  });

  it("parses a numeric timestamp", () => {
    const ts = Date.UTC(2026, 0, 1);
    expect(parseDateInput(ts).getTime()).toBe(ts);
  });

  it("throws for an invalid numeric timestamp", () => {
    expect(() => parseDateInput(Number.NaN)).toThrow(TypeError);
  });

  it("parses YYYY-MM-DD as local midnight, not UTC midnight", () => {
    const result = parseDateInput("2026-08-11");
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(7);
    expect(result.getDate()).toBe(11);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it("parses YYYY/MM/DD as local midnight", () => {
    const result = parseDateInput("2026/08/11");
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(7);
    expect(result.getDate()).toBe(11);
  });

  it("parses a full ISO string with explicit UTC offset as an unambiguous instant", () => {
    const result = parseDateInput("2026-08-11T00:00:00Z");
    expect(result.getTime()).toBe(Date.UTC(2026, 7, 11, 0, 0, 0));
  });

  it("rejects an impossible calendar date instead of silently rolling over", () => {
    expect(() => parseDateInput("2026-02-30")).toThrow(TypeError);
  });

  it("throws for an unparseable string", () => {
    expect(() => parseDateInput("not-a-date")).toThrow(TypeError);
  });
});
