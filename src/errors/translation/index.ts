import { createTranslator } from "../../i18n/translator";
import { DEFAULT_LOCALE, type Locale } from "../../i18n/locale";
import { TRANSLATION_RESOURCES } from "../../i18n/resources";
import type { InterpolationValues, TranslationBundle } from "../../i18n/types";
import { getErrorDefinition } from "../definitions";

export interface TranslateErrorOptions {
  /** Defaults to {@link DEFAULT_LOCALE}. */
  locale?: Locale;
  /** Tenant-specific overrides for error message translation keys, same shape as `TranslationSources.tenant`. */
  tenantOverrides?: TranslationBundle;
  /** Interpolation values for the resolved message, if it has placeholders. */
  values?: InterpolationValues;
  /**
   * When `true`, the absolute last-resort fallback (no definition, no
   * backend message, no generic translation available) shows the raw
   * error code instead of a generic English sentence. Defaults to
   * `false` — production-safe by default, per the rule that a
   * technical identifier must never reach a normal user; opt in only
   * for developer/debug tooling.
   */
  debug?: boolean;
}

/**
 * Resolves a human-readable message for a backend error response,
 * mirroring the intended flow:
 *
 * ```text
 * Backend error code (ApiResponse.messageCode)
 *         -> ErrorDefinition (../definitions)
 *         -> translation key
 *         -> tenant override, then platform translation, at the
 *            requested locale, then DEFAULT_LOCALE (see createTranslator's
 *            fallbackLocale)
 *         -> ErrorDefinition.defaultMessage
 *         -> the backend-provided `message` (English, not localized —
 *            used only when this package has no definition/translation
 *            for the code at all)
 *         -> a generic localized fallback ("errors.generic.fallback")
 *         -> raw code (debug mode only) or a generic English sentence
 * ```
 *
 * Never returns `undefined`, and never exposes a raw translation key or
 * (outside `debug`) a raw error code — see the module-level rule against
 * leaking technical identifiers to end users.
 */
export function translateError(
  error: { messageCode?: string | null; message?: string },
  options: TranslateErrorOptions = {},
): string {
  const locale = options.locale ?? DEFAULT_LOCALE;
  const translate = createTranslator(
    { tenant: options.tenantOverrides, application: TRANSLATION_RESOURCES },
    { locale, fallbackLocale: DEFAULT_LOCALE, onMissingKey: "empty" },
  );

  const code = error.messageCode;
  const definition = code ? getErrorDefinition(code) : undefined;

  if (definition) {
    const localized = translate(definition.messageKey, options.values);
    if (localized) return localized;
    if (definition.defaultMessage) return definition.defaultMessage;
  }

  if (error.message) return error.message;

  const generic = translate("errors.generic.fallback");
  if (generic) return generic;

  return options.debug && code ? code : "An unexpected error occurred";
}
