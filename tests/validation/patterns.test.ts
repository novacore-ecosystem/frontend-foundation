import { describe, expect, it } from "vitest";
import { isBarcode, isEmail, isSku, isSlug } from "../../src/validation";

describe("isEmail (mirrors backend RegexPatterns.Email())", () => {
  it("accepts valid emails", () => {
    expect(isEmail("tan@example.com")).toBe(true);
    expect(isEmail("jun.dev2001@gmail.com")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isEmail("not-an-email")).toBe(false);
    expect(isEmail("missing-domain@")).toBe(false);
    expect(isEmail("@missing-local.com")).toBe(false);
  });

  it("rejects emails starting or ending with a dot in the local part (backend pattern's negative lookahead)", () => {
    expect(isEmail(".leadingdot@example.com")).toBe(false);
  });

  it("is case-insensitive, matching the backend's RegexOptions.IgnoreCase", () => {
    expect(isEmail("Tan@Example.COM")).toBe(true);
  });
});

describe("isSlug (mirrors backend RegexPatterns.Slug())", () => {
  it("accepts valid slugs", () => {
    expect(isSlug("hello-world")).toBe(true);
    expect(isSlug("abc123")).toBe(true);
  });

  it("rejects slugs with invalid characters, leading/trailing hyphens, or consecutive hyphens", () => {
    expect(isSlug("hello world")).toBe(false);
    expect(isSlug("-hello")).toBe(false);
    expect(isSlug("hello-")).toBe(false);
    expect(isSlug("hello--world")).toBe(false);
  });

  it("boundary: a single character is valid", () => {
    expect(isSlug("a")).toBe(true);
  });
});

describe("isSku (mirrors backend RegexPatterns.Sku())", () => {
  it("accepts valid SKUs", () => {
    expect(isSku("ABC123")).toBe(true);
    expect(isSku("A12")).toBe(true);
  });

  it("boundary: rejects a SKU shorter than the 3-character minimum (first + middle + last)", () => {
    expect(isSku("A1")).toBe(false);
  });

  it("rejects SKUs starting with a disallowed character or containing consecutive hyphens", () => {
    expect(isSku("0ABC")).toBe(false);
    expect(isSku("AB--CD")).toBe(false);
  });

  it("boundary: accepts a SKU at the 30-character total length limit", () => {
    expect(isSku("A" + "1".repeat(29))).toBe(true);
  });

  it("boundary: rejects a SKU exceeding the 30-character total length", () => {
    expect(isSku("A" + "1".repeat(30))).toBe(false);
  });
});

describe("isBarcode (mirrors backend RegexPatterns.BarcodeFormat())", () => {
  it("accepts 8-14 digit numeric codes", () => {
    expect(isBarcode("12345678")).toBe(true);
    expect(isBarcode("12345678901234")).toBe(true);
  });

  it("rejects codes shorter than 8 or longer than 14 digits (boundary)", () => {
    expect(isBarcode("1234567")).toBe(false);
    expect(isBarcode("123456789012345")).toBe(false);
  });

  it("rejects non-digit characters", () => {
    expect(isBarcode("1234567A")).toBe(false);
  });
});
