import { describe, expect, it } from "vitest";
import { createTranslator, TranslationMissingError, type TranslationSources } from "../../src/i18n";

const sources: TranslationSources = {
  tenant: {
    en: { "welcome.message": "Hi from tenant, {{name}}" },
  },
  application: {
    en: {
      "welcome.message": "Hello, {{name}}",
      "welcome.title": "Welcome",
      nested: { deep: { key: "Deep value" } },
    },
    vi: { "welcome.message": "Xin chào, {{name}}" },
  },
  fallback: {
    en: { "welcome.message": "Fallback hello, {{name}}", "only.in.fallback": "Only fallback" },
  },
};

describe("createTranslator: normal lookup", () => {
  it("resolves a key from the application dictionary", () => {
    const translate = createTranslator(sources, { locale: "en" });
    expect(translate("welcome.title")).toBe("Welcome");
  });

  it("resolves nested-object keys via dot path", () => {
    const translate = createTranslator(sources, { locale: "en" });
    expect(translate("nested.deep.key")).toBe("Deep value");
  });
});

describe("createTranslator: tenant override", () => {
  it("prefers the tenant dictionary over application and fallback", () => {
    const translate = createTranslator(sources, { locale: "en" });
    expect(translate("welcome.message", { name: "Tan" })).toBe("Hi from tenant, Tan");
  });
});

describe("createTranslator: fallback", () => {
  it("falls back to the fallback dictionary when tenant/application don't have the key", () => {
    const translate = createTranslator(sources, { locale: "en" });
    expect(translate("only.in.fallback")).toBe("Only fallback");
  });

  it("falls back across all three layers correctly when only fallback has a key not in tenant", () => {
    const noTenant = createTranslator({ application: sources.application, fallback: sources.fallback }, { locale: "en" });
    expect(noTenant("welcome.message", { name: "Ann" })).toBe("Hello, Ann");
  });
});

describe("createTranslator: missing key", () => {
  it("returns the key itself by default", () => {
    const translate = createTranslator(sources, { locale: "en" });
    expect(translate("totally.missing.key")).toBe("totally.missing.key");
  });

  it("returns an empty string when onMissingKey is 'empty'", () => {
    const translate = createTranslator(sources, { locale: "en", onMissingKey: "empty" });
    expect(translate("totally.missing.key")).toBe("");
  });

  it("invokes a custom onMissingKey function", () => {
    const translate = createTranslator(sources, {
      locale: "en",
      onMissingKey: (key, locale) => `MISSING[${locale}]:${key}`,
    });
    expect(translate("totally.missing.key")).toBe("MISSING[en]:totally.missing.key");
  });

  it("throws TranslationMissingError in strict mode", () => {
    const translate = createTranslator(sources, { locale: "en", strict: true });
    expect(() => translate("totally.missing.key")).toThrow(TranslationMissingError);
  });
});

describe("createTranslator: interpolation", () => {
  it("substitutes a single placeholder", () => {
    const translate = createTranslator(sources, { locale: "en" });
    expect(translate("welcome.message", { name: "Tan" })).toBe("Hi from tenant, Tan");
  });

  it("leaves unmatched placeholders untouched", () => {
    const local: TranslationSources = { application: { en: { greet: "Hi {{name}}, you are {{age}}" } } };
    const translate = createTranslator(local, { locale: "en" });
    expect(translate("greet", { name: "Tan" })).toBe("Hi Tan, you are {{age}}");
  });

  it("supports a custom interpolation delimiter", () => {
    const local: TranslationSources = { application: { en: { greet: "Hi [name]" } } };
    const translate = createTranslator(local, { locale: "en", interpolation: { prefix: "[", suffix: "]" } });
    expect(translate("greet", { name: "Tan" })).toBe("Hi Tan");
  });
});

describe("createTranslator: locale behavior", () => {
  it("uses the translator's default locale", () => {
    const translate = createTranslator(sources, { locale: "vi" });
    expect(translate("welcome.message", { name: "Tan" })).toBe("Xin chào, Tan");
  });

  it("allows overriding locale per call", () => {
    const translate = createTranslator(sources, { locale: "en" });
    expect(translate("welcome.message", { name: "Tan" }, { locale: "vi" })).toBe("Xin chào, Tan");
  });
});
