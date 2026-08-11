/**
 * Canonical locale contract for the platform, using BCP 47 language tags.
 *
 * ## Backend synchronization note (read before adding a locale)
 *
 * The backend's own supported-language list —
 * `NovaCore.BuildingBlock.SharedKernel.Constants.LanguageCodeConstant`
 * (`BuildingBlock.SharedKernel/Constants/LanguageCodeConstant.cs`) — is
 * currently `["en", "vi"]` only. `zh-CN` is a **frontend-only** locale
 * today: this package's static UI/error terminology resources fully
 * support it, but backend-owned dynamic content gated by that constant
 * (e.g. `PermissionDefinitionTranslation.LanguageCode`, see
 * `../../authorization/translation`) cannot yet store a `zh-CN` row —
 * `LanguageCode.Create("zh-CN")` would throw on the backend. This is a
 * known, reported discrepancy (see `docs/backend-contract-sync.md`), not
 * a bug in this package. If the backend adds `zh-CN` support, no change
 * is needed here — this list is already correct.
 */
export const SUPPORTED_LOCALES = ["en", "vi", "zh-CN"] as const;

/** A supported BCP 47 locale tag: `"en"`, `"vi"`, or `"zh-CN"`. */
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * The platform-wide default/fallback locale. Centralized here — do not
 * hard-code `"en"` elsewhere as a fallback; import this instead.
 */
export const DEFAULT_LOCALE: Locale = "en";

export interface LocaleMetadata {
  code: Locale;
  /** English display name, e.g. for use in developer tooling or as a fallback label. */
  name: string;
  /** The locale's own native display name, e.g. `"Tiếng Việt"` for `vi`. Prefer this in locale selectors. */
  nativeName: string;
  /** Text direction. All currently supported locales are left-to-right. */
  direction: "ltr" | "rtl";
}

/** Metadata for every supported locale, keyed by {@link Locale}. */
export const LOCALE_METADATA: Record<Locale, LocaleMetadata> = {
  en: { code: "en", name: "English", nativeName: "English", direction: "ltr" },
  vi: { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", direction: "ltr" },
  "zh-CN": { code: "zh-CN", name: "Simplified Chinese", nativeName: "简体中文", direction: "ltr" },
};

/** Returns true if `value` is exactly one of the supported locale codes. */
export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Normalizes an arbitrary locale-ish string (varying case, `-`/`_`
 * separator, or a region subtag we don't independently support) into a
 * supported {@link Locale}, or `null` if it cannot be matched to one.
 *
 * Deliberate rules (documented, not incidental):
 * - Exact matches (`"en"`, `"vi"`, `"zh-CN"`) pass straight through.
 * - Case and separator variations normalize to the supported form —
 *   `"en-US"`, `"en-us"`, `"EN"` all resolve to `"en"`; `"zh-cn"`
 *   resolves to `"zh-CN"`.
 * - A bare `"zh"` (no region) resolves to `"zh-CN"`, since that's the
 *   only Chinese variant this platform currently supports. This is a
 *   deliberate default, not an accident — a region that ISN'T `CN`
 *   (e.g. `"zh-TW"`, `"zh-HK"`) does **not** fall back to `"zh-CN"`,
 *   because those are different locales, not different casings of the
 *   same one.
 * - Anything else (unsupported language entirely, e.g. `"fr"`, or
 *   garbage input) returns `null` — callers decide the fallback (see
 *   {@link resolveLocale}).
 */
export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  if (isSupportedLocale(trimmed)) return trimmed;

  const [rawLanguage, rawRegion] = trimmed.split(/[-_]/);
  const language = rawLanguage?.toLowerCase();
  const region = rawRegion?.toUpperCase();

  if (language && region) {
    const candidate = `${language}-${region}`;
    if (isSupportedLocale(candidate)) return candidate;
  }

  if (language === "zh" && !region) return "zh-CN";

  if (language && isSupportedLocale(language)) return language as Locale;

  return null;
}

/**
 * Resolves a requested locale-ish string to a supported {@link Locale},
 * falling back to `fallback` (default {@link DEFAULT_LOCALE}) when the
 * request doesn't normalize to one. Use this at the boundary where an
 * external value (tenant bootstrap, `Accept-Language`, a user setting)
 * enters the system, so application code never has to reach for
 * `locale as Locale`.
 */
export function resolveLocale(requested: string | null | undefined, fallback: Locale = DEFAULT_LOCALE): Locale {
  return normalizeLocale(requested) ?? fallback;
}

/** Returns the {@link LocaleMetadata} for a known {@link Locale}. */
export function getLocaleMetadata(locale: Locale): LocaleMetadata {
  return LOCALE_METADATA[locale];
}

/**
 * Returns metadata for every supported locale, in {@link SUPPORTED_LOCALES}
 * order — ready for a framework adapter to render a locale selector
 * without maintaining its own language list.
 */
export function getSupportedLocales(): readonly LocaleMetadata[] {
  return SUPPORTED_LOCALES.map((code) => LOCALE_METADATA[code]);
}
