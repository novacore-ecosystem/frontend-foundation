import { describe, expect, it } from "vitest";
import { formatDecimal, formatNumber, formatPercent } from "../../src/number";

describe("formatNumber", () => {
  it("formats integers with grouping", () => {
    expect(formatNumber(1234567, { locale: "en-US" })).toBe("1,234,567");
  });

  it("respects locale-specific grouping and decimal separators", () => {
    expect(formatNumber(1234.5, { locale: "de-DE" })).toBe("1.234,5");
  });

  it("forwards arbitrary Intl.NumberFormatOptions", () => {
    expect(formatNumber(0.5, { locale: "en-US", style: "percent" })).toBe("50%");
  });
});

describe("formatDecimal", () => {
  it("formats an integer with default fraction digit range", () => {
    expect(formatDecimal(1234, { locale: "en-US" })).toBe("1,234");
  });

  it("formats a decimal value", () => {
    expect(formatDecimal(1234.5, { locale: "en-US" })).toBe("1,234.5");
  });

  it("respects explicit fraction digit bounds", () => {
    expect(
      formatDecimal(1, { locale: "en-US", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ).toBe("1.00");
  });
});

describe("formatPercent", () => {
  it("formats a fraction as a percentage", () => {
    expect(formatPercent(0.5, { locale: "en-US" })).toBe("50%");
  });

  it("supports fraction digits", () => {
    expect(formatPercent(0.505, { locale: "en-US", maximumFractionDigits: 1 })).toBe("50.5%");
  });

  it("respects locale", () => {
    const result = formatPercent(0.5, { locale: "vi-VN" });
    expect(result).toContain("50");
  });
});
