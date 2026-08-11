import { describe, expect, it } from "vitest";
import { createTranslatorFromBootstrap, isFeatureEnabled, type TenantBootstrap } from "../../src/bootstrap";

describe("isFeatureEnabled", () => {
  it("returns true for a boolean-true flag", () => {
    expect(isFeatureEnabled({ betaDashboard: true }, "betaDashboard")).toBe(true);
  });

  it("returns false for a boolean-false flag", () => {
    expect(isFeatureEnabled({ betaDashboard: false }, "betaDashboard")).toBe(false);
  });

  it("treats a non-empty string variant as enabled", () => {
    expect(isFeatureEnabled({ theme: "dark" }, "theme")).toBe(true);
  });

  it("treats 0 as disabled", () => {
    expect(isFeatureEnabled({ limit: 0 }, "limit")).toBe(false);
  });

  it("uses the default value when the flag is absent", () => {
    expect(isFeatureEnabled({}, "missing", true)).toBe(true);
    expect(isFeatureEnabled(undefined, "missing")).toBe(false);
  });
});

describe("createTranslatorFromBootstrap", () => {
  const bootstrap: TenantBootstrap = {
    tenant: { id: "tenant-1", name: "Acme" },
    locale: "en",
    translations: {
      tenant: { "welcome.message": "Hi from tenant, {{name}}" },
      application: { "welcome.message": "Hello, {{name}}", "welcome.title": "Welcome" },
      fallback: { "welcome.message": "Fallback hello, {{name}}" },
    },
  };

  it("resolves using the bootstrap's locale and layered dictionaries", () => {
    const translate = createTranslatorFromBootstrap(bootstrap);
    expect(translate("welcome.message", { name: "Tan" })).toBe("Hi from tenant, Tan");
    expect(translate("welcome.title")).toBe("Welcome");
  });

  it("falls back to the key when translations are absent entirely", () => {
    const noTranslations: TenantBootstrap = { tenant: { id: "t2" }, locale: "en" };
    const translate = createTranslatorFromBootstrap(noTranslations);
    expect(translate("some.key")).toBe("some.key");
  });
});
