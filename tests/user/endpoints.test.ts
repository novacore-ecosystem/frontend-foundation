import { describe, expect, it } from "vitest";
import { resolveEndpointPath } from "../../src/http/endpoint";
import { HttpMethods } from "../../src/http";
import { UserEndpoints } from "../../src/user";

describe("UserEndpoints", () => {
  it("declares getMe as GET /profiles/current", () => {
    expect(UserEndpoints.getMe.method).toBe(HttpMethods.Get);
    expect(UserEndpoints.getMe.path).toBe("/profiles/current");
  });

  it("declares getById as GET /profiles/:id, resolving the route param", () => {
    expect(UserEndpoints.getById.method).toBe(HttpMethods.Get);
    const { path, remaining } = resolveEndpointPath(UserEndpoints.getById.path, { id: "u1" });
    expect(path).toBe("/profiles/u1");
    expect(remaining).toEqual({});
  });

  it("declares getEffectivePermissions as the backend-confirmed GET /profiles/current/detail", () => {
    expect(UserEndpoints.getEffectivePermissions.method).toBe(HttpMethods.Get);
    expect(UserEndpoints.getEffectivePermissions.path).toBe("/profiles/current/detail");
  });

  it("declares updateProfile as PATCH /profiles/current", () => {
    expect(UserEndpoints.updateProfile.method).toBe(HttpMethods.Patch);
    expect(UserEndpoints.updateProfile.path).toBe("/profiles/current");
  });

  it("declares changePassword as POST /auth/reset-password (authenticated, current-password based)", () => {
    expect(UserEndpoints.changePassword.method).toBe(HttpMethods.Post);
    expect(UserEndpoints.changePassword.path).toBe("/auth/reset-password");
  });

  it("declares resetPassword as POST /auth/reset-password/complete (anonymous, token based)", () => {
    expect(UserEndpoints.resetPassword.method).toBe(HttpMethods.Post);
    expect(UserEndpoints.resetPassword.path).toBe("/auth/reset-password/complete");
  });
});
