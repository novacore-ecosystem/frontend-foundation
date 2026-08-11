import { createTranslator } from "../i18n/translator";
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
 * Builds a bound {@link Translator} directly from a {@link TenantBootstrap}
 * payload's `locale` and `translations` fields, so consumers don't have to
 * manually wire `createTranslator` themselves for the common case.
 */
export function createTranslatorFromBootstrap(
  bootstrap: TenantBootstrap,
  options: Partial<Omit<CreateTranslatorOptions, "locale">> = {},
): Translator {
  return createTranslator(
    {
      tenant: bootstrap.translations?.tenant ? { [bootstrap.locale]: bootstrap.translations.tenant } : undefined,
      application: bootstrap.translations?.application
        ? { [bootstrap.locale]: bootstrap.translations.application }
        : undefined,
      fallback: bootstrap.translations?.fallback
        ? { [bootstrap.locale]: bootstrap.translations.fallback }
        : undefined,
    },
    { ...options, locale: bootstrap.locale },
  );
}
