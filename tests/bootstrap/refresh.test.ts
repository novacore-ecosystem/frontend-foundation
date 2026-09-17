import { describe, expect, it, vi } from "vitest";
import { createBootstrapRefreshCoordinator, type BootstrapStorage, type TenantBootstrap } from "../../src/bootstrap";

function inMemoryStorage(initial: TenantBootstrap | null = null): BootstrapStorage {
  let current = initial;
  return {
    get: () => current,
    set: (bootstrap) => {
      current = bootstrap;
    },
    clear: () => {
      current = null;
    },
  };
}

const bootstrapV2: TenantBootstrap = { version: 2, tenant: { id: "tenant-1" }, locale: "en" };

describe("BootstrapRefreshCoordinator", () => {
  it("fetches and persists when there is no target version to compare against", async () => {
    const storage = inMemoryStorage();
    const fetchBootstrap = vi.fn().mockResolvedValue(bootstrapV2);
    const coordinator = createBootstrapRefreshCoordinator({ storage, fetchBootstrap });

    const result = await coordinator.refreshBootstrap();

    expect(fetchBootstrap).toHaveBeenCalledOnce();
    expect(result).toEqual(bootstrapV2);
    expect(storage.get()).toEqual(bootstrapV2);
  });

  it("skips the fetch when the target version already matches the cached copy", async () => {
    const storage = inMemoryStorage({ version: 2, tenant: { id: "tenant-1" }, locale: "en" });
    const fetchBootstrap = vi.fn();
    const coordinator = createBootstrapRefreshCoordinator({ storage, fetchBootstrap });

    const result = await coordinator.refreshBootstrap(2);

    expect(fetchBootstrap).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it("fetches when the target version differs from the cached copy", async () => {
    const storage = inMemoryStorage({ version: 1, tenant: { id: "tenant-1" }, locale: "en" });
    const fetchBootstrap = vi.fn().mockResolvedValue(bootstrapV2);
    const coordinator = createBootstrapRefreshCoordinator({ storage, fetchBootstrap });

    const result = await coordinator.refreshBootstrap(2);

    expect(fetchBootstrap).toHaveBeenCalledOnce();
    expect(result).toEqual(bootstrapV2);
  });

  it("notifies subscribers only when an actual fetch happens", async () => {
    const storage = inMemoryStorage({ version: 2, tenant: { id: "tenant-1" }, locale: "en" });
    const fetchBootstrap = vi.fn().mockResolvedValue(bootstrapV2);
    const coordinator = createBootstrapRefreshCoordinator({ storage, fetchBootstrap });
    const listener = vi.fn();
    coordinator.onRefreshed(listener);

    await coordinator.refreshBootstrap(2); // deduped, no fetch
    expect(listener).not.toHaveBeenCalled();

    await coordinator.refreshBootstrap(3); // mismatched, fetches
    expect(listener).toHaveBeenCalledWith(bootstrapV2);
  });

  it("stops notifying after unsubscribing", async () => {
    const storage = inMemoryStorage();
    const fetchBootstrap = vi.fn().mockResolvedValue(bootstrapV2);
    const coordinator = createBootstrapRefreshCoordinator({ storage, fetchBootstrap });
    const listener = vi.fn();
    const unsubscribe = coordinator.onRefreshed(listener);
    unsubscribe();

    await coordinator.refreshBootstrap();

    expect(listener).not.toHaveBeenCalled();
  });
});
