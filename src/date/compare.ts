import { parseDateInput } from "./parse";
import type { DateInput } from "./types";

/** Returns true if `a` is chronologically before `b`. */
export function isBefore(a: DateInput, b: DateInput): boolean {
  return parseDateInput(a).getTime() < parseDateInput(b).getTime();
}

/** Returns true if `a` is chronologically after `b`. */
export function isAfter(a: DateInput, b: DateInput): boolean {
  return parseDateInput(a).getTime() > parseDateInput(b).getTime();
}

/** Returns true if `a` and `b` fall on the same local calendar day. */
export function isSameDay(a: DateInput, b: DateInput): boolean {
  const dateA = parseDateInput(a);
  const dateB = parseDateInput(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

/** Returns true if `a` and `b` fall in the same local calendar month and year. */
export function isSameMonth(a: DateInput, b: DateInput): boolean {
  const dateA = parseDateInput(a);
  const dateB = parseDateInput(b);
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth();
}

/** Returns true if `a` and `b` fall in the same local calendar year. */
export function isSameYear(a: DateInput, b: DateInput): boolean {
  return parseDateInput(a).getFullYear() === parseDateInput(b).getFullYear();
}
