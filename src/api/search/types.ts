import type { CriteriaOperator, SortDirection } from "./operators";

/** A single filter value: a scalar, or an array of scalars for `In`/`NotIn`/`Between`. */
export type CriteriaScalarValue = string | number | boolean;

/**
 * Mirrors the backend's `CriteriaFilter.Value` (`System.Text.Json.JsonElement?`)
 * — i.e. "any JSON value the backend's per-field `CriteriaValueConverter`
 * knows how to interpret." A scalar is used for single-value operators
 * (`eq`, `gt`, `sw`, ...); an array is used for `in`/`nin` (any length
 * >= 1) and `between` (exactly 2 elements); `IsNull`/`IsNotNull` expect no
 * value at all. These shape rules are enforced by the backend's
 * `CriteriaRequestValidator`, not by this type — pass a value matching
 * the operator you use.
 *
 * For date/time fields, pass an ISO 8601 string (see the `date` module's
 * `parseDateInput`/`formatDate` for round-tripping to/from `Date`) — the
 * backend converts based on the field's declared type, not the JSON
 * shape, so there is no separate "date value" variant here.
 */
export type CriteriaFilterValue = CriteriaScalarValue | CriteriaScalarValue[] | null;

/**
 * Mirrors `NovaCore.BuildingBlock.Criteria.Requests.CriteriaFilter`
 * (`CriteriaFilter(string Field, CriteriaOperator Operator, JsonElement? Value)`).
 *
 * `field` is a plain string, matching the backend exactly: the wire
 * contract itself is field-name-agnostic (arbitrary/custom field
 * identifiers are accepted), and whitelisting happens server-side, per
 * entity. Do not restrict this type to a fixed set of field names.
 */
export interface CriteriaFilter {
  field: string;
  operator: CriteriaOperator;
  value?: CriteriaFilterValue;
}

/** Mirrors `NovaCore.BuildingBlock.Criteria.Requests.CriteriaSort` (`CriteriaSort(string Field, SortDirection Direction)`). */
export interface CriteriaSort {
  field: string;
  direction: SortDirection;
}

/**
 * Mirrors `NovaCore.BuildingBlock.Criteria.Requests.CriteriaRequest` —
 * the canonical backend search request, bound as a JSON POST body (e.g.
 * `POST /users/search`, `POST /orders/search`) on every search/list
 * endpoint audited (User, Order, Inventory, Product, Promotion).
 *
 * **There is no backend URL query-string DSL for search** (confirmed by
 * audit — no custom model binder or query parser exists for this type
 * anywhere in the backend). Send this shape directly as a JSON request
 * body; do not invent a `field~op~value`-style query string, since the
 * backend does not parse one.
 *
 * `page` is one-based (matching `PaginatedResult`), defaulting to 1;
 * `pageSize` defaults to 20 with a backend-enforced maximum of 200 — see
 * `PAGINATION_DEFAULTS` in the `api/pagination` module (shared, not
 * redefined here).
 */
export interface CriteriaRequest {
  keyword?: string;
  filters?: CriteriaFilter[];
  sorts?: CriteriaSort[];
  page?: number;
  pageSize?: number;
}
