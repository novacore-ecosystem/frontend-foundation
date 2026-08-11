/**
 * Framework-agnostic string utilities.
 *
 * All functions treat `null`/`undefined` as empty input where applicable and
 * are Unicode-aware (operate on code points, not UTF-16 code units, where it
 * matters for correctness — e.g. truncate/slugify with astral characters).
 */

/** Returns true if the value is `null`, `undefined`, or an empty string. */
export function isNullOrEmpty(value: string | null | undefined): value is null | undefined | "" {
  return value === null || value === undefined || value === "";
}

/** Returns true if the value is `null`, `undefined`, or contains only whitespace. */
export function isBlank(value: string | null | undefined): boolean {
  return isNullOrEmpty(value) || value.trim().length === 0;
}

/** Coerces any value to a string safely, without throwing. `null`/`undefined` become `""`. */
export function toStringSafe(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  try {
    return String(value);
  } catch {
    return "";
  }
}

/** Trims and collapses internal whitespace runs into a single space. */
export function normalizeString(value: string | null | undefined): string {
  if (isNullOrEmpty(value)) return "";
  return value.trim().replace(/\s+/gu, " ");
}

/** Uppercases the first code point of the string; leaves the rest untouched. */
export function capitalize(value: string | null | undefined): string {
  if (isNullOrEmpty(value)) return "";
  const chars = Array.from(value);
  const [first, ...rest] = chars;
  if (!first) return "";
  return first.toLocaleUpperCase() + rest.join("");
}

/** Splits a string into normalized words, handling camelCase, spaces, and separators like `-`/`_`. */
function toWords(value: string | null | undefined): string[] {
  if (isNullOrEmpty(value)) return [];
  return value
    .replace(/([a-z0-9])([A-Z])/gu, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/gu, "$1 $2")
    .split(/[\s_\-]+/u)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

/** Converts a string to camelCase, e.g. "hello world" -> "helloWorld". */
export function camelCase(value: string | null | undefined): string {
  const words = toWords(value);
  if (words.length === 0) return "";
  return words
    .map((w, i) => {
      const lower = w.toLocaleLowerCase();
      return i === 0 ? lower : lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
    })
    .join("");
}

/** Converts a string to PascalCase, e.g. "hello world" -> "HelloWorld". */
export function pascalCase(value: string | null | undefined): string {
  const words = toWords(value);
  return words
    .map((w) => {
      const lower = w.toLocaleLowerCase();
      return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
    })
    .join("");
}

/** Converts a string to kebab-case, e.g. "Hello World" -> "hello-world". */
export function kebabCase(value: string | null | undefined): string {
  return toWords(value)
    .map((w) => w.toLocaleLowerCase())
    .join("-");
}

/** Converts a string to snake_case, e.g. "Hello World" -> "hello_world". */
export function snakeCase(value: string | null | undefined): string {
  return toWords(value)
    .map((w) => w.toLocaleLowerCase())
    .join("_");
}

export interface TruncateOptions {
  /** String appended when truncation occurs. Defaults to "…". */
  suffix?: string;
}

/**
 * Truncates a string to at most `maxLength` code points (counting the
 * suffix), operating on Unicode code points rather than UTF-16 units so
 * surrogate pairs (e.g. emoji) are not split.
 */
export function truncate(
  value: string | null | undefined,
  maxLength: number,
  options: TruncateOptions = {},
): string {
  if (isNullOrEmpty(value)) return "";
  if (maxLength <= 0) return "";
  const suffix = options.suffix ?? "…";
  const chars = Array.from(value);
  if (chars.length <= maxLength) return value;

  const suffixChars = Array.from(suffix);
  const keep = Math.max(maxLength - suffixChars.length, 0);
  return chars.slice(0, keep).join("") + suffix;
}

export interface SlugifyOptions {
  /** Separator used between words. Defaults to "-". */
  separator?: string;
  /** Lowercase the result. Defaults to true. */
  lowercase?: boolean;
}

/**
 * Converts a string into a URL-safe slug: Unicode diacritics are stripped
 * via NFKD normalization, non-alphanumeric runs become the separator, and
 * leading/trailing separators are removed.
 */
export function slugify(value: string | null | undefined, options: SlugifyOptions = {}): string {
  if (isNullOrEmpty(value)) return "";
  const separator = options.separator ?? "-";
  const lowercase = options.lowercase ?? true;

  const normalized = value.normalize("NFKD").replace(/\p{Mn}/gu, "");

  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const sepPattern = new RegExp(`(?:${escapedSeparator})+`, "gu");
  const trimPattern = new RegExp(`^${escapedSeparator}+|${escapedSeparator}+$`, "gu");

  let slug = normalized
    .replace(/[^a-zA-Z0-9]+/gu, separator)
    .replace(sepPattern, separator)
    .replace(trimPattern, "");

  if (lowercase) slug = slug.toLocaleLowerCase();
  return slug;
}
