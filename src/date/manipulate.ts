import { parseDateInput } from "./parse";
import type { DateInput } from "./types";

/**
 * All manipulation functions in this file operate on the **local wall
 * clock** (the host system's timezone), using `Date`'s local getters and
 * setters (`getDate`/`setDate`, `getMonth`/`setMonth`, etc.). This matches
 * how calendar arithmetic is normally expected to behave in UI code (e.g.
 * "add 1 day" should cross a DST boundary the way a human calendar would).
 * If you need UTC-based arithmetic, convert your input/output at the call
 * site — this module does not provide a separate UTC variant.
 */

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Adds `amount` calendar days (may be negative). Handles month/year rollover automatically. */
export function addDays(input: DateInput, amount: number): Date {
  const date = parseDateInput(input);
  date.setDate(date.getDate() + amount);
  return date;
}

/** Adds `amount` calendar weeks (may be negative). Equivalent to `addDays(input, amount * 7)`. */
export function addWeeks(input: DateInput, amount: number): Date {
  return addDays(input, amount * 7);
}

/**
 * Adds `amount` calendar months (may be negative).
 *
 * If the resulting month has fewer days than the original day-of-month,
 * the result is clamped to the last day of that month — e.g. Jan 31 + 1
 * month = Feb 28 (or Feb 29 in a leap year), not Mar 3.
 */
export function addMonths(input: DateInput, amount: number): Date {
  const original = parseDateInput(input);
  const day = original.getDate();
  const result = new Date(original.getTime());
  result.setDate(1);
  result.setMonth(result.getMonth() + amount);
  result.setDate(Math.min(day, daysInMonth(result.getFullYear(), result.getMonth())));
  return result;
}

/**
 * Adds `amount` calendar years (may be negative).
 *
 * Clamps Feb 29 to Feb 28 when the target year is not a leap year.
 */
export function addYears(input: DateInput, amount: number): Date {
  const original = parseDateInput(input);
  const month = original.getMonth();
  const day = original.getDate();
  const result = new Date(original.getTime());
  result.setDate(1);
  result.setFullYear(result.getFullYear() + amount);
  result.setMonth(month);
  result.setDate(Math.min(day, daysInMonth(result.getFullYear(), month)));
  return result;
}

/** Subtracts `amount` calendar days. Equivalent to `addDays(input, -amount)`. */
export function subtractDays(input: DateInput, amount: number): Date {
  return addDays(input, -amount);
}

/** Subtracts `amount` calendar weeks. Equivalent to `addWeeks(input, -amount)`. */
export function subtractWeeks(input: DateInput, amount: number): Date {
  return addWeeks(input, -amount);
}

/** Subtracts `amount` calendar months. Equivalent to `addMonths(input, -amount)`. */
export function subtractMonths(input: DateInput, amount: number): Date {
  return addMonths(input, -amount);
}

/** Subtracts `amount` calendar years. Equivalent to `addYears(input, -amount)`. */
export function subtractYears(input: DateInput, amount: number): Date {
  return addYears(input, -amount);
}

/** Returns a new `Date` set to local midnight (00:00:00.000) of the given day. */
export function startOfDay(input: DateInput): Date {
  const date = parseDateInput(input);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Returns a new `Date` set to the last local millisecond (23:59:59.999) of the given day. */
export function endOfDay(input: DateInput): Date {
  const date = parseDateInput(input);
  date.setHours(23, 59, 59, 999);
  return date;
}
