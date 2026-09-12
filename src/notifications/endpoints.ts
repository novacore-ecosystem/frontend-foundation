import type { CursorPaginatedResult } from "../api/pagination";
import { endpoint } from "../http/endpoint";
import { HttpMethods } from "../http/types";
import type { NotificationListRequest, NotificationSummary } from "./types";

/**
 * Typed `EndpointDefinition`s for the current user's notification feed.
 * `list` targets the backend-confirmed `GET /notifications/mine` (see
 * `./types`'s doc comment); `markAsRead`/`markAllAsRead` are
 * forward-looking, reconcile against the real Notification service once
 * audited.
 */
export const NotificationEndpoints = {
  list: endpoint<NotificationListRequest, CursorPaginatedResult<NotificationSummary>>({
    method: HttpMethods.Get,
    path: "/notifications/mine",
  }),
  markAsRead: endpoint<{ id: string }, void>({ method: HttpMethods.Post, path: "/notifications/:id/read" }),
  markAllAsRead: endpoint<void, void>({ method: HttpMethods.Post, path: "/notifications/mine/read-all" }),
} as const;
