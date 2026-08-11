import { MessageCode } from "../codes";
import type { TranslationKey } from "../../i18n/keys";

/**
 * Maps a backend `MessageCode` to the translation key that resolves its
 * human-readable message, plus a locale-independent `defaultMessage`
 * used as the final fallback if no translation resolves at all (see
 * `../translation`'s doc comment for the full fallback chain).
 */
export interface ErrorDefinition {
  code: MessageCode;
  messageKey: TranslationKey;
  defaultMessage: string;
}

/**
 * A **representative subset** of `MessageCode` -> translation key
 * mappings — not exhaustive. See `i18n/resources/en/errors.ts`'s doc
 * comment for exactly which codes are covered and why the rest
 * deliberately aren't. Every entry here has a matching key in
 * `i18n/resources/{en,vi,zh-CN}/errors.ts`.
 */
export const ERROR_DEFINITIONS: readonly ErrorDefinition[] = [
  { code: MessageCode.SystemError, messageKey: "errors.system.error", defaultMessage: "Something went wrong. Please try again." },
  { code: MessageCode.ValidationFailed, messageKey: "errors.validation.failed", defaultMessage: "Validation failed" },
  { code: MessageCode.InvalidInput, messageKey: "errors.validation.invalidInput", defaultMessage: "Invalid input" },
  { code: MessageCode.RequiredFieldMissing, messageKey: "errors.validation.requiredField", defaultMessage: "Required field is missing" },
  { code: MessageCode.InvalidFormat, messageKey: "errors.validation.invalidFormat", defaultMessage: "Invalid format" },
  { code: MessageCode.DuplicateEntry, messageKey: "errors.validation.duplicateEntry", defaultMessage: "This already exists" },
  { code: MessageCode.BadRequest, messageKey: "errors.client.badRequest", defaultMessage: "Bad request" },
  { code: MessageCode.NotFound, messageKey: "errors.client.notFound", defaultMessage: "Resource not found" },
  { code: MessageCode.Conflict, messageKey: "errors.client.conflict", defaultMessage: "This conflicts with existing data" },
  { code: MessageCode.TooManyRequests, messageKey: "errors.client.tooManyRequests", defaultMessage: "Too many requests — please try again later" },
  { code: MessageCode.InvalidCredentials, messageKey: "errors.auth.invalidCredentials", defaultMessage: "Invalid credentials" },
  { code: MessageCode.TokenExpired, messageKey: "errors.auth.tokenExpired", defaultMessage: "Your session has expired" },
  { code: MessageCode.Unauthorized, messageKey: "errors.auth.unauthorized", defaultMessage: "You are not authorized to perform this action" },
  { code: MessageCode.Forbidden, messageKey: "errors.auth.forbidden", defaultMessage: "Access is forbidden" },
  { code: MessageCode.SessionExpired, messageKey: "errors.auth.sessionExpired", defaultMessage: "Your session has expired. Please log in again." },
  { code: MessageCode.UserNotFound, messageKey: "errors.user.notFound", defaultMessage: "User not found" },
  { code: MessageCode.ProductNotFound, messageKey: "errors.product.notFound", defaultMessage: "Product not found" },
  { code: MessageCode.OrderNotFound, messageKey: "errors.order.notFound", defaultMessage: "Order not found" },
  { code: MessageCode.InsufficientStock, messageKey: "errors.inventory.insufficientStock", defaultMessage: "Insufficient stock available" },
  { code: MessageCode.PaymentFailed, messageKey: "errors.payment.failed", defaultMessage: "Payment failed" },
  { code: MessageCode.ShipmentNotFound, messageKey: "errors.shipping.notFound", defaultMessage: "Shipment not found" },
];

const ERROR_DEFINITION_BY_CODE: ReadonlyMap<string, ErrorDefinition> = new Map(
  ERROR_DEFINITIONS.map((definition) => [definition.code, definition]),
);

/** Looks up the {@link ErrorDefinition} for a `MessageCode` string value, or `undefined` if it's not one of the representative subset covered here. */
export function getErrorDefinition(code: string): ErrorDefinition | undefined {
  return ERROR_DEFINITION_BY_CODE.get(code);
}

/** Convenience accessor for just the translation key half of {@link getErrorDefinition}. */
export function getErrorMessageKey(code: string): TranslationKey | undefined {
  return getErrorDefinition(code)?.messageKey;
}
