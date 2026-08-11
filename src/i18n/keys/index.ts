import type { en } from "../resources/en";

/**
 * Recursively turns a nested object type into a union of dot-path
 * string literals down to its string leaves, e.g.
 * `{ common: { actions: { create: string } } }` -> `"common.actions.create"`.
 * Used once, on the English resource baseline, to derive
 * {@link TranslationKey} — this is the "generated key type" approach
 * mentioned in the i18n design doc, achieved with plain TypeScript
 * (no code generation step) since the resource tree is small enough
 * for the compiler to handle directly.
 */
export type DotPath<T> = T extends string
  ? never
  : { [K in keyof T & string]: T[K] extends string ? K : `${K}.${DotPath<T[K]>}` }[keyof T & string];

/**
 * Every translation key defined in this package's own resources
 * (`i18n/resources`), e.g. `"common.actions.save"` or
 * `"errors.user.notFound"`. Provided for autocomplete/typo-catching
 * when referencing a foundation-owned key — e.g. in `ErrorDefinition.messageKey`
 * or a permission's category key.
 *
 * `Translator`'s own `key` parameter (`i18n/types.ts`) deliberately
 * stays typed as plain `string`, not `TranslationKey` — applications
 * and tenants add their own keys beyond this baseline (via the
 * `application`/`tenant` dictionary layers), and forcing every call
 * site to satisfy this package's key union would make that extension
 * point impossible to use.
 */
export type TranslationKey = DotPath<typeof en>;
