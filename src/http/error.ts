import type { ValidationFieldError } from "../api/error";

/**
 * Classifies why an {@link HttpError} occurred, independent of the
 * transport that produced it. `"api"` means the server responded with a
 * non-2xx status (a normal application-level failure); the other kinds
 * mean the request never got a normal response at all.
 */
export const HttpErrorKinds = {
  Network: "network",
  Timeout: "timeout",
  Cancelled: "cancelled",
  Api: "api",
  Unknown: "unknown",
} as const satisfies Record<string, string>;

export type HttpErrorKind = (typeof HttpErrorKinds)[keyof typeof HttpErrorKinds];

export interface HttpErrorInit {
  kind: HttpErrorKind;
  message: string;
  /** HTTP status code, present only for {@link HttpErrorKinds.Api}. */
  status?: number;
  /** Backend error/message code, e.g. `ApiResponse.messageCode` — see `MessageCode` in `../api/error`. */
  code?: string;
  /** Raw `ApiResponse.details`, whatever shape the backend happened to send. */
  details?: unknown;
  /** Parsed per-field validation errors, when `details` matches that shape. See `ValidationFieldError`'s doc comment for the current backend-population caveat. */
  validationErrors?: ValidationFieldError[];
  requestId?: string;
  /** The underlying transport error (an Axios error internally), kept only for logging/debugging — not part of the stable public contract. */
  cause?: unknown;
}

/**
 * The single error type this package's HTTP client ever throws.
 * Normalizes every Axios failure mode (network error, timeout,
 * cancellation, non-2xx response, anything else) into one shape so
 * consumers never need to know Axios exists — see `client.ts`'s
 * `normalizeAxiosError`.
 */
export class HttpError extends Error {
  readonly kind: HttpErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly validationErrors?: ValidationFieldError[];
  readonly requestId?: string;

  constructor(init: HttpErrorInit) {
    super(init.message, init.cause !== undefined ? { cause: init.cause } : undefined);
    this.name = "HttpError";
    this.kind = init.kind;
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.validationErrors = init.validationErrors;
    this.requestId = init.requestId;
  }
}
