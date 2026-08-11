/** A single translation string, or a nested group of keys (e.g. `{ welcome: { message: "..." } }`). */
export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

/** A set of dictionaries keyed by BCP 47 locale tag (e.g. `"en"`, `"vi"`). */
export interface TranslationBundle {
  [locale: string]: TranslationDictionary;
}

/**
 * The three layers consulted, in priority order, when resolving a
 * translation key: tenant override -> application dictionary -> fallback
 * dictionary. Any layer may be omitted.
 */
export interface TranslationSources {
  /** Highest priority. Tenant-specific overrides (e.g. custom wording for a specific customer). */
  tenant?: TranslationBundle;
  /** The application's own dictionary. */
  application?: TranslationBundle;
  /** Lowest priority. A default/base dictionary used when nothing else has the key. */
  fallback?: TranslationBundle;
}

/** Values substituted into `{{placeholder}}` tokens during interpolation. */
export type InterpolationValues = Record<string, string | number>;

/**
 * What a translator returns when a key isn't found in any source:
 * - `"key"` (default) — return the key itself, so missing translations are visible but non-fatal.
 * - `"empty"` — return an empty string.
 * - a function — compute a custom fallback string.
 */
export type MissingKeyStrategy = "key" | "empty" | ((key: string, locale: string) => string);

export interface InterpolationOptions {
  /** Placeholder opening delimiter. Defaults to `"{{"`. */
  prefix?: string;
  /** Placeholder closing delimiter. Defaults to `"}}"`. */
  suffix?: string;
}

export interface CreateTranslatorOptions {
  /** The default locale used to select dictionaries within each source. */
  locale: string;
  /**
   * A second locale to retry against (same tenant -> application ->
   * fallback layer walk) when `locale` has no match for a key.
   * `undefined` by default — no locale fallback, matching this
   * translator's behavior before locale fallback existed. Framework
   * adapters/apps building on the platform's `Locale` type will
   * typically pass `DEFAULT_LOCALE` here (see the `i18n/locale`
   * module) rather than leaving users of an incomplete locale with
   * raw keys.
   */
  fallbackLocale?: string;
  /** Missing-key behavior. Defaults to `"key"`. */
  onMissingKey?: MissingKeyStrategy;
  /** Throw {@link TranslationMissingError} instead of applying `onMissingKey`. Defaults to `false`. */
  strict?: boolean;
  interpolation?: InterpolationOptions;
}

export interface TranslateCallOptions {
  /** Overrides the translator's default locale for this call only. */
  locale?: string;
}

/** A translation function bound to a fixed set of sources, as returned by {@link createTranslator}. */
export type Translator = (
  key: string,
  values?: InterpolationValues,
  callOptions?: TranslateCallOptions,
) => string;
