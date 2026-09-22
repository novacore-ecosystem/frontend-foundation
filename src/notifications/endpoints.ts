import type { CursorPaginatedResult } from "../api/pagination";
import { endpoint } from "../http/endpoint";
import { HttpMethods } from "../http/types";
import type { NotificationListRequest, NotificationSummary, NotificationUnreadCountResponse } from "./types";

/**
 * Typed `EndpointDefinition`s for the current user's notification feed, all routed through the
 * gateway's `notification/` service prefix (same convention as `user/` in `../user/endpoints`).
 * Backend-confirmed via `nova-console`'s 2026-09-22 session (real HTTP + browser QA against
 * `core-backend`'s Notification service — see `./types`'s module doc comment).
 *
 * There is **no bulk mark-all-read endpoint** — confirmed absent, not merely unaudited. Do not
 * add one here speculatively; a consumer that wants "mark all" composes it from `markAsRead`
 * calls (see `frontend-next-shadcn`'s `useNotifications`).
 */
export const NotificationEndpoints = {
  list: endpoint<NotificationListRequest, CursorPaginatedResult<NotificationSummary>>({
    method: HttpMethods.Get,
    path: "notification/user-notifications/me",
  }),
  markAsRead: endpoint<{ id: string }, void>({
    method: HttpMethods.Post,
    path: "notification/user-notifications/:id/read",
  }),
  getUnreadCount: endpoint<void, NotificationUnreadCountResponse>({
    method: HttpMethods.Get,
    path: "notification/user-notifications/me/unread-count",
  }),
} as const;
