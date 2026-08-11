import { describe, expect, it } from "vitest";
import {
  createTranslator,
  getPermissionCategoryTranslationKey,
  PERMISSION_VALUES,
  Permissions,
  translatePermissionCategory,
  TRANSLATION_RESOURCES,
  type PermissionDisplayInfo,
} from "../../src/index";

describe("getPermissionCategoryTranslationKey", () => {
  it("resolves Root and User to their dedicated keys", () => {
    expect(getPermissionCategoryTranslationKey(Permissions.Root)).toBe("permissions.root");
    expect(getPermissionCategoryTranslationKey(Permissions.User)).toBe("permissions.user");
  });

  it("resolves a module permission to its category key", () => {
    expect(getPermissionCategoryTranslationKey(Permissions.Order.View)).toBe("permissions.categories.order");
    expect(getPermissionCategoryTranslationKey(Permissions.Inventory.StockMove)).toBe(
      "permissions.categories.inventory",
    );
  });

  it("every permission's derived category key resolves to a real, non-empty translation (drift detection)", () => {
    const translate = createTranslator({ application: TRANSLATION_RESOURCES }, { locale: "en" });
    for (const permission of PERMISSION_VALUES) {
      const key = getPermissionCategoryTranslationKey(permission);
      const label = translate(key);
      expect(label, `permission "${permission}" -> key "${key}" should resolve to real text`).not.toBe(key);
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe("translatePermissionCategory", () => {
  it("resolves a human-readable category label via a supplied translator", () => {
    const translate = createTranslator({ application: TRANSLATION_RESOURCES }, { locale: "en" });
    expect(translatePermissionCategory(Permissions.Order.Manage, translate)).toBe("Orders");
    expect(translatePermissionCategory(Permissions.Root, translate)).toBe("Full system access");
  });

  it("resolves in Vietnamese and Simplified Chinese", () => {
    const translateVi = createTranslator({ application: TRANSLATION_RESOURCES }, { locale: "vi" });
    const translateZh = createTranslator({ application: TRANSLATION_RESOURCES }, { locale: "zh-CN" });
    expect(translatePermissionCategory(Permissions.Order.View, translateVi)).toBe("Đơn hàng");
    expect(translatePermissionCategory(Permissions.Order.View, translateZh)).toBe("订单");
  });

  it("never surfaces the raw technical permission identifier as the label", () => {
    const translate = createTranslator({ application: TRANSLATION_RESOURCES }, { locale: "en" });
    const label = translatePermissionCategory(Permissions.Inventory.CycleCount, translate);
    expect(label).not.toBe(Permissions.Inventory.CycleCount);
    expect(label).not.toContain(":");
  });
});

describe("PermissionDisplayInfo (type-only contract check)", () => {
  it("shapes a backend-provided display info object correctly", () => {
    const info: PermissionDisplayInfo = {
      id: Permissions.Order.View,
      displayName: "View orders",
      description: "Allows viewing order details",
    };
    expect(info.id).toBe("order:view");
  });
});
