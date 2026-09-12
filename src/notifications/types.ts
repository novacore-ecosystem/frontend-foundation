/**
 * Request/response contracts for the current user's notification feed —
 * `GET /notifications/mine` is the one backend-confirmed endpoint this
 * module targets (see `CursorPaginatedResult`'s doc comment in
 * `../api/pagination/types`, which already cites it as the sole backend
 * use of that type). `markAsRead`/`markAllAsRead` (`./endpoints`) are
 * forward-looking — no confirmed backend source for those two yet, same
 * caveat as `../auth/types`.
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
 * Cursor-pagination request for `NotificationEndpoints.list`. `cursor`
 * omitted requests the first page; `limit` bounds the page size (the
 * backend's own default/maximum, if any, are not yet confirmed — see
 * module doc comment).
 */
export interface NotificationListRequest {
  cursor?: string;
  limit?: number;
}
