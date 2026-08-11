import { parseDateInput } from "./parse";
import type { DateInput } from "./types";

export interface FormatDateOptions extends Intl.DateTimeFormatOptions {
  /** BCP 47 locale tag. Defaults to the runtime's default locale when omitted. */
  locale?: string;
}

/**
 * Formats a date-only value using `Intl.DateTimeFormat`.
 * Defaults to `dateStyle: "medium"` when no formatting options are given.
 */
export function formatDate(input: DateInput, options: FormatDateOptions = {}): string {
  const { locale, ...intlOptions } = options;
  const hasStyleOrFields = Object.keys(intlOptions).length > 0;
  const formatter = new Intl.DateTimeFormat(
    locale,
    hasStyleOrFields ? intlOptions : { dateStyle: "medium" },
  );
  return formatter.format(parseDateInput(input));
}

/**
 * Formats a date and time value using `Intl.DateTimeFormat`.
 * Defaults to `dateStyle: "medium"` + `timeStyle: "short"` when no
 * formatting options are given.
 */
export function formatDateTime(input: DateInput, options: FormatDateOptions = {}): string {
  const { locale, ...intlOptions } = options;
  const hasStyleOrFields = Object.keys(intlOptions).length > 0;
  const formatter = new Intl.DateTimeFormat(
    locale,
    hasStyleOrFields ? intlOptions : { dateStyle: "medium", timeStyle: "short" },
  );
  return formatter.format(parseDateInput(input));
}
