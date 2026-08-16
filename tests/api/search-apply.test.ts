import { describe, expect, it } from "vitest";
import { applyCriteriaFilters, applyCriteriaSorts, criteriaFilter, criteriaSort, CriteriaOperators } from "../../src/api";

interface Row {
  code: string;
  name: string;
  isActive: boolean;
  age?: number | null;
}

const rows: Row[] = [
  { code: "acme", name: "Acme Corporation", isActive: true, age: 5 },
  { code: "globex", name: "Globex Industries", isActive: true, age: 12 },
  { code: "umbrella", name: "Umbrella Group", isActive: false, age: null },
];

describe("applyCriteriaFilters", () => {
  it("returns every row unchanged when there are no filters", () => {
    expect(applyCriteriaFilters(rows, [])).toBe(rows);
  });

  it("filters with eq", () => {
    expect(applyCriteriaFilters(rows, [criteriaFilter("isActive", CriteriaOperators.Eq, true)])).toHaveLength(2);
  });

  it("filters with ne", () => {
    expect(applyCriteriaFilters(rows, [criteriaFilter("isActive", CriteriaOperators.Ne, true)])).toEqual([rows[2]]);
  });

  it("filters with contains, case-insensitively", () => {
    expect(applyCriteriaFilters(rows, [criteriaFilter("name", CriteriaOperators.Contains, "GLOBEX")])).toEqual([
      rows[1],
    ]);
  });

  it("filters with startsWith / endsWith", () => {
    expect(applyCriteriaFilters(rows, [criteriaFilter("code", CriteriaOperators.StartsWith, "ac")])).toEqual([
      rows[0],
    ]);
    expect(applyCriteriaFilters(rows, [criteriaFilter("code", CriteriaOperators.EndsWith, "ex")])).toEqual([rows[1]]);
  });

  it("filters with numeric gt/gte/lt/lte", () => {
    expect(applyCriteriaFilters(rows, [criteriaFilter("age", CriteriaOperators.Gt, 5)])).toEqual([rows[1]]);
    expect(applyCriteriaFilters(rows, [criteriaFilter("age", CriteriaOperators.Gte, 5)])).toHaveLength(2);
    expect(applyCriteriaFilters(rows, [criteriaFilter("age", CriteriaOperators.Lt, 12)])).toEqual([rows[0]]);
  });

  it("filters with in / notIn", () => {
    expect(applyCriteriaFilters(rows, [criteriaFilter("code", CriteriaOperators.In, ["acme", "globex"])])).toHaveLength(
      2,
    );
    expect(
      applyCriteriaFilters(rows, [criteriaFilter("code", CriteriaOperators.NotIn, ["acme", "globex"])]),
    ).toEqual([rows[2]]);
  });

  it("filters with between", () => {
    expect(applyCriteriaFilters(rows, [criteriaFilter("age", CriteriaOperators.Between, [4, 6])])).toEqual([rows[0]]);
  });

  it("filters with isNull / isNotNull", () => {
    expect(applyCriteriaFilters(rows, [criteriaFilter("age", CriteriaOperators.IsNull)])).toEqual([rows[2]]);
    expect(applyCriteriaFilters(rows, [criteriaFilter("age", CriteriaOperators.IsNotNull)])).toHaveLength(2);
  });

  it("combines multiple filters with implicit AND, matching the backend contract (no OR/grouping)", () => {
    expect(
      applyCriteriaFilters(rows, [
        criteriaFilter("isActive", CriteriaOperators.Eq, true),
        criteriaFilter("age", CriteriaOperators.Gt, 5),
      ]),
    ).toEqual([rows[1]]);
  });
});

describe("applyCriteriaSorts", () => {
  it("returns every row unchanged (same reference) when there are no sorts", () => {
    expect(applyCriteriaSorts(rows, [])).toBe(rows);
  });

  it("does not mutate the input array", () => {
    const copy = [...rows];
    applyCriteriaSorts(rows, [criteriaSort("name")]);
    expect(rows).toEqual(copy);
  });

  it("sorts ascending by a string field", () => {
    expect(applyCriteriaSorts(rows, [criteriaSort("name")]).map((r) => r.code)).toEqual([
      "acme",
      "globex",
      "umbrella",
    ]);
  });

  it("sorts descending", () => {
    expect(applyCriteriaSorts(rows, [criteriaSort("age", "desc")]).map((r) => r.code)).toEqual([
      "globex",
      "acme",
      "umbrella",
    ]);
  });

  it("breaks ties on the first field using the next sort, matching the backend's ThenBy chain", () => {
    const tied: Row[] = [
      { code: "b", name: "B", isActive: true, age: 1 },
      { code: "a", name: "A", isActive: true, age: 1 },
    ];
    expect(applyCriteriaSorts(tied, [criteriaSort("age"), criteriaSort("code")]).map((r) => r.code)).toEqual([
      "a",
      "b",
    ]);
  });
});
