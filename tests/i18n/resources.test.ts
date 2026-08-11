import { describe, expect, it } from "vitest";
import { en, SUPPORTED_LOCALES, TRANSLATION_RESOURCES, vi, zhCN } from "../../src/i18n";

/** Recursively collects every dot-path leaf key of a nested resource object. */
function collectKeys(node: unknown, prefix = ""): string[] {
  if (typeof node === "string") return [prefix];
  if (node && typeof node === "object") {
    return Object.entries(node).flatMap(([key, value]) => collectKeys(value, prefix ? `${prefix}.${key}` : key));
  }
  return [];
}

describe("translation resource completeness (en/vi/zh-CN must have the same key set)", () => {
  const enKeys = collectKeys(en).sort();
  const viKeys = collectKeys(vi).sort();
  const zhKeys = collectKeys(zhCN).sort();

  it("en has a non-trivial number of keys (sanity check the baseline isn't empty)", () => {
    expect(enKeys.length).toBeGreaterThan(40);
  });

  it("vi has exactly the same key set as en — no missing, no orphan keys", () => {
    const missing = enKeys.filter((k) => !viKeys.includes(k));
    const orphans = viKeys.filter((k) => !enKeys.includes(k));
    expect({ missing, orphans }).toEqual({ missing: [], orphans: [] });
    expect(viKeys.length).toBe(enKeys.length);
  });

  it("zh-CN has exactly the same key set as en — no missing, no orphan keys", () => {
    const missing = enKeys.filter((k) => !zhKeys.includes(k));
    const orphans = zhKeys.filter((k) => !enKeys.includes(k));
    expect({ missing, orphans }).toEqual({ missing: [], orphans: [] });
    expect(zhKeys.length).toBe(enKeys.length);
  });

  it("every leaf value in every locale is a non-empty string", () => {
    for (const resource of [en, vi, zhCN]) {
      const values = collectKeysWithValues(resource);
      for (const [key, value] of values) {
        expect(typeof value, `${key} should be a string`).toBe("string");
        expect((value as string).length, `${key} should not be empty`).toBeGreaterThan(0);
      }
    }
  });
});

function collectKeysWithValues(node: unknown, prefix = ""): Array<[string, unknown]> {
  if (typeof node === "string") return [[prefix, node]];
  if (node && typeof node === "object") {
    return Object.entries(node).flatMap(([key, value]) =>
      collectKeysWithValues(value, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

describe("TRANSLATION_RESOURCES", () => {
  it("is keyed by every supported locale", () => {
    expect(Object.keys(TRANSLATION_RESOURCES).sort()).toEqual([...SUPPORTED_LOCALES].sort());
  });

  it("each locale's resource matches its standalone export", () => {
    expect(TRANSLATION_RESOURCES.en).toBe(en);
    expect(TRANSLATION_RESOURCES.vi).toBe(vi);
    expect(TRANSLATION_RESOURCES["zh-CN"]).toBe(zhCN);
  });
});

describe("representative admin/common terminology across locales", () => {
  it("common.actions.create exists and differs per locale", () => {
    expect(en.common.actions.create).toBe("Create");
    expect(vi.common.actions.create).toBe("Tạo mới");
    expect(zhCN.common.actions.create).toBe("新建");
  });

  it("admin.entities.orders exists in all three locales", () => {
    expect(en.admin.entities.orders).toBeTruthy();
    expect(vi.admin.entities.orders).toBeTruthy();
    expect(zhCN.admin.entities.orders).toBeTruthy();
  });

  it("common.welcome supports interpolation placeholders in every locale", () => {
    expect(en.common.welcome).toContain("{{name}}");
    expect(vi.common.welcome).toContain("{{name}}");
    expect(zhCN.common.welcome).toContain("{{name}}");
  });
});
