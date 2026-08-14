/**
 * Mirrors `NovaCore.BuildingBlock.SharedKernel.Constants.Permissions` verbatim
 * (backend repository-relative path:
 * `src/BuildingBlocks/BuildingBlock.SharedKernel/Constants/Permissions.cs`;
 * search anchor: `Permissions`) — the single, code-first canonical source of
 * every permission key in the platform. Every business service (Product,
 * Inventory, Warehouse, Order, Audit, Notification, Users, plus the Auth
 * service itself) declares its `RequirePermissions(...)` calls against these
 * same constants; there is no other permission-definition source to mirror.
 *
 * Format: lowercase `module:action`, hyphenated for multi-word actions (e.g.
 * `"inventory:stock-move"`, `"order:create-on-behalf"`). Not an enum on the
 * backend (permission keys serialize as plain strings on every wire
 * boundary — see `../types`), and not represented as a TypeScript `enum`
 * here either, for the same interop reasons the rest of this package
 * prefers `as const` objects.
 *
 * `Root` (`"system:root"`) bypasses every permission check. `User`
 * (`"system:user"`) is the foundational capability every authenticated
 * non-Root account carries — **do not confuse it with `Users` below**
 * (plural; the "manage other users' accounts" module). This naming
 * collision exists in the backend too (see the backend's own doc comment
 * on `Permissions.User`) and is preserved intentionally rather than
 * "cleaned up," per the rule against silently diverging from backend
 * naming.
 *
 * Each module's `Full` key is an aggregate that implicitly grants every
 * other permission in that module — this is resolved centrally by
 * `hasAnyPermission`/`hasPermission` in `../helpers` (mirroring the
 * backend's `PermissionAuthorization.HasAnyPermission`,
 * `src/BuildingBlocks/BuildingBlock.Web/Authorization/PermissionAuthorization.cs`),
 * not by expanding `Full` into a list of keys here.
 */
export const Permissions = {
  Root: "system:root",
  User: "system:user",

  Role: {
    View: "role:view",
    Manage: "role:manage",
    Full: "role:full",
  },

  Permission: {
    View: "permission:view",
    Manage: "permission:manage",
    Full: "permission:full",
  },

  Product: {
    Manage: "product:manage",
    Reindex: "product:reindex",
    Full: "product:full",
  },

  Inventory: {
    View: "inventory:view",
    StockMove: "inventory:stock-move",
    Adjust: "inventory:adjust",
    Receive: "inventory:receive",
    Transfer: "inventory:transfer",
    CycleCount: "inventory:cycle-count",
    Full: "inventory:full",
  },

  Warehouse: {
    View: "warehouse:view",
    Manage: "warehouse:manage",
    Full: "warehouse:full",
  },

  Order: {
    View: "order:view",
    Manage: "order:manage",
    Fulfill: "order:fulfill",
    Delete: "order:delete",
    CreateOnBehalf: "order:create-on-behalf",
    Full: "order:full",
  },

  Audit: {
    View: "audit:view",
    Full: "audit:full",
  },

  Notification: {
    View: "notification:view",
    Manage: "notification:manage",
    ChannelToggle: "notification:channel-toggle",
    ChannelConfigure: "notification:channel-configure",
    CampaignManage: "notification:campaign-manage",
    Send: "notification:send",
    Full: "notification:full",
  },

  Users: {
    View: "users:view",
    Manage: "users:manage",
    Reindex: "users:reindex",
    Full: "users:full",
  },

  Tenant: {
    View: "tenant:view",
    Manage: "tenant:manage",
    RotateClient: "tenant:rotate-client",
    Full: "tenant:full",
  },

  System: {
    MessagingView: "system:messaging-view",
    MessagingRequeue: "system:messaging-requeue",
    Full: "system:full",
  },
} as const;

/** Recursively extracts every string leaf value out of a nested `as const` object tree. */
type DeepPermissionValue<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? { [K in keyof T]: DeepPermissionValue<T[K]> }[keyof T]
    : never;

/** A valid permission key, e.g. `"system:root"` or `"inventory:stock-move"`. */
export type Permission = DeepPermissionValue<typeof Permissions>;

/**
 * Flat list of every permission key, in the same order as the backend's
 * `Permissions.SupportedValues` (a `FrozenSet<string>`) — kept in the same
 * order deliberately so a side-by-side diff against the backend source
 * during a sync review is easy. This is also what backs `isKnownPermission`.
 */
export const PERMISSION_VALUES: readonly Permission[] = [
  Permissions.Root,
  Permissions.User,
  Permissions.Role.View,
  Permissions.Role.Manage,
  Permissions.Role.Full,
  Permissions.Permission.View,
  Permissions.Permission.Manage,
  Permissions.Permission.Full,
  Permissions.Product.Manage,
  Permissions.Product.Reindex,
  Permissions.Product.Full,
  Permissions.Inventory.View,
  Permissions.Inventory.StockMove,
  Permissions.Inventory.Adjust,
  Permissions.Inventory.Receive,
  Permissions.Inventory.Transfer,
  Permissions.Inventory.CycleCount,
  Permissions.Inventory.Full,
  Permissions.Warehouse.View,
  Permissions.Warehouse.Manage,
  Permissions.Warehouse.Full,
  Permissions.Order.View,
  Permissions.Order.Manage,
  Permissions.Order.Fulfill,
  Permissions.Order.Delete,
  Permissions.Order.CreateOnBehalf,
  Permissions.Order.Full,
  Permissions.Audit.View,
  Permissions.Audit.Full,
  Permissions.Notification.View,
  Permissions.Notification.Manage,
  Permissions.Notification.ChannelToggle,
  Permissions.Notification.ChannelConfigure,
  Permissions.Notification.CampaignManage,
  Permissions.Notification.Send,
  Permissions.Notification.Full,
  Permissions.Users.View,
  Permissions.Users.Manage,
  Permissions.Users.Reindex,
  Permissions.Users.Full,
  Permissions.Tenant.View,
  Permissions.Tenant.Manage,
  Permissions.Tenant.RotateClient,
  Permissions.Tenant.Full,
  Permissions.System.MessagingView,
  Permissions.System.MessagingRequeue,
  Permissions.System.Full,
];

const PERMISSION_VALUE_SET: ReadonlySet<string> = new Set(PERMISSION_VALUES);

/**
 * Mirrors the backend's `PermissionKey` value object, which validates
 * against `Permissions.SupportedValues` membership rather than a format
 * regex. Use this to validate a permission string received from an
 * untyped source (e.g. before widening it to the `Permission` type).
 */
export function isKnownPermission(value: string): value is Permission {
  return PERMISSION_VALUE_SET.has(value);
}
