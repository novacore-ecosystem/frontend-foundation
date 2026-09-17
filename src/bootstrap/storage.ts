import type { TenantBootstrap } from "./types";

/**
 * Persistence contract for a locally-cached {@link TenantBootstrap}. Deliberately has no
 * browser/storage dependency (no `localStorage`, cookies, etc.) — same precedent as `TokenProvider`
 * (`../http/token-provider`) — the consuming application supplies its own implementation (e.g.
 * `localStorage` in a browser, a cookie-backed adapter in `@novacore/frontend-next-shadcn`).
 */
export interface BootstrapStorage {
  /** The locally-cached Bootstrap, or `null` if none has been persisted yet. */
  get(): TenantBootstrap | null;
  set(bootstrap: TenantBootstrap): void;
  clear(): void;
}
