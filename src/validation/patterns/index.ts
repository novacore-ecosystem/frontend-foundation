/**
 * Regex patterns mirrored verbatim from the backend's shared kernel,
 * `NovaCore.BuildingBlock.SharedKernel.RegexPatterns`
 * (`BuildingBlock.SharedKernel/RegexPatterns/{Identity,Formatting}.cs`),
 * so frontend validation agrees with backend validation for the same
 * rule. Patterns are not "fixed" or "improved" here even where they look
 * unusual — see the caveats below — because backend/frontend must stay
 * synchronized; if a pattern is wrong, it needs to change in the backend
 * first.
 *
 * ## Deliberately NOT mirrored: phone number
 *
 * The backend's `RegexPatterns.PhoneNumber()` pattern
 * (`/(?:([+]\d{1,4})[-.\s]?)?(?:[(](\d{1,3})[)][-.\s]?)?(\d{1,4})[-.\s]?(\d{1,4})[-.\s]?(\d{1,9})/g`)
 * literally embeds JavaScript regex-literal delimiters (`/…/g`) as part
 * of the .NET pattern string, so as a real .NET regex it only matches
 * strings that literally start with `/` and end with `/g` — it is
 * effectively broken in the backend itself. Separately, the User
 * service's actual validator uses a different, much looser rule
 * (`^\d{10,}$`, digits only, no country-code awareness) that also
 * disagrees with the SharedKernel pattern. Neither is suitable to mirror.
 * This package's `phone` module (backed by `libphonenumber-js`) is a
 * strictly better, internationally-correct source of truth for phone
 * validation — use `isValidPhoneNumber` from there instead. This
 * divergence should be reported to the backend team; it is not fixed
 * here (see the README's "Backend Contract Synchronization" section).
 *
 * ## Slug: two divergent backend definitions
 *
 * `RegexPatterns.Slug()` (mirrored below) is the SharedKernel/canonical
 * pattern, but `Product.Domain`'s own `Slug` value object defines a
 * slightly different pattern locally instead of referencing this one
 * (capturing group instead of non-capturing, no `IgnoreCase` flag — see
 * backend audit notes). The two are behaviorally close but not
 * identical. `SLUG_PATTERN`/`isSlug` below mirror the SharedKernel
 * version as the canonical candidate; this package's own `slugify`
 * (in the `string` module) always produces lowercase output compatible
 * with both.
 */

/** Mirrors `RegexPatterns.Email()`. `RegexOptions.Compiled | RegexOptions.IgnoreCase` -> the `i` flag. */
export const EMAIL_PATTERN = "^((?!\\.)[\\w\\-_.]*[^.])(@\\w+)(\\.\\w+(\\.\\w+)?[^.\\W])$";
export const EMAIL_REGEX = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/i;

/** Mirrors `RegexPatterns.Slug()`. `RegexOptions.Compiled | RegexOptions.IgnoreCase` -> the `i` flag. See the divergence note above. */
export const SLUG_PATTERN = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

/** Mirrors `RegexPatterns.Sku()`. `RegexOptions.IgnoreCase` -> the `i` flag. */
export const SKU_PATTERN = "^[A-Z1-9](?!.*--)[A-Z0-9-]{1,28}[A-Z0-9]$";
export const SKU_REGEX = /^[A-Z1-9](?!.*--)[A-Z0-9-]{1,28}[A-Z0-9]$/i;

/** Mirrors `RegexPatterns.BarcodeFormat()`. No regex options set in the backend. */
export const BARCODE_PATTERN = "^[0-9]{8,14}$";
export const BARCODE_REGEX = /^[0-9]{8,14}$/;
