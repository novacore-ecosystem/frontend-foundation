import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime } from "../../src/date";

describe("formatDate", () => {
  it("formats using default medium style", () => {
    const result = formatDate("2026-08-11", { locale: "en-US" });
    expect(result).toContain("2026");
  });

  it("respects explicit Intl.DateTimeFormatOptions", () => {
    const result = formatDate("2026-08-11", { locale: "en-US", year: "numeric", month: "long", day: "numeric" });
    expect(result).toBe("August 11, 2026");
  });

  it("supports locale variation", () => {
    const result = formatDate("2026-08-11", { locale: "vi-VN", year: "numeric", month: "2-digit", day: "2-digit" });
    expect(result).toContain("2026");
  });
});

describe("formatDateTime", () => {
  it("formats with date and time by default", () => {
    const result = formatDateTime("2026-08-11T10:30:00", { locale: "en-US" });
    expect(result).toContain("2026");
  });
});
