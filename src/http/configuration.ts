import type { HttpError } from "./error";
import type { HttpInterceptor } from "./interceptor";
import type { HttpMethod } from "./types";
import type { TokenProvider } from "./token-provider";

export const DEFAULT_HTTP_TIMEOUT_MS = 30_000;

/**
 * Retry configuration for transient failures. Off by default
 * (`enabled` defaults to falsy) — the client never silently retries
 * unless a consumer opts in, since retrying an unsafe mutation
 * (`POST`/`PUT`/`PATCH`) without care can duplicate side effects.
 */
export interface RetryOptions {
  enabled?: boolean;
  /** Total attempts including the first, e.g. `3` = 1 try + 2 retries. Defaults to {@link DEFAULT_RETRY_ATTEMPTS}. */
  attempts?: number;
  /** Fixed delay, or a function of the zero-based attempt number, in milliseconds. Defaults to exponential backoff capped at 10s. */
  delayMs?: number | ((attempt: number) => number);
  /** Methods eligible for retry. Defaults to {@link DEFAULT_RETRYABLE_METHODS} — safe, idempotent methods only. */
  methods?: readonly HttpMethod[];
  /** Overrides the default retryable-error check (network/timeout errors and 5xx responses). */
  shouldRetry?: (error: HttpError, attempt: number) => boolean;
}

export const DEFAULT_RETRY_ATTEMPTS = 3;

export const DEFAULT_RETRYABLE_METHODS: readonly HttpMethod[] = ["GET", "HEAD", "OPTIONS"];

/** Global configuration for a single {@link HttpClient} instance. */
export interface HttpClientOptions {
  baseUrl?: string;
  /** Default request timeout in milliseconds. Defaults to {@link DEFAULT_HTTP_TIMEOUT_MS}. */
  timeout?: number;
  headers?: Record<string, string>;
  /** Sends cookies/credentials on cross-origin requests. */
  withCredentials?: boolean;
  /** Supplies the `Authorization: Bearer <token>` header, and handles 401 recovery via `refreshAccessToken`. */
  tokenProvider?: TokenProvider;
  retry?: RetryOptions;
  interceptors?: HttpInterceptor[];
}
