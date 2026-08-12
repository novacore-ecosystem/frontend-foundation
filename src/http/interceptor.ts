import type { HttpError } from "./error";
import type { HttpRequest, HttpResponse } from "./types";

/**
 * A NovaCore-level interception point (`request -> interceptors ->
 * Axios transport -> interceptors -> consumer`). Every hook receives
 * and returns only NovaCore types — Axios's own interceptor API is
 * never exposed. All hooks are optional and run in registration order.
 */
export interface HttpInterceptor {
  /** Runs before the request is sent; return a (possibly modified) request. */
  onRequest?(request: HttpRequest): HttpRequest | Promise<HttpRequest>;
  /** Runs after a successful response; return a (possibly modified) response. */
  onResponse?(response: HttpResponse): HttpResponse | Promise<HttpResponse>;
  /** Runs after a request fails and has already been normalized into an {@link HttpError}; return a (possibly modified) error. */
  onError?(error: HttpError): HttpError | Promise<HttpError>;
}
