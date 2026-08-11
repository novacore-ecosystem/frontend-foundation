import { describe, expect, it } from "vitest";
import {
  buildCriteriaRequest,
  criteriaFilter,
  criteriaSort,
  CriteriaOperators,
  SortDirections,
  type CriteriaRequest,
} from "../../src/api";

describe("CriteriaOperators wire codes", () => {
  it("match the backend's CriteriaOperatorJsonConverter short codes exactly", () => {
    expect(CriteriaOperators.Eq).toBe("eq");
    expect(CriteriaOperators.Ne).toBe("ne");
    expect(CriteriaOperators.Gt).toBe("gt");
    expect(CriteriaOperators.Gte).toBe("gte");
    expect(CriteriaOperators.Lt).toBe("lt");
    expect(CriteriaOperators.Lte).toBe("lte");
    expect(CriteriaOperators.Contains).toBe("c");
    expect(CriteriaOperators.StartsWith).toBe("sw");
    expect(CriteriaOperators.EndsWith).toBe("ew");
    expect(CriteriaOperators.In).toBe("in");
    expect(CriteriaOperators.NotIn).toBe("nin");
    expect(CriteriaOperators.Between).toBe("between");
    expect(CriteriaOperators.IsNull).toBe("null");
    expect(CriteriaOperators.IsNotNull).toBe("notnull");
  });
});

describe("SortDirections wire values", () => {
  it("match the backend's LowerCaseStringEnumConverter output", () => {
    expect(SortDirections.Asc).toBe("asc");
    expect(SortDirections.Desc).toBe("desc");
  });
});

describe("criteriaFilter / criteriaSort builders", () => {
  it("builds a single-value filter", () => {
    expect(criteriaFilter("status", CriteriaOperators.Eq, "active")).toEqual({
      field: "status",
      operator: "eq",
      value: "active",
    });
  });

  it("builds a filter with no value for isnull/isnotnull", () => {
    expect(criteriaFilter("deletedAt", CriteriaOperators.IsNull)).toEqual({
      field: "deletedAt",
      operator: "null",
    });
  });

  it("builds a multi-value 'in' filter", () => {
    expect(criteriaFilter("status", CriteriaOperators.In, ["active", "pending"])).toEqual({
      field: "status",
      operator: "in",
      value: ["active", "pending"],
    });
  });

  it("builds a 'between' filter with exactly two values", () => {
    expect(criteriaFilter("age", CriteriaOperators.Between, [18, 65])).toEqual({
      field: "age",
      operator: "between",
      value: [18, 65],
    });
  });

  it("supports arbitrary/custom field identifiers, not just fixed entity properties", () => {
    expect(criteriaFilter("customField.phoneNumber", CriteriaOperators.Eq, "0969123456").field).toBe(
      "customField.phoneNumber",
    );
  });

  it("builds a sort defaulting to ascending", () => {
    expect(criteriaSort("createdAt")).toEqual({ field: "createdAt", direction: "asc" });
  });

  it("builds a descending sort", () => {
    expect(criteriaSort("createdAt", SortDirections.Desc)).toEqual({ field: "createdAt", direction: "desc" });
  });
});

describe("buildCriteriaRequest — matches backend CriteriaRequest wire shape exactly", () => {
  it("applies backend-matching defaults for an empty request", () => {
    const request = buildCriteriaRequest();
    expect(request).toEqual({
      keyword: undefined,
      filters: [],
      sorts: [],
      page: 1,
      pageSize: 20,
    });
  });

  it("serializes a keyword-only request", () => {
    const request = buildCriteriaRequest({ keyword: "jun" });
    expect(JSON.parse(JSON.stringify(request))).toEqual({
      keyword: "jun",
      filters: [],
      sorts: [],
      page: 1,
      pageSize: 20,
    });
  });

  it("serializes filters and sorts to the exact backend wire shape", () => {
    const request: CriteriaRequest = {
      keyword: "jun",
      filters: [criteriaFilter("age", CriteriaOperators.Gte, 18)],
      sorts: [criteriaSort("name", SortDirections.Desc)],
      page: 1,
      pageSize: 20,
    };
    const built = buildCriteriaRequest(request);
    expect(JSON.parse(JSON.stringify(built))).toEqual({
      keyword: "jun",
      filters: [{ field: "age", operator: "gte", value: 18 }],
      sorts: [{ field: "name", direction: "desc" }],
      page: 1,
      pageSize: 20,
    });
  });

  it("serializes a multi-value 'in' filter exactly like the backend test example", () => {
    const built = buildCriteriaRequest({ filters: [criteriaFilter("status", CriteriaOperators.In, ["Active"])] });
    expect(JSON.parse(JSON.stringify(built))).toMatchObject({
      filters: [{ field: "status", operator: "in", value: ["Active"] }],
    });
  });

  it("serializes special characters and Unicode in string values without corruption", () => {
    const built = buildCriteriaRequest({
      filters: [criteriaFilter("name", CriteriaOperators.Contains, "Nguyễn & Co. \"Test\"")],
    });
    const roundTripped = JSON.parse(JSON.stringify(built));
    expect(roundTripped.filters[0].value).toBe('Nguyễn & Co. "Test"');
  });

  it("serializes boolean and numeric values as raw JSON, not strings", () => {
    const built = buildCriteriaRequest({
      filters: [criteriaFilter("isActive", CriteriaOperators.Eq, true), criteriaFilter("age", CriteriaOperators.Eq, 42)],
    });
    const roundTripped = JSON.parse(JSON.stringify(built));
    expect(roundTripped.filters[0].value).toBe(true);
    expect(roundTripped.filters[1].value).toBe(42);
  });

  it("serializes date values as ISO strings (caller's responsibility, per documented contract)", () => {
    const built = buildCriteriaRequest({
      filters: [criteriaFilter("createdAt", CriteriaOperators.Gte, "2026-08-11T00:00:00Z")],
    });
    expect(built.filters?.[0]?.value).toBe("2026-08-11T00:00:00Z");
  });

  it("preserves multiple sorts in priority order (list order = ThenBy chain on the backend)", () => {
    const built = buildCriteriaRequest({
      sorts: [criteriaSort("createdAt", SortDirections.Desc), criteriaSort("name", SortDirections.Asc)],
    });
    expect(built.sorts).toEqual([
      { field: "createdAt", direction: "desc" },
      { field: "name", direction: "asc" },
    ]);
  });

  it("represents an empty criteria request (keyword/filters/sorts all absent or empty)", () => {
    const built = buildCriteriaRequest({});
    expect(built.filters).toEqual([]);
    expect(built.sorts).toEqual([]);
    expect(built.keyword).toBeUndefined();
  });

  it("clamps neither page nor pageSize — callers/backend own validation, this only fills defaults", () => {
    const built = buildCriteriaRequest({ page: 5, pageSize: 500 });
    expect(built.page).toBe(5);
    expect(built.pageSize).toBe(500);
  });
});
