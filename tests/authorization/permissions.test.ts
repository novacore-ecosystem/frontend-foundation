import { describe, expect, it } from "vitest";
import { isKnownPermission, PERMISSION_VALUES, Permissions } from "../../src/authorization";

describe("Permissions contract — drift detection against backend Permissions.cs", () => {
  it("root and baseline user permissions have their exact backend values", () => {
    expect(Permissions.Root).toBe("system:root");
    expect(Permissions.User).toBe("system:user");
  });

  it("keeps Permissions.User (singular, baseline) distinct from Permissions.Users (plural, admin module)", () => {
    expect(Permissions.User).not.toBe(Permissions.Users.View);
    expect(Permissions.User.startsWith("system:")).toBe(true);
    expect(Permissions.Users.View.startsWith("users:")).toBe(true);
  });

  it("every module's known permission keys match the backend exactly", () => {
    expect(Permissions.Role).toEqual({ View: "role:view", Manage: "role:manage", Full: "role:full" });
    expect(Permissions.Permission).toEqual({
      View: "permission:view",
      Manage: "permission:manage",
      Full: "permission:full",
    });
    expect(Permissions.Product).toEqual({
      Manage: "product:manage",
      Reindex: "product:reindex",
      Full: "product:full",
    });
    expect(Permissions.Inventory).toEqual({
      View: "inventory:view",
      StockMove: "inventory:stock-move",
      Adjust: "inventory:adjust",
      Receive: "inventory:receive",
      Transfer: "inventory:transfer",
      CycleCount: "inventory:cycle-count",
      Full: "inventory:full",
    });
    expect(Permissions.Warehouse).toEqual({ View: "warehouse:view", Manage: "warehouse:manage", Full: "warehouse:full" });
    expect(Permissions.Order).toEqual({
      View: "order:view",
      Manage: "order:manage",
      Fulfill: "order:fulfill",
      Delete: "order:delete",
      CreateOnBehalf: "order:create-on-behalf",
      Full: "order:full",
    });
    expect(Permissions.Audit).toEqual({ View: "audit:view", Full: "audit:full" });
    expect(Permissions.Notification).toEqual({
      View: "notification:view",
      Manage: "notification:manage",
      ChannelToggle: "notification:channel-toggle",
      ChannelConfigure: "notification:channel-configure",
      CampaignManage: "notification:campaign-manage",
      Send: "notification:send",
      Full: "notification:full",
    });
    expect(Permissions.Users).toEqual({
      View: "users:view",
      Manage: "users:manage",
      Reindex: "users:reindex",
      Full: "users:full",
    });
    expect(Permissions.Tenant).toEqual({
      View: "tenant:view",
      Manage: "tenant:manage",
      RotateClient: "tenant:rotate-client",
      Full: "tenant:full",
    });
    expect(Permissions.System).toEqual({
      MessagingView: "system:messaging-view",
      MessagingRequeue: "system:messaging-requeue",
      Full: "system:full",
    });
  });

  it("PERMISSION_VALUES has no duplicates and matches the backend's SupportedValues count (47 keys)", () => {
    expect(new Set(PERMISSION_VALUES).size).toBe(PERMISSION_VALUES.length);
    expect(PERMISSION_VALUES.length).toBe(47);
  });

  it("every leaf value in Permissions appears in PERMISSION_VALUES (no orphaned constants)", () => {
    function collectLeaves(node: unknown): string[] {
      if (typeof node === "string") return [node];
      if (node && typeof node === "object") {
        return Object.values(node).flatMap(collectLeaves);
      }
      return [];
    }
    const leaves = collectLeaves(Permissions).sort();
    const values = [...PERMISSION_VALUES].sort();
    expect(leaves).toEqual(values);
  });

  it("every permission key follows the module:action wire format", () => {
    for (const value of PERMISSION_VALUES) {
      expect(value).toMatch(/^[a-z]+:[a-z-]+$/);
    }
  });
});

describe("isKnownPermission", () => {
  it("accepts every declared permission key", () => {
    for (const value of PERMISSION_VALUES) {
      expect(isKnownPermission(value)).toBe(true);
    }
  });

  it("rejects an unknown/typo'd permission string", () => {
    expect(isKnownPermission("system:roots")).toBe(false);
    expect(isKnownPermission("")).toBe(false);
    expect(isKnownPermission("order:cancel")).toBe(false);
  });
});
