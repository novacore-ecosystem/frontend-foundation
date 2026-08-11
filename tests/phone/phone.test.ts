import { describe, expect, it } from "vitest";
import { formatPhoneNumber, isValidPhoneNumber, normalizePhoneNumber } from "../../src/phone";

describe("isValidPhoneNumber", () => {
  it("validates a Vietnamese mobile number given as national with region", () => {
    expect(isValidPhoneNumber("0969123456", "VN")).toBe(true);
  });

  it("validates an E.164 number without needing a region", () => {
    expect(isValidPhoneNumber("+84969123456")).toBe(true);
  });

  it("validates a US number", () => {
    expect(isValidPhoneNumber("2015550123", "US")).toBe(true);
  });

  it("rejects an obviously invalid number", () => {
    expect(isValidPhoneNumber("123", "VN")).toBe(false);
  });

  it("rejects a number too short for its region", () => {
    expect(isValidPhoneNumber("0969", "VN")).toBe(false);
  });

  it("rejects garbage input without throwing", () => {
    expect(isValidPhoneNumber("not-a-phone-number", "VN")).toBe(false);
  });
});

describe("normalizePhoneNumber", () => {
  it("normalizes a national VN number to E.164", () => {
    expect(normalizePhoneNumber("0969123456", "VN")).toBe("+84969123456");
  });

  it("leaves an already-E.164 number normalized", () => {
    expect(normalizePhoneNumber("+84969123456")).toBe("+84969123456");
  });

  it("returns null for unparsable input", () => {
    expect(normalizePhoneNumber("not-a-phone-number", "VN")).toBeNull();
  });
});

describe("formatPhoneNumber", () => {
  it("formats internationally by default", () => {
    expect(formatPhoneNumber("+84969123456")).toBe("+84 969 123 456");
  });

  it("formats nationally when requested", () => {
    expect(formatPhoneNumber("+84969123456", undefined, "national")).toBe("0969 123 456");
  });

  it("supports a US number with region inference from national input", () => {
    const result = formatPhoneNumber("2015550123", "US", "national");
    expect(result).toBe("(201) 555-0123");
  });

  it("returns null for unparsable input", () => {
    expect(formatPhoneNumber("garbage", "VN")).toBeNull();
  });
});
