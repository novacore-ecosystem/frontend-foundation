import type { TranslationDictionary } from "../i18n/types";

/** Identifies the tenant an application instance is running for. */
export interface TenantIdentity {
  /** Stable tenant identifier (e.g. a UUID or slug). */
  id: string;
  /** Human-readable tenant name, if available. */
  name?: string;
}

/**
 * Generic theming hook. Deliberately loose (`Record<string, unknown>`)
 * because the foundation does not know what a "theme" means to any given
 * framework/UI layer — it only carries the data through.
 */
export type ThemeSettings = Record<string, unknown>;

/** Arbitrary tenant/application settings not otherwise modeled. */
export type BootstrapSettings = Record<string, unknown>;

/** Boolean or variant-valued feature flags. */
export type FeatureFlags = Record<string, boolean | string | number>;

/** Free-form metadata that doesn't belong in a more specific field. */
export type BootstrapMetadata = Record<string, unknown>;

/**
 * The framework-agnostic contract for tenant bootstrap data: everything a
 * frontend application typically needs to initialize itself for a given
 * tenant/session, before any framework-specific state management
 * (React context, Vuex/Pinia store, Angular service, etc.) takes over.
 *
 * This type intentionally does not model business-specific tenant data
 * (billing plans, org charts, etc.) — applications extend it via
 * declaration merging or their own wrapper type for anything beyond this
 * generic shape.
 */
export interface TenantBootstrap {
  /** The tenant this bootstrap payload belongs to. */
  tenant: TenantIdentity;
  /** BCP 47 locale tag active for this session (e.g. `"en-US"`, `"vi-VN"`). */
  locale: string;
  /** IANA timezone name (e.g. `"Asia/Ho_Chi_Minh"`). Optional — not every consumer needs it. */
  timezone?: string;
  /** Translation dictionaries for the active locale, keyed by source layer (see the `i18n` module). */
  translations?: {
    tenant?: TranslationDictionary;
    application?: TranslationDictionary;
    fallback?: TranslationDictionary;
  };
  /** Opaque theme data, interpreted by a framework-specific UI layer. */
  theme?: ThemeSettings;
  /** Arbitrary tenant/application settings. */
  settings?: BootstrapSettings;
  /** Feature flags active for this tenant/session. */
  features?: FeatureFlags;
  /** Free-form metadata not covered by the fields above. */
  metadata?: BootstrapMetadata;
}
