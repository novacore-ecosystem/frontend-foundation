import { describe, expect, it } from "vitest";
import {
  addDays,
  buildCriteriaRequest,
  createTranslator,
  createTranslatorFromBootstrap,
  criteriaFilter,
  CriteriaOperators,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPhoneNumber,
  isEmail,
  isSuccessResponse,
  isValidPhoneNumber,
  MessageCode,
  PAGINATION_DEFAULTS,
  relativeTime,
  slugify,
  type ApiResponse,
  type PaginatedResult,
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

  it("exposes platform contracts (api response, pagination, search, error codes) working together", () => {
    const paged: PaginatedResult<{ id: number }> = {
      items: [{ id: 1 }],
      pageNumber: PAGINATION_DEFAULTS.page,
      pageSize: PAGINATION_DEFAULTS.pageSize,
      totalCount: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalPages: 1,
    };
    const response: ApiResponse<PaginatedResult<{ id: number }>> = {
      success: true,
      message: "Request success",
      messageCode: MessageCode.Success,
      data: paged,
    };
    expect(isSuccessResponse(response)).toBe(true);

    const request = buildCriteriaRequest({
      keyword: "jun",
      filters: [criteriaFilter("status", CriteriaOperators.In, ["active", "pending"])],
    });
    expect(request.filters).toEqual([{ field: "status", operator: "in", value: ["active", "pending"] }]);
  });

  it("exposes validation utilities backed by backend-mirrored patterns", () => {
    expect(isEmail("tan@example.com")).toBe(true);
    expect(isEmail("not-an-email")).toBe(false);
  });
});
