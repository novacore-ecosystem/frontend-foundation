/**
 * The HTTP methods this client supports. Represented as string-literal
 * values (not a numeric enum) so a method flows straight through to the
 * transport layer without a separate wire-code mapping step.
 */
export const HttpMethods = {
  Get: "GET",
  Post: "POST",
  Put: "PUT",
  Patch: "PATCH",
  Delete: "DELETE",
  Head: "HEAD",
  Options: "OPTIONS",
} as const satisfies Record<string, string>;

export type HttpMethod = (typeof HttpMethods)[keyof typeof HttpMethods];

/** A single query-parameter value; arrays are serialized as repeated keys. */
export type HttpQueryValue = string | number | boolean | null | undefined | ReadonlyArray<string | number | boolean>;

/**
 * A single, transport-agnostic HTTP request. This is what flows through
 * {@link HttpInterceptor.onRequest} and what {@link HttpClient.request}
 * accepts — no Axios-specific fields exist on this type.
 */
export interface HttpRequest<TBody = unknown> {
  method: HttpMethod;
  /** Request path, relative to the client's configured `baseUrl`. */
  path: string;
  query?: Record<string, HttpQueryValue>;
  headers?: Record<string, string>;
  body?: TBody;
  /** Overrides the client's configured default timeout, in milliseconds. */
  timeout?: number;
  /** Standard platform cancellation primitive — never an Axios `CancelToken`. */
  signal?: AbortSignal;
}

/**
 * A single, transport-agnostic HTTP response. Deliberately does not
 * carry Axios-specific fields (`config`, `request`, `statusText`) — only
 * what a consumer genuinely needs.
 */
export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

/** Per-request overrides accepted by the convenience methods (`get`, `post`, ...) and `execute`. */
export interface HttpRequestOptions {
  query?: Record<string, HttpQueryValue>;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}
