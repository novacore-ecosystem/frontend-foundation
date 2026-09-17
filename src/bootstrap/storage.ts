import type { TenantBootstrap } from "./types";

/** The one thing `BootstrapStorage`/`BootstrapRefreshCoordinator` actually need from a Bootstrap payload. */
export interface VersionedBootstrap {
  version: number;
}

/**
 * Persistence contract for a locally-cached Bootstrap payload. Deliberately has no
 * browser/storage dependency (no `localStorage`, cookies, etc.) — same precedent as `TokenProvider`
 * (`../http/token-provider`) — the consuming application supplies its own implementation (e.g.
 * `localStorage` in a browser, a cookie-backed adapter in `@novacore/frontend-next-shadcn`).
 *
 * Generic over `T` (any `{ version: number }` shape) rather than fixed to {@link TenantBootstrap}
 * so it works equally well with that generic contract or with the real backend wire shape,
 * `TenantBootstrapResponse` (`./types`) — see that type's doc comment for why they're separate.
 */
export interface BootstrapStorage<T extends VersionedBootstrap = TenantBootstrap> {
  /** The locally-cached Bootstrap, or `null` if none has been persisted yet. */
  get(): T | null;
  set(bootstrap: T): void;
  clear(): void;
}
