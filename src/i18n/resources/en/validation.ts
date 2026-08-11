/**
 * Client-side form validation messages — for pairing with this
 * package's `validation` module (`isEmail`, `isSlug`, ...) when a form
 * needs to show *why* a field failed. Distinct from `errors.*`, which
 * translates backend `MessageCode` API error responses, not local form
 * validation.
 */
export const validation = {
  required: "This field is required",
  invalidEmail: "Enter a valid email address",
  invalidPhone: "Enter a valid phone number",
  tooShort: "This value is too short",
  tooLong: "This value is too long",
  invalidFormat: "This value is not in a valid format",
};
