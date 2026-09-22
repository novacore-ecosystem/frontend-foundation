import { describe, expect, it } from "vitest";
import { resolveEndpointPath } from "../../src/http/endpoint";
import { HttpMethods } from "../../src/http";
import { NotificationEndpoints, NotificationHub } from "../../src/notifications";

describe("NotificationEndpoints", () => {
  it("declares list as the backend-confirmed GET notification/user-notifications/me", () => {
    expect(NotificationEndpoints.list.method).toBe(HttpMethods.Get);
    expect(NotificationEndpoints.list.path).toBe("notification/user-notifications/me");
  });

  it("declares markAsRead as POST notification/user-notifications/:id/read, resolving the route param", () => {
    expect(NotificationEndpoints.markAsRead.method).toBe(HttpMethods.Post);
    const { path, remaining } = resolveEndpointPath(NotificationEndpoints.markAsRead.path, { id: "n1" });
    expect(path).toBe("notification/user-notifications/n1/read");
    expect(remaining).toEqual({});
  });

  it("declares getUnreadCount as GET notification/user-notifications/me/unread-count", () => {
    expect(NotificationEndpoints.getUnreadCount.method).toBe(HttpMethods.Get);
    expect(NotificationEndpoints.getUnreadCount.path).toBe("notification/user-notifications/me/unread-count");
  });

  it("declares no bulk mark-all-read endpoint (confirmed absent from the backend)", () => {
    expect("markAllAsRead" in NotificationEndpoints).toBe(false);
  });
});

describe("NotificationHub", () => {
  it("declares the shared GlobalHub, ready to bind via RealtimeClient.forHub", () => {
    expect(NotificationHub.name).toBe("GlobalHub");
  });
});
