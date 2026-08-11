/**
 * Mirrors `NovaCore.BuildingBlock.Criteria.Enums.CriteriaOperator`
 * (`BuildingBlock.Criteria/Enums/CriteriaOperator.cs`), as encoded on the
 * wire by `CriteriaOperatorJsonConverter` — the converter maps the C#
 * enum's PascalCase member names to short lowercase codes, and **the
 * codes below (not the C# member names) are the actual wire contract**.
 *
 * Represented as string-literal values directly (not a numeric enum),
 * so a `CriteriaOperator` value serialized with `JSON.stringify` is
 * already byte-identical to what the backend expects — no separate
 * enum-to-wire-code mapping step is needed on the frontend side.
 */
export const CriteriaOperators = {
  Eq: "eq",
  Ne: "ne",
  Gt: "gt",
  Gte: "gte",
  Lt: "lt",
  Lte: "lte",
  Contains: "c",
  StartsWith: "sw",
  EndsWith: "ew",
  In: "in",
  NotIn: "nin",
  Between: "between",
  IsNull: "null",
  IsNotNull: "notnull",
} as const satisfies Record<string, string>;

/** A valid `CriteriaOperator` wire code, e.g. `"eq"` or `"sw"`. */
export type CriteriaOperator = (typeof CriteriaOperators)[keyof typeof CriteriaOperators];

/**
 * Mirrors `NovaCore.BuildingBlock.Criteria.Requests.SortDirection`,
 * serialized by the backend's `LowerCaseStringEnumConverter` as lowercase
 * strings (`"asc"` / `"desc"`).
 */
export const SortDirections = {
  Asc: "asc",
  Desc: "desc",
} as const satisfies Record<string, string>;

/** A valid `SortDirection` wire value: `"asc"` or `"desc"`. */
export type SortDirection = (typeof SortDirections)[keyof typeof SortDirections];
