import { describe, expect, it } from "vitest";
import { PAGINATION_DEFAULTS, type CursorPaginatedResult, type PaginatedResult } from "../../src/api";

describe("PaginatedResult contract", () => {
  it("represents a full page result", () => {
    const result: PaginatedResult<{ id: number }> = {
      items: [{ id: 1 }, { id: 2 }],
      pageNumber: 1,
      pageSize: 20,
      totalCount: 2,
      hasNextPage: false,
      hasPreviousPage: false,
      totalPages: 1,
    };
    expect(result.items).toHaveLength(2);
  });

  it("represents an empty page (boundary: zero results)", () => {
    const result: PaginatedResult<never> = {
      items: [],
      pageNumber: 1,
      pageSize: 20,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      totalPages: 0,
    };
    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(0);
  });

  it("represents a mid-range page with both next and previous available (boundary)", () => {
    const result: PaginatedResult<number> = {
      items: [21, 22],
      pageNumber: 2,
      pageSize: 20,
      totalCount: 45,
      hasNextPage: true,
      hasPreviousPage: true,
      totalPages: 3,
    };
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPreviousPage).toBe(true);
  });

  it("uses one-based page numbering, matching the backend's Skip((Page - 1) * PageSize)", () => {
    expect(PAGINATION_DEFAULTS.page).toBe(1);
  });

  it("exposes the backend's default and max page size", () => {
    expect(PAGINATION_DEFAULTS.pageSize).toBe(20);
    expect(PAGINATION_DEFAULTS.maxPageSize).toBe(200);
  });
});

describe("CursorPaginatedResult contract", () => {
  it("represents a page with more results available", () => {
    const result: CursorPaginatedResult<{ id: number }> = {
      items: [{ id: 1 }],
      nextCursor: "opaque-cursor-value",
      hasMore: true,
    };
    expect(result.hasMore).toBe(true);
  });

  it("represents the last page (null cursor means no more)", () => {
    const result: CursorPaginatedResult<{ id: number }> = {
      items: [{ id: 1 }],
      nextCursor: null,
      hasMore: false,
    };
    expect(result.nextCursor).toBeNull();
    expect(result.hasMore).toBe(false);
  });
});
