import type { ApiResponse } from "./types";

/**
 * Narrows an {@link ApiResponse} to its success branch. Note that `data`
 * is not guaranteed to be present even on success — the backend's
 * `ApiResponse<T>.Ok()` (no-arg) and `.NoContent()` factories produce
 * `success: true` responses with no payload.
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } {
  return response.success === true;
}

/** Narrows an {@link ApiResponse} to its failure branch (`success: false`). */
export function isErrorResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false } {
  return response.success === false;
}
