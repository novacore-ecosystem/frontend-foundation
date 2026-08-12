/**
 * Authentication contract shared by `http` and `realtime` — SignalR needs
 * an access-token factory just like the HTTP client does, and both should
 * be wired to the same application-supplied source of truth (see the
 * realtime `configuration` module's doc comment). Deliberately has no
 * browser/storage dependency (no `localStorage`, cookies, etc.) — the
 * consuming application supplies its own implementation.
 */
export interface TokenProvider {
  /** Returns the current access token, or `null` if unauthenticated. */
  getAccessToken(): string | null | Promise<string | null>;
  /**
   * Called after a request fails due to an expired/invalid token (HTTP
   * 401) to obtain a fresh token before retrying once. Optional — omit
   * if the application doesn't support token refresh; the failing
   * request/error is then surfaced to the caller as-is.
   */
  refreshAccessToken?(): string | null | Promise<string | null>;
}
