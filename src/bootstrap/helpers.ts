import { createTranslator } from "../i18n/translator";
import { DEFAULT_LOCALE, resolveLocale, type Locale } from "../i18n/locale";
import type { CreateTranslatorOptions, Translator } from "../i18n/types";
import type { FeatureFlags, TenantBootstrap } from "./types";

/**
 * Returns whether a feature flag is enabled. Any truthy value (`true`, a
 * non-empty string, a non-zero number) counts as enabled; `undefined`
 * (flag not present) counts as disabled unless `defaultValue` says otherwise.
 */
export function isFeatureEnabled(
  features: FeatureFlags | undefined,
  key: string,
  defaultValue = false,
): boolean {
  if (!features || !(key in features)) return defaultValue;
  return Boolean(features[key]);
}

/**
 * The single normalization boundary between `TenantBootstrap.locale`
 * (an unconstrained `string`, since bootstrap payloads may originate
 * from systems that don't validate against this platform's supported
 * locale list) and the canonical {@link Locale} type. Application code
 * should call this once at the bootstrap boundary rather than casting
 * `bootstrap.locale as Locale` at every use site.
 */
export function resolveTenantLocale(bootstrap: TenantBootstrap): Locale {
  return resolveLocale(bootstrap.locale);
}

/**
 * Builds a bound {@link Translator} directly from a {@link TenantBootstrap}
 * payload's `locale` and `translations` fields, so consumers don't have to
 * manually wire `createTranslator` themselves for the common case.
 *
 * `bootstrap.locale` is normalized via {@link resolveTenantLocale} rather
 * than trusted as-is, and `fallbackLocale` defaults to
 * {@link DEFAULT_LOCALE} (override via `options.fallbackLocale` if a
 * consumer wants no locale fallback). This translator only resolves
 * from `bootstrap.translations` — it does not automatically merge in
 * this package's own `TRANSLATION_RESOURCES` (`i18n/resources`); pass
 * those yourself as an additional `fallback` layer via `createTranslator`
 * directly if you want the platform's common/admin/error terminology
 * available through the same translator instance (see `docs/i18n.md`).
 */
export function createTranslatorFromBootstrap(
  bootstrap: TenantBootstrap,
  options: Partial<Omit<CreateTranslatorOptions, "locale">> = {},
): Translator {
  const locale = resolveTenantLocale(bootstrap);

  return createTranslator(
    {
      tenant: bootstrap.translations?.tenant ? { [locale]: bootstrap.translations.tenant } : undefined,
      application: bootstrap.translations?.application
        ? { [locale]: bootstrap.translations.application }
        : undefined,
      fallback: bootstrap.translations?.fallback ? { [locale]: bootstrap.translations.fallback } : undefined,
    },
    { fallbackLocale: DEFAULT_LOCALE, ...options, locale },
  );
}
