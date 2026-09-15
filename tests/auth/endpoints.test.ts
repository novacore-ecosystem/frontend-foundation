import { describe, expect, it } from "vitest";
import { AuthEndpoints } from "../../src/auth";
import { HttpMethods } from "../../src/http";

describe("AuthEndpoints", () => {
  it("declares login as POST /auth/login", () => {
    expect(AuthEndpoints.login.method).toBe(HttpMethods.Post);
    expect(AuthEndpoints.login.path).toBe("/auth/login");
  });

  it("declares logout as POST /auth/logout", () => {
    expect(AuthEndpoints.logout.method).toBe(HttpMethods.Post);
    expect(AuthEndpoints.logout.path).toBe("/auth/logout");
  });

  it("declares refreshToken as POST /auth/refresh-token", () => {
    expect(AuthEndpoints.refreshToken.method).toBe(HttpMethods.Post);
    expect(AuthEndpoints.refreshToken.path).toBe("/auth/refresh-token");
  });

  it("declares forgotPassword as POST /auth/forgot-password", () => {
    expect(AuthEndpoints.forgotPassword.method).toBe(HttpMethods.Post);
    expect(AuthEndpoints.forgotPassword.path).toBe("/auth/forgot-password");
  });

  it("declares resendEmail as POST /auth/resend-email", () => {
    expect(AuthEndpoints.resendEmail.method).toBe(HttpMethods.Post);
    expect(AuthEndpoints.resendEmail.path).toBe("/auth/resend-email");
  });

  it("declares register as POST /auth/register", () => {
    expect(AuthEndpoints.register.method).toBe(HttpMethods.Post);
    expect(AuthEndpoints.register.path).toBe("/auth/register");
  });

  it("declares confirmEmail as POST /auth/confirm-email", () => {
    expect(AuthEndpoints.confirmEmail.method).toBe(HttpMethods.Post);
    expect(AuthEndpoints.confirmEmail.path).toBe("/auth/confirm-email");
  });
});
