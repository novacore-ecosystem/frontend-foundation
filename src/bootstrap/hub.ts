import { hub } from "../realtime/hub";

/**
 * The realtime event Notification's `GlobalHub` pushes when a connection's tenant Bootstrap
 * Version no longer matches the server's — either a live push to every connected client in the
 * tenant (`SignalRRealtimeNotifier.PushTenantBootstrapVersionChangedAsync`, on an actual change)
 * or a connect-time mismatch pushed to just that connection (`GlobalHub.OnConnectedAsync`, for a
 * client that missed the live push while disconnected). The payload is the new Version — pass it
 * as `refreshBootstrap`'s `targetVersion` (`./refresh`) so an already-applied version is a no-op.
 */
export interface BootstrapHubEvents extends Record<string, unknown> {
  BootstrapVersionChanged: number;
}

/**
 * Bind this to a live connection via `RealtimeClient.forHub(BootstrapHub)` (`../realtime/client`)
 * — the same physical connection `NotificationHub` (`../notifications/hub`) binds to, both pointed
 * at Notification's `GlobalHub` (`/hubs/global`). See that module's doc comment for why one
 * backend hub is represented as more than one typed `RealtimeHubDefinition` here: each declares
 * only the event slice relevant to its own domain.
 */
export const BootstrapHub = hub<BootstrapHubEvents>({ name: "GlobalHub" });
