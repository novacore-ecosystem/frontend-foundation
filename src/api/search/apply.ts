import type { CriteriaFilter, CriteriaScalarValue, CriteriaSort } from "./types";

/** `null` means "not comparable" (e.g. mismatched types, or either side is `null`/`undefined`) — callers must treat that as "does not match," never as equal. */
function compare(a: unknown, b: unknown): number | null {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
  return null;
}

function matchesFilter(row: Record<string, unknown>, filter: CriteriaFilter): boolean {
  const rowValue = row[filter.field];
  const filterValue = filter.value;

  switch (filter.operator) {
    case "eq":
      return rowValue === filterValue;
    case "ne":
      return rowValue !== filterValue;
    case "gt": {
      const result = compare(rowValue, filterValue);
      return result !== null && result > 0;
    }
    case "gte": {
      const result = compare(rowValue, filterValue);
      return result !== null && result >= 0;
    }
    case "lt": {
      const result = compare(rowValue, filterValue);
      return result !== null && result < 0;
    }
    case "lte": {
      const result = compare(rowValue, filterValue);
      return result !== null && result <= 0;
    }
    case "c":
      return (
        typeof rowValue === "string" &&
        typeof filterValue === "string" &&
        rowValue.toLowerCase().includes(filterValue.toLowerCase())
      );
    case "sw":
      return (
        typeof rowValue === "string" &&
        typeof filterValue === "string" &&
        rowValue.toLowerCase().startsWith(filterValue.toLowerCase())
      );
    case "ew":
      return (
        typeof rowValue === "string" &&
        typeof filterValue === "string" &&
        rowValue.toLowerCase().endsWith(filterValue.toLowerCase())
      );
    case "in":
      return Array.isArray(filterValue) && filterValue.includes(rowValue as CriteriaScalarValue);
    case "nin":
      return Array.isArray(filterValue) && !filterValue.includes(rowValue as CriteriaScalarValue);
    case "between": {
      if (!Array.isArray(filterValue) || filterValue.length !== 2) return true;
      const [min, max] = filterValue;
      const lower = compare(rowValue, min);
      const upper = compare(rowValue, max);
      return lower !== null && upper !== null && lower >= 0 && upper <= 0;
    }
    case "null":
      return rowValue === null || rowValue === undefined;
    case "notnull":
      return rowValue !== null && rowValue !== undefined;
    default:
      return true;
  }
}

/**
 * Client-side evaluator for `CriteriaFilter[]` — for consumers that need to apply the real
 * filter contract *locally* (e.g. against an already-fetched page of results) when no
 * backend `/search` endpoint exists yet for that entity. This is not a substitute for
 * server-side filtering: it only ever sees whatever rows are already in memory. Field
 * values are read via plain property access (`row[filter.field]`), matching the wire
 * contract's field-name-agnostic design — see `CriteriaFilter`'s doc comment.
 */
export function applyCriteriaFilters<T>(rows: T[], filters: CriteriaFilter[]): T[] {
  if (filters.length === 0) return rows;
  return rows.filter((row) => filters.every((filter) => matchesFilter(row as Record<string, unknown>, filter)));
}

/** Client-side evaluator for `CriteriaSort[]` — same "local-only, not a server substitute" caveat as `applyCriteriaFilters`. Stable multi-field sort: ties on the first field are broken by the next, matching the backend's `ThenBy` chain semantics. Incomparable values (e.g. `null`) sort as equal to everything, deferring to the next sort field. */
export function applyCriteriaSorts<T>(rows: T[], sorts: CriteriaSort[]): T[] {
  if (sorts.length === 0) return rows;
  return [...rows].sort((a, b) => {
    for (const sort of sorts) {
      const result = compare(
        (a as Record<string, unknown>)[sort.field],
        (b as Record<string, unknown>)[sort.field],
      );
      if (result !== null && result !== 0) return sort.direction === "asc" ? result : -result;
    }
    return 0;
  });
}
