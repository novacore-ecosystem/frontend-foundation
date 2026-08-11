import { Permissions, type Permission } from "../permissions";

/**
 * Mirrors `NovaCore.BuildingBlock.Web.Authorization.PermissionAuthorization.HasAnyPermission`
 * (backend repository-relative path:
 * `src/BuildingBlocks/BuildingBlock.Web/Authorization/PermissionAuthorization.cs`;
 * search anchor: `HasAnyPermission`) exactly: `Permissions.Root` bypasses
 * every check, then each required permission is matched either exactly or
 * via its module's `"{module}:full"` aggregate key (split on the first
 * `:`). Required permissions are OR-matched — any single match is
 * sufficient — matching the backend's own `RequirePermissions(...params)`
 * semantics for endpoints declaring more than one acceptable permission.
 *
 * This is framework-independent on purpose: it takes the caller's owned
 * permissions as a plain array (e.g. from a decoded JWT's `permission`
 * claims, or `CurrentUserAuthorization.permissions`) rather than reading
 * from any implicit global state. Wiring this into React/Vue/Angular
 * state (a `usePermission()` hook, a Pinia getter, etc.) is a future
 * framework adapter's job, not this package's.
 */
export function hasAnyPermission(owned: readonly string[], required: readonly (Permission | string)[]): boolean {
  const ownedSet = new Set(owned);

  if (ownedSet.has(Permissions.Root)) return true;

  for (const permission of required) {
    if (ownedSet.has(permission)) return true;

    const separatorIndex = permission.indexOf(":");
    if (separatorIndex > 0) {
      const aggregate = `${permission.slice(0, separatorIndex)}:full`;
      if (ownedSet.has(aggregate)) return true;
    }
  }

  return false;
}

/** Checks a single permission. Equivalent to `hasAnyPermission(owned, [permission])`. */
export function hasPermission(owned: readonly string[], permission: Permission | string): boolean {
  return hasAnyPermission(owned, [permission]);
}

/**
 * Checks that every one of `required` is satisfied (each individually
 * resolved the same way as {@link hasPermission}: exact match, `Root`
 * bypass, or the permission's module `"{module}:full"` aggregate).
 * There is no backend equivalent of this exact function — the backend
 * only ever needs the OR-semantics of `HasAnyPermission` for a single
 * endpoint's guard — but an AND-composition is a natural, safe
 * extension of the same evaluation rule for frontend call sites that
 * gate a feature behind multiple independent permissions.
 */
export function hasAllPermissions(owned: readonly string[], required: readonly (Permission | string)[]): boolean {
  return required.every((permission) => hasAnyPermission(owned, [permission]));
}
