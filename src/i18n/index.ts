export type {
  TranslationDictionary,
  TranslationBundle,
  TranslationSources,
  InterpolationValues,
  MissingKeyStrategy,
  InterpolationOptions,
  CreateTranslatorOptions,
  TranslateCallOptions,
  Translator,
} from "./types";
export { interpolate } from "./interpolate";
export { lookupTranslationKey, resolveTranslation } from "./resolve";
export type { ResolveTranslationResult } from "./resolve";
export { createTranslator, TranslationMissingError } from "./translator";
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_METADATA,
  isSupportedLocale,
  normalizeLocale,
  resolveLocale,
  getLocaleMetadata,
  getSupportedLocales,
} from "./locale";
export type { Locale, LocaleMetadata } from "./locale";
export type { TranslationKey, DotPath } from "./keys";
export { TRANSLATION_RESOURCES, en, vi, zhCN } from "./resources";
