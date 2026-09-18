import { describe, expect, it, vi } from "vitest";

import { createAuthSessionController } from "../../src/auth/session";
import type { HttpClient } from "../../src/http/client";

function fakeClient(execute: (def: { path: string }) => unknown): HttpClient {
  return { execute: vi.fn(async (def: { path: string }) => execute(def)) } as unknown as HttpClient;
}

describe("AuthSessionController", () => {
  it("login sets the session from getMe and reports the bootstrap version", async () => {
    const onBootstrapVersion = vi.fn();
    const controller = createAuthSessionController({
      httpClient: fakeClient((def) => (def.path === "/auth/login" ? { version: 3 } : { id: "u1", displayName: "Ann" })),
      onBootstrapVersion,
    });

    const session = await controller.login({ email: "a@b.c", password: "x" });

    expect(session?.user.displayName).toBe("Ann");
    expect(controller.getState().status).toBe("authenticated");
    expect(onBootstrapVersion).toHaveBeenCalledWith(3);
  });

  it("logout clears the session and notifies subscribers", async () => {
    const controller = createAuthSessionController({
      httpClient: fakeClient((def) => (def.path === "/auth/login" ? { version: 1 } : { id: "u1", displayName: "Ann" })),
    });
    await controller.login({ email: "a@b.c", password: "x" });
    const listener = vi.fn();
    controller.subscribe(listener);

    expect(await controller.logout()).toBe(true);
    expect(controller.getState()).toMatchObject({ status: "unauthenticated", session: null });
    expect(listener).toHaveBeenCalled();
  });

  it("a failed login leaves the visitor signed out with a localized error", async () => {
    const controller = createAuthSessionController({
      httpClient: fakeClient(() => {
        throw new Error("boom");
      }),
    });

    expect(await controller.login({ email: "a@b.c", password: "x" })).toBeNull();
    expect(controller.getState().error).toBeTruthy();
    expect(controller.getState().status).toBe("unknown");
  });

  it("a failed refresh resolves to unauthenticated without throwing", async () => {
    const controller = createAuthSessionController({
      httpClient: fakeClient(() => {
        throw new Error("401");
      }),
    });
    expect(await controller.refreshToken()).toBeNull();
    expect(controller.getState().status).toBe("unauthenticated");
  });
});

describe("AuthSessionController.restore", () => {
  it("treats a visitor with no auth cookies as a guest without any request", async () => {
    const execute = vi.fn();
    const controller = createAuthSessionController({ httpClient: { execute } as unknown as HttpClient });
    await controller.restore({ hasAccessToken: false, hasRefreshToken: false, needsRefresh: false });
    expect(controller.getState().status).toBe("unauthenticated");
    expect(execute).not.toHaveBeenCalled();
  });

  it("loads the profile without refreshing when the access token is still valid", async () => {
    const paths: string[] = [];
    const controller = createAuthSessionController({
      httpClient: fakeClient((def) => {
        paths.push(def.path);
        return { id: "u1", displayName: "Ann" };
      }),
    });
    await controller.restore({ hasAccessToken: true, hasRefreshToken: true, needsRefresh: false });
    expect(paths).toEqual(["/profiles/current/detail"]);
    expect(controller.getState().status).toBe("authenticated");
  });
});
