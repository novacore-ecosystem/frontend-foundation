import { hub } from "../realtime/hub";
import type { NotificationPush } from "./types";

/**
 * The realtime events the notification hub pushes. Kept generic/
 * declarative per `hub()`'s own doc comment (`../realtime/hub`) — this
 * is the first business hub declared anywhere in this package
 * (`realtime/hub.ts` itself deliberately declares none), added because
 * every NovaCore admin app needs live notification delivery, not one
 * particular business domain.
 *
 * `ReceiveNotification`'s payload is `NotificationPush`, not
 * `NotificationSummary` directly — the same physical push channel also
 * fans out id-less dispatches with no Notification Center row (see
 * `NotificationPush`'s doc comment in `./types`).
 */
export interface NotificationHubEvents extends Record<string, unknown> {
  ReceiveNotification: NotificationPush;
}

/**
 * Bind this to a live connection via `RealtimeClient.forHub(NotificationHub)`
 * (`../realtime/client`). `name: "GlobalHub"` is backend-confirmed — the
 * Notification service pushes over the same physical hub connection that
 * `BootstrapHub` (`../bootstrap/hub`) also binds to, not a dedicated
 * per-domain hub; a consuming app opens one `GlobalHub` connection and
 * both hub definitions subscribe on it.
 */
export const NotificationHub = hub<NotificationHubEvents>({ name: "GlobalHub" });
