/**
 * Mirrors `NovaCore.BuildingBlock.Domain.Enums.MessageCode`
 * (`BuildingBlock.Domain/Enums/MessageCode.cs`) — the single, deeply
 * cross-cutting error/status code enum used by `ApiResponse.MessageCode`
 * across every service. The backend enum is numeric internally, but the
 * value actually sent on the wire is the **string** code from each
 * member's `[MessageCode("code", "message")]` attribute (retrieved via
 * `MessageCodeAttribute.GetCode`), e.g. `"001"`, `"700"`, `"1000"` — so
 * this is mirrored as a string-literal `as const` object, matching what
 * `ApiResponse.messageCode` actually contains, not the C# enum's
 * underlying int.
 *
 * Numeric ranges are a backend naming convention, not a frontend
 * concern, but are preserved in the grouping/comments below for easy
 * cross-referencing against `MessageCode.cs`: System 001-099, Validation
 * 100-199, General Client Errors 200-299, AuthN/AuthZ 300-399, Product
 * 400-499, Inventory 500-599, Order 600-699, User 700-799, Payment
 * 800-899, Shipping 900-999, Promotion 1000-1099.
 *
 * Deliberately named `MessageCode` (not `ErrorCode`) to match the
 * backend type exactly — this enum also covers success codes (`Success`,
 * `Created`, `Accepted`, ...), not just errors.
 *
 * Do not rely on the default English message text associated with each
 * code for user-facing UI — resolve user-facing copy through the `i18n`
 * module (`createTranslator`) keyed by the code instead, since the
 * backend may pass a different, request-specific `message` string than
 * a code's documented default.
 */
export const MessageCode = {
  // System (001-099)
  Success: "001",
  Created: "002",
  Updated: "003",
  Deleted: "004",
  Ok: "005",
  Accepted: "006",
  NoContent: "007",
  SystemError: "008",
  ServiceUnavailable: "009",
  DatabaseError: "010",
  ExternalServiceError: "011",
  InternalServerError: "012",
  OperationTimeout: "013",

  // Validation (100-199)
  ValidationFailed: "100",
  InvalidInput: "101",
  RequiredFieldMissing: "102",
  InvalidFormat: "103",
  InvalidLength: "104",
  InvalidRange: "105",
  DuplicateEntry: "106",

  // General client errors (200-299)
  BadRequest: "200",
  NotFound: "201",
  Conflict: "202",
  UnprocessableEntity: "203",
  TooManyRequests: "204",
  RequestTimeout: "205",

  // Authentication & authorization (300-399)
  InvalidCredentials: "300",
  TokenExpired: "301",
  InvalidToken: "302",
  InsufficientPermissions: "303",
  Unauthorized: "304",
  Forbidden: "305",
  AccountLocked: "306",
  AccountDisabled: "307",
  SessionExpired: "308",

  // Product service (400-499)
  ProductNotFound: "400",
  ProductAlreadyExists: "401",
  InvalidProductData: "402",
  ProductOutOfStock: "403",
  InvalidPrice: "404",
  ProductCategoryNotFound: "405",
  InvalidProductCategory: "406",
  ProductImageUploadFailed: "407",
  InvalidSKU: "408",

  // Inventory service (500-599)
  InsufficientStock: "500",
  InvalidQuantity: "502",
  WarehouseNotFound: "504",
  LocationNotFound: "505",
  StockAdjustmentFailed: "506",

  // Order service (600-699)
  OrderNotFound: "600",
  InvalidOrderStatus: "601",
  OrderAlreadyCancelled: "602",
  InvalidPaymentMethod: "603",
  OrderCannotBeModified: "604",
  ShippingAddressRequired: "605",
  InvalidOrderItems: "606",

  // User service (700-799)
  UserNotFound: "700",
  UserAlreadyExists: "701",
  InvalidEmailFormat: "702",
  WeakPassword: "703",
  EmailNotVerified: "704",
  EmailAlreadyVerified: "705",
  VerificationTokenExpired: "706",
  InvalidPhoneNumber: "707",
  UserRegistrationFailed: "708",

  // Payment service (800-899)
  PaymentFailed: "800",
  PaymentGatewayError: "801",
  InsufficientFunds: "802",
  PaymentMethodNotSupported: "803",
  TransactionDeclined: "804",
  RefundFailed: "805",
  InvalidCouponCode: "806",

  // Shipping service (900-999)
  ShipmentNotFound: "900",
  InvalidShipmentStatus: "901",
  ShipmentAlreadyCancelled: "902",
  ShipmentManifestLocked: "903",
  TransportationNotFound: "904",
  InvalidTransportationStatus: "905",
  TransportationAlreadyAssigned: "906",
  ShippingProviderNotFound: "907",
  ShippingProviderInactive: "908",
  InvalidShippingAddress: "909",
  TransportationCostRuleNotFound: "910",
  PickupNotFound: "911",
  DeliveryNotFound: "912",
  ReturnShipmentNotFound: "913",
  CarrierIntegrationNotFound: "914",
  CarrierIntegrationNotConfigured: "915",

  // Promotion service (1000-1099)
  CouponDisabled: "1000",
  CouponNotActive: "1001",
  CouponUsageLimitReached: "1002",
} as const satisfies Record<string, string>;

/** A valid `MessageCode` string value, e.g. `"001"` or `"700"`. */
export type MessageCode = (typeof MessageCode)[keyof typeof MessageCode];
