import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  getLocaleMetadata,
  getSupportedLocales,
  isSupportedLocale,
  LOCALE_METADATA,
  normalizeLocale,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "../../src/i18n";

describe("SUPPORTED_LOCALES / DEFAULT_LOCALE", () => {
  it("supports exactly en, vi, zh-CN", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "vi", "zh-CN"]);
  });

  it("defaults to en", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });
});

describe("isSupportedLocale", () => {
  it("accepts valid locales", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("vi")).toBe(true);
    expect(isSupportedLocale("zh-CN")).toBe(true);
  });

  it("rejects an invalid locale", () => {
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale("zh-TW")).toBe(false);
    expect(isSupportedLocale("EN")).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
  });
});

describe("normalizeLocale", () => {
  it("passes through exact supported values", () => {
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("vi")).toBe("vi");
    expect(normalizeLocale("zh-CN")).toBe("zh-CN");
  });

  it("normalizes case and region variations of en", () => {
    expect(normalizeLocale("EN")).toBe("en");
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("en-us")).toBe("en");
  });

  it("normalizes case variations of zh-CN", () => {
    expect(normalizeLocale("zh-cn")).toBe("zh-CN");
    expect(normalizeLocale("ZH-CN")).toBe("zh-CN");
  });

  it("treats bare zh as zh-CN deliberately", () => {
    expect(normalizeLocale("zh")).toBe("zh-CN");
    expect(normalizeLocale("ZH")).toBe("zh-CN");
  });

  it("does not collapse a different Chinese region into zh-CN", () => {
    expect(normalizeLocale("zh-TW")).toBeNull();
    expect(normalizeLocale("zh-HK")).toBeNull();
  });

  it("normalizes region variations of vi", () => {
    expect(normalizeLocale("vi-VN")).toBe("vi");
  });

  it("returns null for an unsupported language", () => {
    expect(normalizeLocale("fr")).toBeNull();
    expect(normalizeLocale("fr-FR")).toBeNull();
    expect(normalizeLocale("ja")).toBeNull();
  });

  it("returns null for null/undefined/empty/garbage input", () => {
    expect(normalizeLocale(null)).toBeNull();
    expect(normalizeLocale(undefined)).toBeNull();
    expect(normalizeLocale("")).toBeNull();
    expect(normalizeLocale("   ")).toBeNull();
    expect(normalizeLocale("not-a-locale-at-all")).toBeNull();
  });

  it("is forward-compatible with a future locale being added without special-casing today", () => {
    // A hypothetical future "ja" (Japanese) locale would simply return null today,
    // not throw or silently coerce to something wrong.
    expect(normalizeLocale("ja-JP")).toBeNull();
  });
});

describe("resolveLocale", () => {
  it("resolves a normalizable value", () => {
    expect(resolveLocale("vi-VN")).toBe("vi");
  });

  it("falls back to DEFAULT_LOCALE when unresolvable", () => {
    expect(resolveLocale("fr")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
  });

  it("falls back to a custom fallback when given", () => {
    expect(resolveLocale("fr", "vi")).toBe("vi");
  });
});

describe("locale metadata", () => {
  it("has metadata for every supported locale with native display names", () => {
    expect(LOCALE_METADATA.en.nativeName).toBe("English");
    expect(LOCALE_METADATA.vi.nativeName).toBe("Tiếng Việt");
    expect(LOCALE_METADATA["zh-CN"].nativeName).toBe("简体中文");
  });

  it("getLocaleMetadata returns the same metadata by code", () => {
    expect(getLocaleMetadata("zh-CN")).toEqual(LOCALE_METADATA["zh-CN"]);
  });

  it("getSupportedLocales returns all locales in SUPPORTED_LOCALES order", () => {
    expect(getSupportedLocales().map((m) => m.code)).toEqual(SUPPORTED_LOCALES);
  });

  it("every locale uses left-to-right direction (documented current state)", () => {
    for (const meta of getSupportedLocales()) {
      expect(meta.direction).toBe("ltr");
    }
  });
});
