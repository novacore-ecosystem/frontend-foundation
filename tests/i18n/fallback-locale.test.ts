import { describe, expect, it } from "vitest";
import { createTranslator, type TranslationSources } from "../../src/i18n";

const sources: TranslationSources = {
  application: {
    en: { greeting: "Hello", onlyInEnglish: "English-only text" },
    vi: { greeting: "Xin chào" },
  },
};

describe("createTranslator: locale fallback (opt-in, backward compatible)", () => {
  it("does not fall back when fallbackLocale is not provided (existing behavior unchanged)", () => {
    const translate = createTranslator(sources, { locale: "vi" });
    expect(translate("onlyInEnglish")).toBe("onlyInEnglish"); // missing-key default: return the key
  });

  it("falls back to fallbackLocale when the key is missing at the primary locale", () => {
    const translate = createTranslator(sources, { locale: "vi", fallbackLocale: "en" });
    expect(translate("onlyInEnglish")).toBe("English-only text");
  });

  it("prefers the primary locale over the fallback when both have the key", () => {
    const translate = createTranslator(sources, { locale: "vi", fallbackLocale: "en" });
    expect(translate("greeting")).toBe("Xin chào");
  });

  it("does nothing extra when fallbackLocale equals locale", () => {
    const translate = createTranslator(sources, { locale: "en", fallbackLocale: "en" });
    expect(translate("greeting")).toBe("Hello");
  });

  it("still returns the key when the key is missing from both locales", () => {
    const translate = createTranslator(sources, { locale: "vi", fallbackLocale: "en" });
    expect(translate("totally.missing")).toBe("totally.missing");
  });

  it("respects tenant/application priority within the fallback locale too", () => {
    const withTenant: TranslationSources = {
      tenant: { en: { greeting: "Tenant hello" } },
      application: sources.application,
    };
    const translate = createTranslator(withTenant, { locale: "vi", fallbackLocale: "en" });
    // "greeting" exists in vi application dict already, so tenant(en) is never reached.
    expect(translate("greeting")).toBe("Xin chào");
    // but a vi-missing key should reach tenant(en) before application(en).
    const withTenantOnly: TranslationSources = {
      tenant: { en: { onlyInEnglish: "Tenant override" } },
      application: sources.application,
    };
    const translate2 = createTranslator(withTenantOnly, { locale: "vi", fallbackLocale: "en" });
    expect(translate2("onlyInEnglish")).toBe("Tenant override");
  });
});
