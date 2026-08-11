import { describe, expect, it } from "vitest";
import {
  addDays,
  createTranslator,
  createTranslatorFromBootstrap,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPhoneNumber,
  isValidPhoneNumber,
  relativeTime,
  slugify,
  type TenantBootstrap,
} from "../src/index";

describe("public package API", () => {
  it("exposes date utilities", () => {
    expect(addDays("2026-08-11", 1).getDate()).toBe(12);
    expect(formatDate("2026-08-11", { locale: "en-US" })).toContain("2026");
    expect(relativeTime(new Date(Date.now() - 60_000), { locale: "en" })).toContain("minute");
  });

  it("exposes number and currency utilities", () => {
    expect(formatNumber(1000, { locale: "en-US" })).toBe("1,000");
    expect(formatCurrency(100, "USD", { locale: "en-US" })).toBe("$100.00");
  });

  it("exposes phone utilities", () => {
    expect(isValidPhoneNumber("0969123456", "VN")).toBe(true);
    expect(formatPhoneNumber("+84969123456")).toBe("+84 969 123 456");
  });

  it("exposes string utilities", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("exposes i18n and tenant bootstrap contracts working together", () => {
    const bootstrap: TenantBootstrap = {
      tenant: { id: "t1" },
      locale: "en",
      translations: { application: { "welcome.message": "Hello, {{name}}" } },
    };
    const translate = createTranslatorFromBootstrap(bootstrap);
    expect(translate("welcome.message", { name: "Tan" })).toBe("Hello, Tan");

    const directTranslator = createTranslator(
      { application: { en: { key: "value" } } },
      { locale: "en" },
    );
    expect(directTranslator("key")).toBe("value");
  });
});
