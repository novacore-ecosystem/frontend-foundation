/**
 * Shared admin-UI entity nouns — the names of platform-wide concepts an
 * admin screen's navigation/headings need (Users, Roles, Orders, ...).
 * Generic actions/statuses/pagination live in `common`, not duplicated
 * here. Domain-specific admin terminology beyond these platform-wide
 * nouns belongs to a future domain/admin UI package, not this file —
 * see `docs/i18n.md` for the ownership boundary.
 */
export const admin = {
  entities: {
    users: "Users",
    roles: "Roles",
    permissions: "Permissions",
    positions: "Positions",
    products: "Products",
    variants: "Variants",
    inventory: "Inventory",
    warehouses: "Warehouses",
    orders: "Orders",
    payments: "Payments",
    shipments: "Shipments",
    promotions: "Promotions",
    settings: "Settings",
  },
};
