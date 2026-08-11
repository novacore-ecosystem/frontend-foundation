/**
 * Mirrors `NovaCore.BuildingBlock.Application.Abstractions.Common.PaginatedResult<T>`
 * (`BuildingBlock.Application/Abstractions/Common/PaginatedResult.cs`), the
 * single canonical offset-paginated response type used by every service's
 * search/list endpoints (User, Order, Inventory, Promotion, Notification,
 * Audit, Product — confirmed by backend audit, no duplicate/legacy variant
 * found).
 *
 * `pageNumber` is **one-based**, not zero-based — confirmed by the
 * backend's `HasPreviousPage => PageNumber > 1` and by the actual paging
 * query (`Skip((request.Page - 1) * request.PageSize)`). Do not assume
 * zero-based indexing when building UI pagers against this contract.
 */
export interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
}

/**
 * Mirrors `NovaCore.BuildingBlock.Application.Abstractions.Common.CursorPaginatedResult<T>`
 * — the cursor/lazy-load sibling of {@link PaginatedResult}, used by the
 * backend only for `GET /notifications/mine` at the time of this audit.
 * No page number or total count; `nextCursor` is an opaque string and
 * `null` means there is nothing more to load.
 */
export interface CursorPaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Defaults and limits enforced by the backend's `CriteriaRequestValidator`
 * (`BuildingBlock.Criteria/Validation/CriteriaRequestValidator.cs`):
 * page defaults to 1 (one-based, must be >= 1), pageSize defaults to 20
 * and must be within `[1, 200]`.
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
  pageSize: 20,
  maxPageSize: 200,
} as const;
