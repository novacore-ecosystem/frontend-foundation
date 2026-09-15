/**
 * Human-readable messages for a **representative subset** of the
 * backend's `MessageCode` error catalog (`../../../api/error`) — not
 * exhaustive. Covers every non-success numeric range (System,
 * Validation, General Client, AuthN/AuthZ) in full, plus one
 * illustrative `notFound`-style code per business service (User,
 * Product, Order, Inventory, Payment, Shipping) to demonstrate the
 * pattern end to end.
 *
 * `auth.invalidToken`/`insufficientPermissions`/`accountLocked`/
 * `accountDisabled` were added alongside the new `src/auth`/`src/user`
 * endpoint definitions to actually complete the AuthN/AuthZ range this
 * comment already claimed — a login/refresh-token flow is exactly where
 * a caller hits these codes.
 *
 * The remaining ~70 domain-specific `MessageCode` values (e.g.
 * `ProductOutOfStock`, `CouponUsageLimitReached`) are intentionally NOT
 * translated here — per this package's domain boundary (see
 * `docs/i18n.md`), exhaustive per-domain error copy belongs to the
 * applications/domain packages that actually raise those errors, not
 * this foundation. `translateError` (`../../../errors`) gracefully
 * falls back to the backend-provided `message` string (then a generic
 * default) for any code without an entry here — see its own doc
 * comment for the exact fallback chain.
 */
export const errors = {
  system: {
    error: "Something went wrong. Please try again.",
  },
  validation: {
    failed: "Validation failed",
    invalidInput: "Invalid input",
    requiredField: "Required field is missing",
    invalidFormat: "Invalid format",
    duplicateEntry: "This already exists",
  },
  client: {
    badRequest: "Bad request",
    notFound: "Resource not found",
    conflict: "This conflicts with existing data",
    tooManyRequests: "Too many requests — please try again later",
  },
  auth: {
    invalidCredentials: "Invalid credentials",
    tokenExpired: "Your session has expired",
    invalidToken: "Your session is no longer valid. Please log in again.",
    insufficientPermissions: "You don't have permission to perform this action",
    unauthorized: "You are not authorized to perform this action",
    forbidden: "Access is forbidden",
    accountLocked: "This account has been locked. Please contact support.",
    accountDisabled: "This account has been disabled.",
    sessionExpired: "Your session has expired. Please log in again.",
    emailNotVerified: "Please confirm your email before logging in.",
    emailResendCooldown: "Please wait before requesting another email.",
    verificationCodeLocked: "Too many invalid attempts. Please try again later.",
  },
  user: {
    notFound: "User not found",
  },
  product: {
    notFound: "Product not found",
  },
  order: {
    notFound: "Order not found",
  },
  inventory: {
    insufficientStock: "Insufficient stock available",
  },
  payment: {
    failed: "Payment failed",
  },
  shipping: {
    notFound: "Shipment not found",
  },
  generic: {
    fallback: "An unexpected error occurred",
  },
};
