import { BARCODE_REGEX, EMAIL_REGEX, SKU_REGEX, SLUG_REGEX } from "../patterns";

/** Tests a value against the shared, backend-mirrored {@link EMAIL_REGEX}. */
export function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

/** Tests a value against the shared, backend-mirrored {@link SLUG_REGEX}. */
export function isSlug(value: string): boolean {
  return SLUG_REGEX.test(value);
}

/** Tests a value against the shared, backend-mirrored {@link SKU_REGEX}. */
export function isSku(value: string): boolean {
  return SKU_REGEX.test(value);
}

/** Tests a value against the shared, backend-mirrored {@link BARCODE_REGEX}. */
export function isBarcode(value: string): boolean {
  return BARCODE_REGEX.test(value);
}
