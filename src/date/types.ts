/**
 * Accepted input for all date utilities in this module:
 * - `Date` — used as-is (cloned internally, never mutated).
 * - `number` — a Unix timestamp in milliseconds (`Date.now()` style).
 * - `string` — see {@link parseDateInput} for exact parsing rules.
 */
export type DateInput = Date | string | number;
