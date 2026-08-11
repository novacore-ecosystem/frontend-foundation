import { describe, expect, it } from "vitest";
import { hasPermission, Permissions, type CurrentUserAuthorization } from "../../src/authorization";

describe("CurrentUserAuthorization contract", () => {
  it("mirrors GetUserDetailResponse's roles/permissions shape as plain string arrays", () => {
    const current: CurrentUserAuthorization = {
      roles: ["Admin"],
      permissions: [Permissions.Order.Full, Permissions.User],
    };
    expect(current.roles).toContain("Admin");
    expect(hasPermission(current.permissions, Permissions.Order.View)).toBe(true);
  });

  it("composes with hasAnyPermission-style checks directly off the wire shape", () => {
    const current: CurrentUserAuthorization = { roles: ["User"], permissions: [Permissions.User] };
    expect(hasPermission(current.permissions, Permissions.Order.View)).toBe(false);
  });
});
