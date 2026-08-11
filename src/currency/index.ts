/**
 * Currency formatting built on `Intl.NumberFormat`'s `style: "currency"`.
 * Currency symbols, digit grouping, and fraction-digit conventions (e.g.
 * VND has 0 decimal digits, USD/EUR have 2) all come from the platform's
 * CLDR data rather than being hard-coded here.
 */

export interface FormatCurrencyOptions {
  /** BCP 47 locale tag. Defaults to the runtime's default locale when omitted. */
  locale?: string;
  /**
   * How the currency should be displayed. Forwarded to
   * `Intl.NumberFormat`'s `currencyDisplay`. Defaults to `"symbol"`.
   */
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  /** Overrides the currency's default minimum fraction digits. */
  minimumFractionDigits?: number;
  /** Overrides the currency's default maximum fraction digits. */
  maximumFractionDigits?: number;
}

/**
 * Formats a numeric amount as currency, e.g.
 * `formatCurrency(100000, "VND")` -> `"₫100,000"` (locale-dependent),
 * `formatCurrency(99.9, "EUR", { locale: "de-DE" })` -> `"99,90 €"`.
 *
 * @param value the numeric amount, in the currency's major unit (e.g. dollars, not cents).
 * @param currencyCode ISO 4217 currency code (e.g. `"USD"`, `"VND"`, `"EUR"`).
 */
export function formatCurrency(
  value: number,
  currencyCode: string,
  options: FormatCurrencyOptions = {},
): string {
  const { locale, currencyDisplay = "symbol", minimumFractionDigits, maximumFractionDigits } = options;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay,
    ...(minimumFractionDigits !== undefined ? { minimumFractionDigits } : {}),
    ...(maximumFractionDigits !== undefined ? { maximumFractionDigits } : {}),
  }).format(value);
}
