/**
 * Server-side "does this request already carry usable auth cookies" check — the optimization
 * this whole module exists for: read once, during initial Next.js server rendering (middleware or
 * a server component), so the client doesn't have to probe with a real API call (check user, fail,
 * refresh, check again) before it knows whether it's authenticated.
 *
 * This is a **render hint, not an authorization decision**. Nothing here verifies the access
 * token's signature — doing so would require shipping the JWT secret into the Next.js runtime,
 * which is both a security smell and would make "just a hint" meaningless (a verified check
 * invites being treated as real auth). The backend remains the only authority on whether a token
 * is actually valid; this only decides whether it's worth trying to use it before asking.
 *
 * Deliberately takes plain cookie *values* (not a `next/headers`/`NextRequest` object) so the same
 * function works unmodified from middleware (`NextRequest.cookies.get(name)?.value`) and from a
 * server component (`next/headers`'s `cookies().get(name)?.value`), which expose different APIs
 * over the same underlying cookies.
 */
export interface InitialAuthStateCookies {
  /** The `AccessToken` cookie's raw JWT value, if present. */
  accessToken?: string;
  /** The `RefreshToken` cookie's raw value, if present. */
  refreshToken?: string;
}

/** The exact cookie names Auth's `CurrentUserService` sets/reads (`BuildingBlock.Web/CurrentUser/CurrentUserService.cs`) — read cookies by these names rather than hardcoding the strings per app. */
export const AUTH_COOKIE_NAMES = {
  accessToken: "AccessToken",
  refreshToken: "RefreshToken",
} as const;

export interface InitialAuthState {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  /**
   * True when a refresh should happen before the app trusts it has a valid session: no access
   * token but a refresh token exists, or the access token is present but expired/undecodable.
   * False for a true guest (neither cookie present) — there's nothing to refresh.
   */
  needsRefresh: boolean;
}

/**
 * Decodes a JWT's payload without verifying its signature — uses the global `atob`, available in
 * both the browser and every Next.js server runtime (Node 18+ and Edge both expose it), so no
 * Node-specific `Buffer` fallback is needed. Never throws; returns `null` for anything malformed,
 * which callers treat the same as "expired" (safest default).
 */
function decodeJwtPayloadUnverified(token: string): Record<string, unknown> | null {
  const segments = token.split(".");
  if (segments.length !== 3) return null;

  try {
    const base64 = segments[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isAccessTokenExpired(accessToken: string): boolean {
  const payload = decodeJwtPayloadUnverified(accessToken);
  const exp = typeof payload?.exp === "number" ? payload.exp : undefined;
  return exp === undefined || exp * 1000 <= Date.now();
}

export function buildInitialAuthState({ accessToken, refreshToken }: InitialAuthStateCookies): InitialAuthState {
  const hasAccessToken = Boolean(accessToken);
  const hasRefreshToken = Boolean(refreshToken);

  if (!hasAccessToken) {
    return { hasAccessToken, hasRefreshToken, needsRefresh: hasRefreshToken };
  }

  return { hasAccessToken, hasRefreshToken, needsRefresh: isAccessTokenExpired(accessToken!) };
}
