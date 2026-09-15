/**
 * Request/response contracts for **Registration Defaults** — the Role/Permission bundle a
 * tenant host configures per `(Tenant, App)` pair, automatically granted to every account that
 * self-registers into that App (`AuthEndpoints.register` — see `../auth/types`'s module doc
 * comment). Backend-confirmed against `Auth.API/Endpoints/Registrations/*.cs` and
 * `Features/Registrations/**` (`core-backend`, audited 2026-09-15 alongside the rest of the
 * Auth service's email-confirmation work — search anchor: `RegistrationDefaultsResponse`,
 * `ReplaceRegistrationDefaultPermissionsRequest`, `ReplaceRegistrationDefaultRolesRequest`).
 *
 * The Tenant is **not** a parameter anywhere below — the backend resolves it from the caller's
 * own authenticated context (`RequestContext.Current.TenantId`), never from the request. Only
 * `appId` is ever passed explicitly.
 *
 * Roles and permissions are independent dimensions, both optional in practice (an unconfigured
 * App simply grants nothing on registration — `RegistrationDefaultsSnapshot.Empty`, not a hard
 * failure). `Get` returns both; `Replace*` is a full-replace per dimension (empty array clears
 * that dimension's defaults), not an incremental add/remove — there is no separate create/delete
 * operation.
 */

/** The Role ids and Permission keys currently configured as registration defaults for one App (scoped to the caller's own Tenant). */
export interface RegistrationDefaults {
  roleIds: string[];
  permissionKeys: string[];
}

export interface GetRegistrationDefaultsRequest {
  appId: string;
}

export type GetRegistrationDefaultsResponse = RegistrationDefaults;

/** Full-replace: `permissionKeys` becomes the entire set, not a delta. Pass `[]` to clear. */
export interface ReplaceRegistrationDefaultPermissionsRequest {
  appId: string;
  permissionKeys: string[];
}

/** Full-replace: `roleIds` becomes the entire set, not a delta. Pass `[]` to clear. */
export interface ReplaceRegistrationDefaultRolesRequest {
  appId: string;
  roleIds: string[];
}
