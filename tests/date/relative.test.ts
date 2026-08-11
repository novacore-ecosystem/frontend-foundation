import { describe, expect, it } from "vitest";
import { relativeTime } from "../../src/date";

const NOW = new Date("2026-08-11T12:00:00Z");

function agoMs(ms: number): Date {
  return new Date(NOW.getTime() - ms);
}

describe("relativeTime", () => {
  it("reports 'just now' style output for very recent instants", () => {
    const result = relativeTime(agoMs(2000), { locale: "en", now: NOW });
    expect(result.toLowerCase()).toContain("now");
  });

  it("formats seconds", () => {
    const result = relativeTime(agoMs(30_000), { locale: "en", now: NOW });
    expect(result).toMatch(/second/);
  });

  it("formats minutes", () => {
    const result = relativeTime(agoMs(5 * 60_000), { locale: "en", now: NOW });
    expect(result).toBe("5 minutes ago");
  });

  it("formats hours", () => {
    const result = relativeTime(agoMs(60 * 60_000), { locale: "en", now: NOW });
    expect(result).toBe("1 hour ago");
  });

  it("formats days", () => {
    const result = relativeTime(agoMs(2 * 24 * 60 * 60_000), { locale: "en", now: NOW });
    expect(result).toBe("2 days ago");
  });

  it("formats weeks", () => {
    const result = relativeTime(agoMs(7 * 24 * 60 * 60_000), { locale: "en", now: NOW });
    expect(result).toBe("last week");
  });

  it("formats weeks with numeric always", () => {
    const result = relativeTime(agoMs(7 * 24 * 60 * 60_000), { locale: "en", now: NOW, numeric: "always" });
    expect(result).toBe("1 week ago");
  });

  it("formats months", () => {
    const result = relativeTime(agoMs(90 * 24 * 60 * 60_000), { locale: "en", now: NOW });
    expect(result).toBe("3 months ago");
  });

  it("formats years", () => {
    const result = relativeTime(agoMs(365 * 24 * 60 * 60_000), { locale: "en", now: NOW });
    expect(result).toBe("last year");
  });

  it("formats years with numeric always", () => {
    const result = relativeTime(agoMs(365 * 24 * 60 * 60_000), { locale: "en", now: NOW, numeric: "always" });
    expect(result).toBe("1 year ago");
  });

  it("supports future instants", () => {
    const future = new Date(NOW.getTime() + 5 * 60_000);
    const result = relativeTime(future, { locale: "en", now: NOW });
    expect(result).toBe("in 5 minutes");
  });

  it("supports locale variation", () => {
    const result = relativeTime(agoMs(5 * 60_000), { locale: "vi", now: NOW });
    expect(result).toContain("5");
  });
});
