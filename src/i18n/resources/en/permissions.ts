/**
 * Fallback display labels for permission concepts — **not** a full
 * translation of every individual permission key. The backend already
 * owns per-permission display name/description localization dynamically
 * (`PermissionDefinitionTranslation`/`PermissionGroupTranslation`, admin-
 * editable, see `../../../authorization/translation`'s doc comment for
 * the full rationale); duplicating all 43 `Permissions` keys × 3 locales
 * of static text here would fight that backend-owned, editable content
 * rather than complement it.
 *
 * What this file DOES provide: labels for the two standalone keys
 * (`Root`, `User`) and one label per module/category — a small, stable
 * set that mirrors the fixed module grouping in `Permissions` (not the
 * per-action keys within each module), suitable as a permanent fallback
 * when no backend-provided translation exists yet for a given locale.
 */
export const permissions = {
  root: "Full system access",
  user: "Platform user",
  categories: {
    role: "Roles",
    permission: "Permissions",
    product: "Products",
    inventory: "Inventory",
    warehouse: "Warehouses",
    order: "Orders",
    audit: "Audit",
    notification: "Notifications",
    users: "User management",
    tenant: "Tenants",
    system: "System",
  },
};
