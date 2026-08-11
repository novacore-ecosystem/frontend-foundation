import { describe, expect, it } from "vitest";
import { formatCurrency } from "../../src/currency";

describe("formatCurrency", () => {
  it("formats VND with no fraction digits by default", () => {
    const result = formatCurrency(100000, "VND", { locale: "vi-VN" });
    expect(result).not.toMatch(/[.,]\d+₫/);
    expect(result).toContain("100.000");
  });

  it("formats USD with 2 fraction digits by default", () => {
    const result = formatCurrency(100, "USD", { locale: "en-US" });
    expect(result).toBe("$100.00");
  });

  it("formats EUR with locale-specific placement", () => {
    const result = formatCurrency(99.9, "EUR", { locale: "de-DE" });
    expect(result).toContain("99,90");
    expect(result).toContain("€");
  });

  it("does not hard-code currency symbols — they come from Intl", () => {
    const usd = formatCurrency(1, "USD", { locale: "en-US" });
    const vnd = formatCurrency(1, "VND", { locale: "en-US" });
    expect(usd).not.toBe(vnd);
  });

  it("supports currencyDisplay: code", () => {
    const result = formatCurrency(100, "USD", { locale: "en-US", currencyDisplay: "code" });
    expect(result).toContain("USD");
  });

  it("allows overriding fraction digits", () => {
    const result = formatCurrency(100, "USD", {
      locale: "en-US",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    expect(result).toBe("$100");
  });
});
