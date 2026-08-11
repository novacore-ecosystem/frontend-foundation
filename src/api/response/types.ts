/**
 * Mirrors the backend's canonical API response envelope,
 * `NovaCore.BuildingBlock.Application.Abstractions.Common.ApiResponse<T>`
 * (`BuildingBlock.Application/Abstractions/Common/ApiResponse.cs`), used
 * uniformly by every service (Order, Product, Inventory, Shipping, User,
 * Payment, Notification, Auth, Promotion, Audit) — confirmed by auditing
 * every service's API endpoint definitions in the backend.
 *
 * The backend does NOT put an HTTP status code, timestamp, trace/
 * correlation ID, or free-form metadata in this envelope — status lives
 * only on the HTTP transport layer, not in the JSON body. Do not add
 * those fields here; they would not reflect the actual wire contract.
 *
 * `details` mirrors the backend's `object?` — untyped on the wire. As of
 * this audit, the backend never actually populates it (see
 * `../error/types.ts` for the important caveat about validation errors).
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  /** String error/message code, e.g. `"001"`, `"700"`. See `MessageCode` in `../error`. */
  messageCode?: string | null;
  data?: T | null;
  details?: unknown | null;
}
