import type { TranslationDictionary, TranslationSources } from "./types";

/**
 * Looks up `key` in `dict`. Supports two dictionary shapes transparently:
 * a flat dictionary with dotted keys (`{ "welcome.message": "..." }`) is
 * checked first via direct property access, then a nested dictionary
 * (`{ welcome: { message: "..." } }`) is checked by traversing `key` split
 * on `.`. Returns `undefined` if neither shape has the key.
 */
export function lookupTranslationKey(
  dict: TranslationDictionary | undefined,
  key: string,
): string | undefined {
  if (!dict) return undefined;

  const direct = dict[key];
  if (typeof direct === "string") return direct;

  const segments = key.split(".");
  let current: TranslationDictionary | string | undefined = dict;
  for (const segment of segments) {
    if (typeof current !== "object" || current === null) return undefined;
    current = current[segment];
  }
  return typeof current === "string" ? current : undefined;
}

export interface ResolveTranslationResult {
  /** The resolved translation string, or the original `key` if not found. */
  value: string;
  /** Whether the key was found in any source. */
  found: boolean;
}

/**
 * Resolves `key` against `sources` for `locale`, walking layers in
 * priority order: tenant override -> application dictionary -> fallback
 * dictionary.
 *
 * If `fallbackLocale` is given and differs from `locale`, and none of
 * the three layers had the key for `locale`, the same three-layer walk
 * repeats for `fallbackLocale` before giving up. This is opt-in
 * (`fallbackLocale` is `undefined` by default, meaning "no locale
 * fallback" — identical to this function's behavior before locale
 * fallback existed) so it never changes behavior for existing callers
 * that don't pass it. The full deterministic order when it IS passed:
 * tenant(locale) -> application(locale) -> fallback(locale) ->
 * tenant(fallbackLocale) -> application(fallbackLocale) ->
 * fallback(fallbackLocale) -> the key itself.
 */
export function resolveTranslation(
  key: string,
  sources: TranslationSources,
  locale: string,
  fallbackLocale?: string,
): ResolveTranslationResult {
  const layers = [sources.tenant?.[locale], sources.application?.[locale], sources.fallback?.[locale]];

  for (const dict of layers) {
    const value = lookupTranslationKey(dict, key);
    if (value !== undefined) return { value, found: true };
  }

  if (fallbackLocale && fallbackLocale !== locale) {
    const fallbackLayers = [
      sources.tenant?.[fallbackLocale],
      sources.application?.[fallbackLocale],
      sources.fallback?.[fallbackLocale],
    ];
    for (const dict of fallbackLayers) {
      const value = lookupTranslationKey(dict, key);
      if (value !== undefined) return { value, found: true };
    }
  }

  return { value: key, found: false };
}
