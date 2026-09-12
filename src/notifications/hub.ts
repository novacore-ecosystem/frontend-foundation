import { hub } from "../realtime/hub";
import type { NotificationSummary } from "./types";

/**
 * The realtime events the notification hub pushes. Kept generic/
 * declarative per `hub()`'s own doc comment (`../realtime/hub`) — this
 * is the first business hub declared anywhere in this package
 * (`realtime/hub.ts` itself deliberately declares none), added because
 * every NovaCore admin app needs live notification delivery, not one
 * particular business domain.
 *
 * `NotificationCreated`'s payload reuses `NotificationSummary` — a newly
 * pushed notification has the same shape as one row of the list feed
 * (`./endpoints`'s `list`), so there's no separate "event DTO" to keep
 * in sync with the REST shape.
 */
export interface NotificationHubEvents extends Record<string, unknown> {
  NotificationCreated: NotificationSummary;
}

/**
 * Bind this to a live connection via `RealtimeClient.forHub(NotificationHub)`
 * (`../realtime/client`). The hub `name` ("NotificationHub") is a
 * forward-looking placeholder — confirm it against the real backend
 * SignalR hub's registered name once audited (same caveat as
 * `../auth/types`'s endpoint paths).
 */
export const NotificationHub = hub<NotificationHubEvents>({ name: "NotificationHub" });
