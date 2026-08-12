import type { RealtimeEventHandler, RealtimeUnsubscribe } from "./event";

/** A single typed hub method: what it's invoked with, and what it resolves to. */
export interface RealtimeMethodContract {
  request: unknown;
  response: unknown;
}

/**
 * The generic mechanism for declaring a hub's typed shape, so future
 * business code can define e.g. an `OrderHub` (events:
 * `OrderStatusChanged`, `OrderCancelled`; methods: `SubscribeOrder`)
 * without scattering string event/method names through application
 * code. This module deliberately declares no business hub — see the
 * phase spec, `#28`-`#30`.
 *
 * `TEvents`/`TMethods` are phantom (carried in the type system only);
 * the runtime object is just `{ name }`.
 */
export interface RealtimeHubDefinition<
  TEvents extends Record<string, unknown> = Record<string, unknown>,
  TMethods extends Record<string, RealtimeMethodContract> = Record<string, RealtimeMethodContract>,
> {
  readonly name: string;
  readonly __events?: TEvents;
  readonly __methods?: TMethods;
}

/** Declares a {@link RealtimeHubDefinition}. Bind it to a live connection via `RealtimeClient.forHub`. */
export function hub<
  TEvents extends Record<string, unknown> = Record<string, never>,
  TMethods extends Record<string, RealtimeMethodContract> = Record<string, never>,
>(config: { name: string }): RealtimeHubDefinition<TEvents, TMethods> {
  return { name: config.name };
}

/** The typed subscribe/invoke surface `RealtimeClient.forHub` returns for a given {@link RealtimeHubDefinition}. */
export interface TypedRealtimeHub<
  TEvents extends Record<string, unknown>,
  TMethods extends Record<string, RealtimeMethodContract>,
> {
  subscribe<K extends keyof TEvents & string>(event: K, handler: RealtimeEventHandler<TEvents[K]>): RealtimeUnsubscribe;
  invoke<K extends keyof TMethods & string>(method: K, request: TMethods[K]["request"]): Promise<TMethods[K]["response"]>;
}
