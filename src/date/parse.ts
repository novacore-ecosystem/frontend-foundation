import type { DateInput } from "./types";

const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/u;
const SLASH_DATE_ONLY = /^(\d{4})\/(\d{2})\/(\d{2})$/u;

/**
 * Parses a {@link DateInput} into a `Date` instance.
 *
 * ## Timezone assumptions (read carefully)
 *
 * `Date` itself has no concept of timezone — it only ever stores a single
 * UTC instant. Every value produced here is that same UTC instant; what
 * differs is which "wall clock" was used to *compute* it:
 *
 * - **Date instance** — cloned as-is, no reinterpretation.
 * - **number** — treated as a Unix timestamp in milliseconds (already an
 *   unambiguous instant, `new Date(number)`).
 * - **Full ISO 8601 strings with a time component** (e.g.
 *   `"2026-08-11T00:00:00Z"`, `"2026-08-11T09:00:00+07:00"`) — parsed via
 *   native `Date` parsing, which is unambiguous because the offset (or `Z`)
 *   is explicit.
 * - **Date-only strings** (`"2026-08-11"` or `"2026/08/11"`, with no time
 *   component) — deliberately interpreted as **local midnight**, i.e. the
 *   calendar date the string names, in the *host system's* timezone. This
 *   is an intentional deviation from the native `Date` constructor, which
 *   treats bare `"YYYY-MM-DD"` strings as **UTC** midnight (a well-known
 *   source of off-by-one-day bugs when the host is behind UTC). Frontend
 *   applications overwhelmingly pass date-only strings meaning "this
 *   calendar day, wherever the user is," so the foundation normalizes both
 *   accepted date-only formats (`-` and `/`) to that same local-midnight
 *   semantic rather than mixing the two native behaviors.
 *
 * If you need `"2026-08-11"` to mean UTC midnight, append `T00:00:00Z`
 * yourself before calling this function — that string form is
 * unambiguous and passed through untouched.
 *
 * @throws {TypeError} if the input cannot be parsed into a valid date.
 */
export function parseDateInput(input: DateInput): Date {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      throw new TypeError("parseDateInput: received an invalid Date instance");
    }
    return new Date(input.getTime());
  }

  if (typeof input === "number") {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      throw new TypeError(`parseDateInput: invalid timestamp "${input}"`);
    }
    return date;
  }

  if (typeof input === "string") {
    const dateOnly = ISO_DATE_ONLY.exec(input) ?? SLASH_DATE_ONLY.exec(input);
    if (dateOnly) {
      const [, yearStr, monthStr, dayStr] = dateOnly as unknown as [string, string, string, string];
      const year = Number(yearStr);
      const month = Number(monthStr);
      const day = Number(dayStr);
      const date = new Date(year, month - 1, day);
      const isValidCalendarDate =
        date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
      if (!isValidCalendarDate) {
        throw new TypeError(`parseDateInput: "${input}" is not a valid calendar date`);
      }
      return date;
    }

    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      throw new TypeError(`parseDateInput: unable to parse date string "${input}"`);
    }
    return parsed;
  }

  throw new TypeError(`parseDateInput: unsupported input type "${typeof input}"`);
}
