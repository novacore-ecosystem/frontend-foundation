import { parseDateInput } from "./parse";
import type { DateInput } from "./types";

export interface RelativeTimeOptions {
  /** BCP 47 locale tag. Defaults to the runtime's default locale when omitted. */
  locale?: string;
  /** The reference "now" instant. Defaults to `new Date()`. Useful for deterministic tests. */
  now?: DateInput;
  /** Forwarded to `Intl.RelativeTimeFormat`. Defaults to `"auto"` (e.g. "yesterday" instead of "1 day ago" where the locale supports it). */
  numeric?: Intl.RelativeTimeFormatNumeric;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Threshold table used to pick the `Intl.RelativeTimeFormat` unit.
 * Each entry's `maxAbsMs` is the largest absolute millisecond difference
 * still handled by that unit; the table is walked in order and the first
 * matching entry wins.
 *
 * | absolute difference | unit   |
 * |---------------------|--------|
 * | < 10s                | "now" (special-cased below) |
 * | < 60s                | second |
 * | < 60min              | minute |
 * | < 24h                | hour   |
 * | < 7d                 | day    |
 * | < 30d                | week   |
 * | < 365d               | month  |
 * | >= 365d               | year   |
 */
const THRESHOLDS: Array<{ maxAbsMs: number; unit: Intl.RelativeTimeFormatUnit; divisor: number }> = [
  { maxAbsMs: 60 * SECOND, unit: "second", divisor: SECOND },
  { maxAbsMs: 60 * MINUTE, unit: "minute", divisor: MINUTE },
  { maxAbsMs: 24 * HOUR, unit: "hour", divisor: HOUR },
  { maxAbsMs: 7 * DAY, unit: "day", divisor: DAY },
  { maxAbsMs: 30 * DAY, unit: "week", divisor: WEEK },
  { maxAbsMs: 365 * DAY, unit: "month", divisor: MONTH },
  { maxAbsMs: Number.POSITIVE_INFINITY, unit: "year", divisor: YEAR },
];

const JUST_NOW_THRESHOLD_MS = 10 * SECOND;

/**
 * Formats the difference between `input` and `now` (default: the current
 * time) as a localized relative time string, e.g. "5 minutes ago",
 * "in 2 days", or "just now". Powered by `Intl.RelativeTimeFormat`, so
 * wording is locale-appropriate rather than hard-coded English — pass
 * `locale` to control it. See {@link THRESHOLDS} for the unit-selection
 * rules.
 */
export function relativeTime(input: DateInput, options: RelativeTimeOptions = {}): string {
  const { locale, numeric = "auto" } = options;
  const target = parseDateInput(input);
  const now = parseDateInput(options.now ?? new Date());
  const diffMs = target.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric });

  if (absDiffMs < JUST_NOW_THRESHOLD_MS) {
    return rtf.format(0, "second");
  }

  const threshold = THRESHOLDS.find((entry) => absDiffMs < entry.maxAbsMs) ?? THRESHOLDS[THRESHOLDS.length - 1]!;
  const value = Math.round(diffMs / threshold.divisor);
  return rtf.format(value, threshold.unit);
}
