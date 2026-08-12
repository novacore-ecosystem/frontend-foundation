/** Framework-agnostic connection state, mapped from SignalR's `HubConnectionState` in `client.ts` — never exposed to consumers directly. */
export const RealtimeConnectionStates = {
  Disconnected: "disconnected",
  Connecting: "connecting",
  Connected: "connected",
  Reconnecting: "reconnecting",
  Disconnecting: "disconnecting",
  Failed: "failed",
} as const satisfies Record<string, string>;

export type RealtimeConnectionState = (typeof RealtimeConnectionStates)[keyof typeof RealtimeConnectionStates];
