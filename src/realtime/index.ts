/**
 * Framework-agnostic typed realtime hub client. `@microsoft/signalr` is
 * this module's internal transport (see `client.ts`) — it is never
 * exposed here or anywhere else in this package's public API. Import
 * from `@novacore/frontend-foundation/realtime` (or the package root)
 * without installing SignalR yourself.
 */
export { RealtimeConnectionStates } from "./state";
export type { RealtimeConnectionState } from "./state";
export { RealtimeError, RealtimeErrorKinds } from "./error";
export type { RealtimeErrorInit, RealtimeErrorKind } from "./error";
export type { RealtimeEventHandler, RealtimeUnsubscribe } from "./event";
export { hub } from "./hub";
export type { RealtimeHubDefinition, RealtimeMethodContract, TypedRealtimeHub } from "./hub";
export { DEFAULT_RECONNECT_DELAYS_MS } from "./configuration";
export type { ReconnectOptions, RealtimeClientOptions } from "./configuration";
export { createRealtimeClient, RealtimeClient } from "./client";
export type { RealtimeConnectionEventHandler, RealtimeConnectionEventName } from "./client";
// Note: TokenProvider is not re-exported here — it already lives in the
// top-level public API via `../http` (see that module's doc comment).
// Re-exporting it again here would collide with that existing export
// when both barrels are aggregated by `src/index.ts`'s `export *`.
