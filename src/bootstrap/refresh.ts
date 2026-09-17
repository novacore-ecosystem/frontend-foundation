import type { BootstrapStorage, VersionedBootstrap } from "./storage";
import type { TenantBootstrap } from "./types";

export type BootstrapRefreshListener<T extends VersionedBootstrap> = (bootstrap: T) => void;

/**
 * `fetchBootstrap` is the consuming application's own Bootstrap API call (this package has no
 * opinion on the endpoint/transport — see `@novacore/frontend-next-shadcn` for the Next.js one),
 * same "you supply it" precedent as `TokenProvider`/`BootstrapStorage`.
 */
export interface BootstrapRefreshOptions<T extends VersionedBootstrap = TenantBootstrap> {
  storage: BootstrapStorage<T>;
  fetchBootstrap: () => Promise<T>;
}

/**
 * The single stable "Bootstrap changed, go refetch" contract every backend mechanism converges
 * on — a live SignalR push, a version mismatch surfaced by a login/refresh response, or a cold
 * cache miss all end up calling {@link refreshBootstrap} the same way. A future backend trigger
 * needs zero frontend changes as long as it ultimately calls this too.
 *
 * Generic over `T` (see `BootstrapStorage`'s doc comment) — instantiate with
 * `TenantBootstrapResponse` (`./types`) to work with the real backend payload directly.
 */
export class BootstrapRefreshCoordinator<T extends VersionedBootstrap = TenantBootstrap> {
  private readonly listeners = new Set<BootstrapRefreshListener<T>>();

  constructor(private readonly options: BootstrapRefreshOptions<T>) {}

  /** Notified with the freshly-fetched Bootstrap every time {@link refreshBootstrap} actually fetches (not on a deduped no-op). */
  onRefreshed(listener: BootstrapRefreshListener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Fetches the latest Bootstrap and persists it, then notifies subscribers — unless
   * `targetVersion` already matches the locally-cached copy's version, in which case this is a
   * no-op (`null`). The dedup check matters because a SignalR reconnect can re-announce the same
   * "new" version repeatedly (its comparison is claim-based, not app-state-based — see
   * `GlobalHub.OnConnectedAsync` in the backend) until the access token itself refreshes.
   */
  async refreshBootstrap(targetVersion?: number): Promise<T | null> {
    const cached = this.options.storage.get();
    if (targetVersion !== undefined && cached?.version === targetVersion) return null;

    const bootstrap = await this.options.fetchBootstrap();
    this.options.storage.set(bootstrap);
    for (const listener of this.listeners) listener(bootstrap);

    return bootstrap;
  }
}

export function createBootstrapRefreshCoordinator<T extends VersionedBootstrap = TenantBootstrap>(
  options: BootstrapRefreshOptions<T>,
): BootstrapRefreshCoordinator<T> {
  return new BootstrapRefreshCoordinator(options);
}
