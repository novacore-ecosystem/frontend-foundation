/**
 * Request/response contracts for the platform's authentication flows
 * (login, logout, token refresh, forgot-password, resend-email,
 * register). Every NovaCore admin application needs these identically —
 * unlike `OrderDto`/`ProductStatus`-style business data (explicitly out
 * of scope for this package, see the root `CLAUDE.md`), authentication
 * is cross-cutting session/identity infrastructure in the same category
 * as `TenantBootstrap` (`../bootstrap`) and `CurrentUserAuthorization`
 * (`../authorization`), both already modeled here.
 *
 * **Forward-looking design, not yet backend-audited**: unlike most of
 * this package's contracts, no confirmed backend source file exists for
 * these shapes at the time of writing (only `CurrentUserAuthorization`'s
 * `GET /profiles/current/detail` and `CursorPaginatedResult`'s
 * `GET /notifications/mine` are backend-confirmed — see those types'
 * doc comments and `docs/backend-contract-sync.md`). This mirrors the
 * precedent set by `@novacore/frontend-next-shadcn`'s `Position` domain
 * (see that package's `docs/access-control.md`): a clean, reasonable
 * shape a consuming application's `HttpClient`/token-provider wiring can
 * target today, to be reconciled with the real Auth service's actual
 * request/response fields (and endpoint paths, see `./endpoints`) once
 * audited. Do not treat the paths/fields here as confirmed contracts the
 * way e.g. `PaginatedResult` is.
 */

/** Credential pair for `AuthEndpoints.login`. `usernameOrEmail` accepts either — the real Auth service's actual accepted identifier(s) should be confirmed when this is audited (see module doc comment). */
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

/** The session issued on successful login/refresh. `refreshToken`/`expiresAt` are optional since not every backend issues a separate refresh token or a machine-readable expiry. */
export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  /** ISO 8601 timestamp the access token expires at, if the backend provides one. */
  expiresAt?: string;
}

export type LoginResponse = AuthSession;

/** `refreshToken` omitted when the caller relies on a same-origin cookie-based refresh token instead of one held client-side. */
export interface RefreshTokenRequest {
  refreshToken?: string;
}

export type RefreshTokenResponse = AuthSession;

/** `refreshToken` omitted for a client that only ever holds an access token in memory (nothing to revoke server-side beyond the current bearer token). */
export interface LogoutRequest {
  refreshToken?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

/** Re-sends a pending account email (e.g. email verification) — kept generic via `purpose` rather than one endpoint per email type, since the backend most likely exposes a single resend action keyed by intent. */
export interface ResendEmailRequest {
  email: string;
  purpose?: "verifyEmail" | "confirmAccount";
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

/** Minimal — most backends require email verification before a register call also returns a usable session, so this deliberately does not extend `AuthSession`. */
export interface RegisterResponse {
  id: string;
  email: string;
}
