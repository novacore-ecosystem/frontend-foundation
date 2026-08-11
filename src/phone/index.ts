import {
  isValidPhoneNumber as isValidPhoneNumberImpl,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

/**
 * Phone number utilities.
 *
 * ## Why a dependency here
 *
 * Correct international phone number validation/formatting is not a
 * regex-solvable problem — numbering plans, valid lengths, and area-code
 * rules differ per country and change over time. A hand-rolled "universal"
 * regex would silently accept invalid numbers and reject valid ones. This
 * module wraps `libphonenumber-js` (Google's `libphonenumber` ported to
 * JS, ~400KB metadata using the default/"min" build rather than the larger
 * `/max` variant) and does not re-export it — consumers only see the three
 * functions below, so the dependency can be swapped later without breaking
 * the public API.
 *
 * A region (ISO 3166-1 alpha-2 country code, e.g. `"VN"`, `"US"`) is
 * required for national-format input (`"0969123456"`); numbers already in
 * E.164 form (`"+84969123456"`) do not need one since the country is
 * encoded in the number itself.
 */

export type PhoneRegionCode = CountryCode;

/**
 * Formats a phone number for display.
 *
 * @param value the phone number, in E.164 or national format.
 * @param region ISO 3166-1 alpha-2 region code, required when `value` is not already in E.164 form.
 * @param style `"international"` (default, e.g. `"+84 969 123 456"`) or `"national"` (e.g. `"0969 123 456"`).
 * @returns the formatted number, or `null` if `value` could not be parsed.
 */
export function formatPhoneNumber(
  value: string,
  region?: PhoneRegionCode,
  style: "international" | "national" = "international",
): string | null {
  const phoneNumber = parsePhoneNumberFromString(value, region);
  if (!phoneNumber) return null;
  return style === "national" ? phoneNumber.formatNational() : phoneNumber.formatInternational();
}

/**
 * Normalizes a phone number to E.164 form (e.g. `"+84969123456"`).
 *
 * @param value the phone number, in E.164 or national format.
 * @param region ISO 3166-1 alpha-2 region code, required when `value` is not already in E.164 form.
 * @returns the E.164-formatted number, or `null` if `value` could not be parsed.
 */
export function normalizePhoneNumber(value: string, region?: PhoneRegionCode): string | null {
  const phoneNumber = parsePhoneNumberFromString(value, region);
  if (!phoneNumber) return null;
  return phoneNumber.number;
}

/**
 * Returns true if `value` is a valid phone number for the given (or
 * inferred, if E.164) region. Validity checks the numbering plan — number
 * length and prefix rules for that country — not just that it parses.
 */
export function isValidPhoneNumber(value: string, region?: PhoneRegionCode): boolean {
  return isValidPhoneNumberImpl(value, region);
}
