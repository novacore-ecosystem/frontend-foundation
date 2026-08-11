import { interpolate } from "./interpolate";
import { resolveTranslation } from "./resolve";
import type { CreateTranslatorOptions, TranslationSources, Translator } from "./types";

/** Thrown by a translator created with `{ strict: true }` when a key is missing from every source. */
export class TranslationMissingError extends Error {
  constructor(
    public readonly key: string,
    public readonly locale: string,
  ) {
    super(`Missing translation for key "${key}" in locale "${locale}"`);
    this.name = "TranslationMissingError";
  }
}

/**
 * Creates a bound translation function from a fixed set of dictionaries.
 *
 * Resolution order for each call: tenant override -> application
 * dictionary -> fallback dictionary -> the key itself. This function
 * contains no framework-specific state (no React context, no Vue
 * composable) — it is a plain closure intended to be wrapped by
 * framework-specific adapters.
 *
 * @example
 * ```ts
 * const translate = createTranslator(sources, { locale: "en" });
 * translate("welcome.message", { name: "Tan" }); // "Hello, Tan"
 * ```
 */
export function createTranslator(sources: TranslationSources, options: CreateTranslatorOptions): Translator {
  const { locale: defaultLocale, fallbackLocale, onMissingKey = "key", strict = false, interpolation } = options;

  return function translate(key, values, callOptions) {
    const locale = callOptions?.locale ?? defaultLocale;
    const { value, found } = resolveTranslation(key, sources, locale, fallbackLocale);

    if (!found) {
      if (strict) throw new TranslationMissingError(key, locale);
      if (onMissingKey === "empty") return "";
      if (typeof onMissingKey === "function") return onMissingKey(key, locale);
      return value; // "key" strategy: value is already the key itself.
    }

    return interpolate(value, values, interpolation);
  };
}
