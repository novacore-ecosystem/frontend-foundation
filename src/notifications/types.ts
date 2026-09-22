/**
 * Request/response contracts for the current user's notification feed —
 * backend-confirmed against `core-backend`'s Notification service (see
 * `nova-console`'s 2026-09-22 session, which built and browser-QA'd a
 * real integration against this exact contract, including two backend
 * fixes: the push DTO gained `Id`/`CreatedAt`, and user pushes moved from
 * a `Member(...)` group to `Clients.User(userId)`). `list`/`markAsRead`/
 * `getUnreadCount` are real; there is no bulk mark-all-read endpoint —
 * see `markAsRead`'s doc comment in `./endpoints`.
 *
 * `NotificationSummary`'s fields deliberately mirror
 * `@novacore/frontend-next-shadcn`'s existing `NotificationItem`
 * (`packages/shadcn/src/components/notifications/types.ts`) one-for-one
 * — same "no mapping layer needed" rationale as `UserProfile`
 * (`../user/types`) vs. that package's `UserProfileData`.
 */

export type NotificationStatus = "read" | "unread";

/** A single notification as returned by the list/cursor feed. `description` is commonly absent on a list summary — many backends only populate it on a per-notification detail fetch (see `NotificationItem`'s own doc comment for the confirmed nova-wcm precedent). */
export interface NotificationSummary {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  status: NotificationStatus;
  category?: string;
}

/**
 * The realtime push shape is otherwise identical to `NotificationSummary`, but `id` can be
 * absent: the Notification service's SignalR channel also fans out dispatches that never
 * persisted a Notification Center row (no list entry to reconcile against). A consumer that
 * receives a `null`/missing `id` cannot dedupe or mark it read — treat it as a cue to refetch
 * the list rather than optimistically prepending it (see `frontend-next-shadcn`'s `useNotifications`).
 */
export type NotificationPush = Omit<NotificationSummary, "id"> & { id: string | null };

/**
 * Cursor-pagination request for `NotificationEndpoints.list`. `cursor`
 * omitted requests the first page; `limit` bounds the page size (the
 * backend's own default/maximum, if any, are not yet confirmed).
 */
export interface NotificationListRequest {
  cursor?: string;
  limit?: number;
}

/** Response of `NotificationEndpoints.getUnreadCount` — the backend-provided total, not a client-side approximation over whatever page happens to be loaded. */
export interface NotificationUnreadCountResponse {
  unreadCount: number;
}
