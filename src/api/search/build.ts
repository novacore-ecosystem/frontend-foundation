import { PAGINATION_DEFAULTS } from "../pagination/types";
import type { CriteriaFilter, CriteriaFilterValue, CriteriaRequest, CriteriaSort } from "./types";
import type { CriteriaOperator, SortDirection } from "./operators";
import { SortDirections } from "./operators";

/** Builds a {@link CriteriaFilter} without hand-typing the operator's wire code. */
export function criteriaFilter(field: string, operator: CriteriaOperator, value?: CriteriaFilterValue): CriteriaFilter {
  return value === undefined ? { field, operator } : { field, operator, value };
}

/** Builds a {@link CriteriaSort}. Defaults to ascending, matching the backend's `SortDirection` default. */
export function criteriaSort(field: string, direction: SortDirection = SortDirections.Asc): CriteriaSort {
  return { field, direction };
}

/**
 * Builds a {@link CriteriaRequest} with backend-matching defaults applied
 * (`page: 1`, `pageSize: 20`, empty `filters`/`sorts` arrays) so callers
 * don't have to repeat those defaults at every call site.
 *
 * Since `CriteriaOperator`/`SortDirection` are typed as their exact wire
 * strings, the object this returns is already in backend-compatible
 * shape — pass it straight to `JSON.stringify` (or your HTTP client's
 * JSON body option) as the POST body for a search endpoint. There is no
 * separate serialization step, because the backend has no bespoke query
 * grammar to encode into (see `CriteriaRequest`'s doc comment).
 */
export function buildCriteriaRequest(input: CriteriaRequest = {}): Required<Omit<CriteriaRequest, "keyword">> &
  Pick<CriteriaRequest, "keyword"> {
  return {
    keyword: input.keyword,
    filters: input.filters ?? [],
    sorts: input.sorts ?? [],
    page: input.page ?? PAGINATION_DEFAULTS.page,
    pageSize: input.pageSize ?? PAGINATION_DEFAULTS.pageSize,
  };
}
