/**
 * Mirrors the `roles`/`permissions` fields of User service's
 * `GetUserDetailResponse` (backend repository-relative path:
 * `src/Services/User/User.Application/Features/Users/Queries/GetUserDetail/GetUserDetailQuery.cs`;
 * search anchor: `GetUserDetailResponse`), returned by the bootstrap/"me"
 * endpoint `GET /profiles/current/detail` — the closest thing the backend
 * has to a canonical "current user's effective permissions" response.
 *
 * There is no single combined tenant+user+permissions bootstrap endpoint
 * in the backend today, so this is intentionally kept separate from
 * `TenantBootstrap` (`../../bootstrap`) rather than folding `permissions`
 * into that generic contract — doing so would invent an association the
 * backend doesn't actually expose.
 *
 * Both `roles` and `permissions` are plain string arrays on the wire (no
 * enum, no `PermissionKey`/`Role` object) — `permissions` entries are
 * `Permission`-shaped keys (see `../permissions`), and `roles` are the
 * backend's role names (e.g. `"Admin"`), a separate, unrelated string
 * format not modeled by this package.
 *
 * Per the backend handler's own doc comment, this is a **UI-only
 * signal** for things like conditionally rendering navigation — it is
 * never the actual authorization boundary. The real enforcement is
 * always the JWT's `permission` claims, evaluated server-side by
 * `RequirePermissions(...)` on each endpoint. Treat data built from this
 * type the same way: use it to decide what to show, not as a substitute
 * for the backend rejecting an unauthorized request.
 */
export interface CurrentUserAuthorization {
  roles: readonly string[];
  permissions: readonly string[];
}
