/**
 * Framework-agnostic typed HTTP client. Axios is this module's internal
 * transport (see `client.ts`) — it is never exposed here or anywhere
 * else in this package's public API. Import from
 * `@novacore/frontend-foundation/http` (or the package root) without
 * installing Axios yourself.
 */
export { HttpMethods } from "./types";
export type { HttpMethod, HttpQueryValue, HttpRequest, HttpRequestOptions, HttpResponse } from "./types";
export { HttpError, HttpErrorKinds } from "./error";
export type { HttpErrorInit, HttpErrorKind } from "./error";
export type { HttpInterceptor } from "./interceptor";
export {
  DEFAULT_HTTP_TIMEOUT_MS,
  DEFAULT_RETRY_ATTEMPTS,
  DEFAULT_RETRYABLE_METHODS,
} from "./configuration";
export type { HttpClientOptions, RetryOptions } from "./configuration";
export { endpoint } from "./endpoint";
export type { EndpointDefinition } from "./endpoint";
export { createHttpClient, HttpClient } from "./client";
export type { TokenProvider } from "./token-provider";
