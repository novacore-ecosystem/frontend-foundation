import { HubConnectionBuilder, HubConnectionState, type HubConnection, type IRetryPolicy } from "@microsoft/signalr";
import {
  DEFAULT_RECONNECT_DELAYS_MS,
  type RealtimeClientOptions,
} from "./configuration";
import { RealtimeError, RealtimeErrorKinds, type RealtimeErrorKind } from "./error";
import type { RealtimeEventHandler, RealtimeUnsubscribe } from "./event";
import type { RealtimeHubDefinition, RealtimeMethodContract, TypedRealtimeHub } from "./hub";
import { RealtimeConnectionStates, type RealtimeConnectionState } from "./state";

export type RealtimeConnectionEventName =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "reconnected"
  | "disconnected"
  | "error";

export type RealtimeConnectionEventHandler = (info?: { error?: RealtimeError }) => void;

function mapConnectionState(state: HubConnectionState): RealtimeConnectionState {
  switch (state) {
    case HubConnectionState.Connected:
      return RealtimeConnectionStates.Connected;
    case HubConnectionState.Connecting:
      return RealtimeConnectionStates.Connecting;
    case HubConnectionState.Reconnecting:
      return RealtimeConnectionStates.Reconnecting;
    case HubConnectionState.Disconnecting:
      return RealtimeConnectionStates.Disconnecting;
    case HubConnectionState.Disconnected:
    default:
      return RealtimeConnectionStates.Disconnected;
  }
}

/** Wraps a plain delay list as SignalR's `IRetryPolicy` — the only place this module touches that SignalR-specific interface. */
class DelayListRetryPolicy implements IRetryPolicy {
  constructor(private readonly delaysMs: readonly number[]) {}

  nextRetryDelayInMilliseconds(retryContext: { previousRetryCount: number }): number | null {
    return retryContext.previousRetryCount < this.delaysMs.length ? (this.delaysMs[retryContext.previousRetryCount] ?? null) : null;
  }
}

/**
 * Framework-agnostic realtime client. Owns exactly one SignalR
 * `HubConnection` (never exposed publicly) per `RealtimeClient` and
 * normalizes every state transition, error, and event into this
 * package's own types — see the phase spec, `#22`-`#41`.
 */
export class RealtimeClient {
  private readonly connection: HubConnection;
  private readonly listeners = new Map<RealtimeConnectionEventName, Set<RealtimeConnectionEventHandler>>();
  private connectPromise: Promise<void> | null = null;
  private disconnectPromise: Promise<void> | null = null;

  constructor(private readonly options: RealtimeClientOptions) {
    const builder = new HubConnectionBuilder().withUrl(options.hubUrl, {
      accessTokenFactory: options.tokenProvider ? () => this.resolveToken() : undefined,
      headers: options.headers,
    });

    if (options.reconnect?.enabled !== false) {
      builder.withAutomaticReconnect(new DelayListRetryPolicy(options.reconnect?.retryDelaysMs ?? DEFAULT_RECONNECT_DELAYS_MS));
    }

    this.connection = builder.build();
    if (options.timeoutMs) this.connection.serverTimeoutInMilliseconds = options.timeoutMs;

    this.connection.onreconnecting(() => this.emit("reconnecting"));
    this.connection.onreconnected(() => this.emit("reconnected"));
    this.connection.onclose((error) => {
      if (error) this.emit("error", { error: this.normalizeError(error) });
      this.emit("disconnected");
    });
  }

  private async resolveToken(): Promise<string> {
    const token = await this.options.tokenProvider?.getAccessToken();
    return token ?? "";
  }

  /** The current normalized connection state, read live from the underlying connection. */
  get state(): RealtimeConnectionState {
    return mapConnectionState(this.connection.state);
  }

  /** Idempotent and concurrency-safe: repeated calls while connecting/connected share the same in-flight attempt rather than opening duplicate connections. */
  async connect(): Promise<void> {
    if (this.connection.state === HubConnectionState.Connected) return;
    if (this.connectPromise) return this.connectPromise;

    this.emit("connecting");

    this.connectPromise = this.connection
      .start()
      .then(() => {
        this.emit("connected");
      })
      .catch((error: unknown) => {
        const realtimeError = this.normalizeError(error, RealtimeErrorKinds.ConnectionFailed);
        this.emit("error", { error: realtimeError });
        throw realtimeError;
      })
      .finally(() => {
        this.connectPromise = null;
      });

    return this.connectPromise;
  }

  /** Idempotent and concurrency-safe: a no-op when already disconnected. */
  async disconnect(): Promise<void> {
    if (this.connection.state === HubConnectionState.Disconnected) return;
    if (this.disconnectPromise) return this.disconnectPromise;

    this.disconnectPromise = this.connection.stop().finally(() => {
      this.disconnectPromise = null;
    });

    return this.disconnectPromise;
  }

  /** Subscribes to a hub event by name. Consumers never call `HubConnection.on` directly. */
  subscribe<TPayload = unknown>(eventName: string, handler: RealtimeEventHandler<TPayload>): RealtimeUnsubscribe {
    const wrapped = (payload: TPayload) => handler(payload);
    this.connection.on(eventName, wrapped);
    return () => this.connection.off(eventName, wrapped);
  }

  /** Invokes a hub method by name. Consumers never call `HubConnection.invoke` directly. */
  async invoke<TRequest = unknown, TResponse = unknown>(methodName: string, request?: TRequest): Promise<TResponse> {
    try {
      if (request === undefined) return await this.connection.invoke<TResponse>(methodName);
      return await this.connection.invoke<TResponse>(methodName, request);
    } catch (error) {
      throw this.normalizeError(error, RealtimeErrorKinds.InvokeFailed);
    }
  }

  /** Binds this connection to a {@link RealtimeHubDefinition}, giving compile-time-checked event/method names for that hub. */
  forHub<TEvents extends Record<string, unknown>, TMethods extends Record<string, RealtimeMethodContract>>(
    _hubDefinition: RealtimeHubDefinition<TEvents, TMethods>,
  ): TypedRealtimeHub<TEvents, TMethods> {
    return {
      subscribe: (event, handler) => this.subscribe(event, handler),
      invoke: (method, request) => this.invoke(method, request),
    };
  }

  /** Subscribes to a normalized connection-lifecycle event (`connecting`/`connected`/`reconnecting`/`reconnected`/`disconnected`/`error`). */
  on(event: RealtimeConnectionEventName, handler: RealtimeConnectionEventHandler): RealtimeUnsubscribe {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)?.add(handler);
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  private emit(event: RealtimeConnectionEventName, info?: { error?: RealtimeError }): void {
    for (const handler of this.listeners.get(event) ?? []) handler(info);
  }

  private normalizeError(error: unknown, kind: RealtimeErrorKind = RealtimeErrorKinds.Unknown): RealtimeError {
    return new RealtimeError({
      kind,
      message: error instanceof Error ? error.message : "Unknown realtime error",
      connectionState: this.state,
      cause: error,
    });
  }

  /** Disconnects and clears all registered connection-lifecycle listeners. Does not remove per-event `subscribe` handlers — unsubscribe those individually first if leaking is a concern. */
  async dispose(): Promise<void> {
    await this.disconnect();
    this.listeners.clear();
  }
}

export function createRealtimeClient(options: RealtimeClientOptions): RealtimeClient {
  return new RealtimeClient(options);
}
