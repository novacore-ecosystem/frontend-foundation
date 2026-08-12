import type { RealtimeConnectionState } from "./state";

/** Classifies why a {@link RealtimeError} occurred. */
export const RealtimeErrorKinds = {
  ConnectionFailed: "connection_failed",
  InvokeFailed: "invoke_failed",
  Disconnected: "disconnected",
  Unknown: "unknown",
} as const satisfies Record<string, string>;

export type RealtimeErrorKind = (typeof RealtimeErrorKinds)[keyof typeof RealtimeErrorKinds];

export interface RealtimeErrorInit {
  kind: RealtimeErrorKind;
  message: string;
  code?: string;
  connectionState?: RealtimeConnectionState;
  /** The underlying transport error (a SignalR error internally), kept only for logging/debugging. */
  cause?: unknown;
}

/** The single error type this package's realtime client ever throws — normalizes every SignalR failure mode so consumers never need to know SignalR exists. */
export class RealtimeError extends Error {
  readonly kind: RealtimeErrorKind;
  readonly code?: string;
  readonly connectionState?: RealtimeConnectionState;

  constructor(init: RealtimeErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
    this.name = "RealtimeError";
    this.kind = init.kind;
    this.code = init.code;
    this.connectionState = init.connectionState;
  }
}
