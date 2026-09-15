import { describe, expect, it } from "vitest";
import { resolveEndpointPath } from "../../src/http/endpoint";
import { HttpMethods } from "../../src/http";
import { RegistrationDefaultsEndpoints } from "../../src/registration-defaults";

describe("RegistrationDefaultsEndpoints", () => {
  it("declares get as GET /auth/apps/:appId/registration-defaults, resolving the route param", () => {
    expect(RegistrationDefaultsEndpoints.get.method).toBe(HttpMethods.Get);
    const { path, remaining } = resolveEndpointPath(RegistrationDefaultsEndpoints.get.path, { appId: "a1" });
    expect(path).toBe("/auth/apps/a1/registration-defaults");
    expect(remaining).toEqual({});
  });

  it("declares replacePermissions as PUT /auth/apps/:appId/registration-defaults/permissions", () => {
    expect(RegistrationDefaultsEndpoints.replacePermissions.method).toBe(HttpMethods.Put);
    const { path, remaining } = resolveEndpointPath(RegistrationDefaultsEndpoints.replacePermissions.path, {
      appId: "a1",
      permissionKeys: ["order:view"],
    });
    expect(path).toBe("/auth/apps/a1/registration-defaults/permissions");
    expect(remaining).toEqual({ permissionKeys: ["order:view"] });
  });

  it("declares replaceRoles as PUT /auth/apps/:appId/registration-defaults/roles", () => {
    expect(RegistrationDefaultsEndpoints.replaceRoles.method).toBe(HttpMethods.Put);
    const { path, remaining } = resolveEndpointPath(RegistrationDefaultsEndpoints.replaceRoles.path, {
      appId: "a1",
      roleIds: ["r1"],
    });
    expect(path).toBe("/auth/apps/a1/registration-defaults/roles");
    expect(remaining).toEqual({ roleIds: ["r1"] });
  });
});
