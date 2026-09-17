/**
 * Request/response contracts for the platform's authentication flows (login, logout, token
 * refresh, register, email confirmation, resend-email, forgot-password) — cross-cutting
 * session/identity infrastructure every NovaCore admin application needs identically, in the
 * same category as `TenantBootstrap` (`../bootstrap`) and `CurrentUserAuthorization`
 * (`../authorization`), both already modeled here.
 *
 * **Backend-confirmed** (unlike the "forward-looking" design this module started as): audited
 * directly against `Auth.API/Endpoints/Authentication/*.cs` in `core-backend` on 2026-09-15,
 * the day the Auth service shipped its email-confirmation/registration-defaults/session work
 * (`docs/backend-contract-sync.md` — search anchors: `LoginHandler`, `RegisterHandler`,
 * `ConfirmEmailHandler`, `ResendEmailHandler`, `ForgotPasswordHandler`).
 *
 * **The backend issues no bearer token in any response body.** `Login`/`RefreshToken` set
 * `AccessToken`/`RefreshToken` as HTTP-only cookies and return an empty `ApiResponse<object>` —
 * the browser holds the session, JavaScript never sees the token. `AuthSession` below reflects
 * that: it is populated by fetching the current user (`UserEndpoints.getMe`) right after a
 * successful login/refresh, not by anything the login call itself returns. See
 * `@novacore/frontend-next-shadcn`'s `useAuth` for the hook that wires this together.
 *
 * `X-Tenant-Client-Key` (required on every `login`) and `X-App-Key` (required on `login`/
 * `register`/`refreshToken` for every account except the singleton Root, which bypasses App
 * resolution entirely) are **not** part of any request body below — the backend reads them as
 * headers (`HeaderKeyConstant.TenantClientKey`/`AppKey`). Configure them once as default headers
 * on the `HttpClient` instance (`HttpClientOptions.headers`), the same way every other
 * per-deployment constant (base URL, timeout) is configured — not threaded through every call.
 */

/** Body of `AuthEndpoints.login` — headers carry tenant/app resolution, see module doc comment. */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response of `AuthEndpoints.login`/`AuthEndpoints.refreshToken` — no tokens (those are
 * cookie-only, see module doc comment), just the tenant's current Bootstrap Version as of this
 * login/refresh (`null` for the Root client, which has no tenant). Lets a caller compare against
 * its own locally-cached `TenantBootstrap.version` (`../bootstrap`) immediately, without waiting
 * on a SignalR round trip - see `refreshBootstrap` (`../bootstrap/refresh`).
 */
export interface BootstrapVersionResponse {
  version: number | null;
}

/**
 * The session established after a successful `login`/`refreshToken` — just the current user,
 * fetched separately since the backend's own response carries no session data (see module doc
 * comment). `null` when signed out. Not a token pair — there is no client-visible token.
 */
export interface AuthSession {
  user: import("../user/types").UserProfile;
}

/** Body of `AuthEndpoints.forgotPassword`. Always resolves the same way whether or not the email exists (anti-enumeration) — never treat the response as confirmation the account exists. */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Body of `AuthEndpoints.resendEmail`. `purpose` mirrors the backend's `AuthMailPurpose` enum
 * verbatim (`Auth.Application/Abstractions/Auth/AuthMailPurpose.cs`) — parsed case-insensitively
 * server-side, but sent with this exact casing to match the enum member names. Cooldown is 30
 * seconds per `(purpose, email)`; a request inside the window fails with
 * `MessageCode.EmailResendCooldown` (`"206"`), whose `ApiResponse.details` carries
 * `{ remainingSeconds }`.
 */
export interface ResendEmailRequest {
  email: string;
  purpose: "EmailVerification" | "PasswordReset";
}

/** Body of `AuthEndpoints.register`. Field names mirror `RegisterRequest` (`Auth.API`) exactly. `middleName` is genuinely optional on the wire (defaults to `""` server-side). */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  middleName?: string;
}

/**
 * Body of `AuthEndpoints.confirmEmail` — completes the token-based email-verification link.
 * `accountId` is the `Guid` the link was issued for (sent as a plain string on the wire).
 * Repeated invalid attempts against the same `accountId` lock out for 3 minutes after the 3rd
 * failure (`MessageCode.VerificationCodeLocked`, `"207"`, `details: { remainingSeconds }`).
 */
export interface ConfirmEmailRequest {
  accountId: string;
  token: string;
}
