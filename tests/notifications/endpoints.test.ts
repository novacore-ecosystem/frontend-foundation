import { describe, expect, it } from "vitest";
import { resolveEndpointPath } from "../../src/http/endpoint";
import { HttpMethods } from "../../src/http";
import { NotificationEndpoints, NotificationHub } from "../../src/notifications";

describe("NotificationEndpoints", () => {
  it("declares list as the backend-confirmed GET /notifications/mine", () => {
    expect(NotificationEndpoints.list.method).toBe(HttpMethods.Get);
    expect(NotificationEndpoints.list.path).toBe("/notifications/mine");
  });

  it("declares markAsRead as POST /notifications/:id/read, resolving the route param", () => {
    expect(NotificationEndpoints.markAsRead.method).toBe(HttpMethods.Post);
    const { path, remaining } = resolveEndpointPath(NotificationEndpoints.markAsRead.path, { id: "n1" });
    expect(path).toBe("/notifications/n1/read");
    expect(remaining).toEqual({});
  });

  it("declares markAllAsRead as POST /notifications/mine/read-all", () => {
    expect(NotificationEndpoints.markAllAsRead.method).toBe(HttpMethods.Post);
    expect(NotificationEndpoints.markAllAsRead.path).toBe("/notifications/mine/read-all");
  });
});

describe("NotificationHub", () => {
  it("declares a named hub, ready to bind via RealtimeClient.forHub", () => {
    expect(NotificationHub.name).toBe("NotificationHub");
  });
});
