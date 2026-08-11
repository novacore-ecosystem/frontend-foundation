import { describe, expect, it } from "vitest";
import { hasAllPermissions, hasAnyPermission, hasPermission, Permissions } from "../../src/authorization";

describe("hasPermission / hasAnyPermission — mirrors backend PermissionAuthorization.HasAnyPermission", () => {
  it("matches an exact owned permission", () => {
    expect(hasPermission([Permissions.Order.View], Permissions.Order.View)).toBe(true);
  });

  it("does not match an unrelated permission", () => {
    expect(hasPermission([Permissions.Order.View], Permissions.Order.Manage)).toBe(false);
  });

  it("Root bypasses every check", () => {
    expect(hasPermission([Permissions.Root], Permissions.Order.Delete)).toBe(true);
    expect(hasPermission([Permissions.Root], "anything:not-even-real")).toBe(true);
  });

  it("resolves via the module's {module}:full aggregate", () => {
    expect(hasPermission([Permissions.Order.Full], Permissions.Order.View)).toBe(true);
    expect(hasPermission([Permissions.Order.Full], Permissions.Order.Delete)).toBe(true);
  });

  it("does not leak the aggregate across modules", () => {
    expect(hasPermission([Permissions.Order.Full], Permissions.Inventory.View)).toBe(false);
  });

  it("hasAnyPermission OR-matches a list of acceptable permissions", () => {
    expect(hasAnyPermission([Permissions.Inventory.Adjust], [Permissions.Inventory.View, Permissions.Inventory.Adjust])).toBe(
      true,
    );
  });

  it("hasAnyPermission returns false when none match", () => {
    expect(hasAnyPermission([Permissions.Order.View], [Permissions.Inventory.View, Permissions.Warehouse.Manage])).toBe(
      false,
    );
  });

  it("returns false for an empty owned list (except via Root)", () => {
    expect(hasPermission([], Permissions.Order.View)).toBe(false);
  });

  it("baseline User permission does not grant unrelated module access", () => {
    expect(hasPermission([Permissions.User], Permissions.Order.View)).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("returns true only when every required permission resolves", () => {
    expect(hasAllPermissions([Permissions.Order.View, Permissions.Order.Manage], [Permissions.Order.View, Permissions.Order.Manage])).toBe(
      true,
    );
  });

  it("returns false if any required permission is missing", () => {
    expect(hasAllPermissions([Permissions.Order.View], [Permissions.Order.View, Permissions.Order.Delete])).toBe(false);
  });

  it("resolves each required permission via aggregate Full like hasPermission does", () => {
    expect(hasAllPermissions([Permissions.Order.Full], [Permissions.Order.View, Permissions.Order.Delete])).toBe(true);
  });

  it("Root satisfies every requirement", () => {
    expect(hasAllPermissions([Permissions.Root], [Permissions.Order.View, Permissions.Inventory.Adjust, Permissions.Users.Manage])).toBe(
      true,
    );
  });

  it("an empty requirement list is vacuously satisfied", () => {
    expect(hasAllPermissions([Permissions.Order.View], [])).toBe(true);
  });
});
