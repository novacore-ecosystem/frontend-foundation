/**
 * Thin, well-documented wrappers around `Intl.NumberFormat`. This module
 * intentionally does not reimplement number formatting — the platform API
 * already handles locale-specific grouping, decimal separators, and digit
 * shaping correctly.
 */

export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  /** BCP 47 locale tag. Defaults to the runtime's default locale when omitted. */
  locale?: string;
}

/** Formats a number using `Intl.NumberFormat` with the given locale/options. */
export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  const { locale, ...intlOptions } = options;
  return new Intl.NumberFormat(locale, intlOptions).format(value);
}

export interface FormatDecimalOptions {
  /** BCP 47 locale tag. Defaults to the runtime's default locale when omitted. */
  locale?: string;
  /** Minimum number of fraction digits. Defaults to 0. */
  minimumFractionDigits?: number;
  /** Maximum number of fraction digits. Defaults to 2. */
  maximumFractionDigits?: number;
}

/**
 * Formats a number as a decimal value with a fixed fraction-digit range.
 * Defaults to 0-2 fraction digits (e.g. `1234.5` -> `"1,234.5"`).
 */
export function formatDecimal(value: number, options: FormatDecimalOptions = {}): string {
  const { locale, minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;
  return new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

export interface FormatPercentOptions {
  /** BCP 47 locale tag. Defaults to the runtime's default locale when omitted. */
  locale?: string;
  /** Minimum number of fraction digits. Defaults to 0. */
  minimumFractionDigits?: number;
  /** Maximum number of fraction digits. Defaults to 0. */
  maximumFractionDigits?: number;
}

/**
 * Formats a number as a percentage. The input is a fraction (`0.5` -> `"50%"`),
 * matching `Intl.NumberFormat`'s `style: "percent"` semantics — it does not
 * take an already-multiplied value like `50`.
 */
export function formatPercent(value: number, options: FormatPercentOptions = {}): string {
  const { locale, minimumFractionDigits = 0, maximumFractionDigits = 0 } = options;
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}
