import type { TokenProvider } from "../http/token-provider";

export const DEFAULT_RECONNECT_DELAYS_MS: readonly number[] = [0, 2000, 5000, 10_000, 30_000];

/** Automatic-reconnect behavior. Wraps SignalR's raw retry-policy type — never exposed to consumers. */
export interface ReconnectOptions {
  /** Defaults to `true`. */
  enabled?: boolean;
  /** Delay before each successive reconnect attempt, in milliseconds. Defaults to {@link DEFAULT_RECONNECT_DELAYS_MS}; reconnect stops once the array is exhausted. */
  retryDelaysMs?: number[];
}

/**
 * Configuration for a single {@link RealtimeClient}. `tokenProvider`
 * intentionally reuses the same `TokenProvider` contract as
 * `HttpClientOptions` (imported by type only, so this module stays
 * independently importable without pulling in any HTTP runtime code —
 * see the phase spec's tree-shaking requirement, `#45`) so an
 * application can wire one auth source to both HTTP and realtime.
 */
export interface RealtimeClientOptions {
  hubUrl: string;
  tokenProvider?: TokenProvider;
  reconnect?: ReconnectOptions;
  /** Extra headers sent during the connection handshake (Node/non-browser environments only — browsers restrict which headers XHR/fetch can set). */
  headers?: Record<string, string>;
  /** Server-side keep-alive timeout, in milliseconds. */
  timeoutMs?: number;
  /**
   * Send the browser's cookies with the connection handshake — the realtime counterpart of
   * `HttpClientOptions.withCredentials`. Needed by any application whose auth is httpOnly-cookie
   * based rather than bearer-token based (no `tokenProvider`), so the same session the REST API
   * trusts is also trusted by the hub. Defaults to `false`, matching SignalR's own default.
   */
  withCredentials?: boolean;
}
