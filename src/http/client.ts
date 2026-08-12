import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { ApiResponse } from "../api/response";
import type { ValidationFieldError } from "../api/error";
import {
  DEFAULT_HTTP_TIMEOUT_MS,
  DEFAULT_RETRY_ATTEMPTS,
  DEFAULT_RETRYABLE_METHODS,
  type HttpClientOptions,
  type RetryOptions,
} from "./configuration";
import { type EndpointDefinition, resolveEndpointPath } from "./endpoint";
import { HttpError, HttpErrorKinds } from "./error";
import type { HttpInterceptor } from "./interceptor";
import type { HttpMethod, HttpQueryValue, HttpRequest, HttpRequestOptions, HttpResponse } from "./types";
import { HttpMethods } from "./types";

const BODY_METHODS: ReadonlySet<HttpMethod> = new Set([HttpMethods.Post, HttpMethods.Put, HttpMethods.Patch]);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeHeaders(headers: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (!headers || typeof headers !== "object") return result;
  for (const [key, value] of Object.entries(headers as Record<string, unknown>)) {
    if (value !== undefined && value !== null) result[key.toLowerCase()] = String(value);
  }
  return result;
}

function extractRequestId(headers: unknown): string | undefined {
  const normalized = normalizeHeaders(headers);
  return normalized["x-request-id"] ?? normalized["x-correlation-id"];
}

/** Recognizes `ApiResponse.details` as a `ValidationFieldError[]` only when every element actually matches that shape — see that type's doc comment for why the backend rarely populates it today. */
function extractValidationErrors(details: unknown): ValidationFieldError[] | undefined {
  if (!Array.isArray(details)) return undefined;
  const isValidationErrorArray = details.every(
    (item) => item !== null && typeof item === "object" && "propertyName" in item && "errorMessage" in item,
  );
  return isValidationErrorArray ? (details as ValidationFieldError[]) : undefined;
}

/**
 * The single normalization boundary between Axios and this package's
 * public {@link HttpError} — the only place in the module allowed to
 * reference Axios error internals. See `HttpErrorKinds`' doc comment
 * for what each kind means.
 */
function normalizeAxiosError(error: unknown): HttpError {
  if (axios.isCancel(error)) {
    return new HttpError({ kind: HttpErrorKinds.Cancelled, message: "Request was cancelled", cause: error });
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<Partial<ApiResponse>>;

    if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
      return new HttpError({ kind: HttpErrorKinds.Timeout, message: "Request timed out", cause: axiosError });
    }

    if (!axiosError.response) {
      return new HttpError({
        kind: HttpErrorKinds.Network,
        message: axiosError.message || "Network error",
        cause: axiosError,
      });
    }

    const { status, data, headers } = axiosError.response;
    const body = data ?? {};

    return new HttpError({
      kind: HttpErrorKinds.Api,
      status,
      message: body.message ?? axiosError.message,
      code: body.messageCode ?? undefined,
      details: body.details,
      validationErrors: extractValidationErrors(body.details),
      requestId: extractRequestId(headers),
      cause: axiosError,
    });
  }

  return new HttpError({
    kind: HttpErrorKinds.Unknown,
    message: error instanceof Error ? error.message : "Unknown HTTP error",
    cause: error,
  });
}

function isRetryableMethod(method: HttpMethod, retry: RetryOptions): boolean {
  return (retry.methods ?? DEFAULT_RETRYABLE_METHODS).includes(method);
}

function isRetryableError(error: HttpError): boolean {
  return error.kind === HttpErrorKinds.Network || error.kind === HttpErrorKinds.Timeout || (error.status ?? 0) >= 500;
}

function computeRetryDelay(delayMs: RetryOptions["delayMs"], attempt: number): number {
  if (typeof delayMs === "function") return delayMs(attempt);
  if (typeof delayMs === "number") return delayMs;
  return Math.min(500 * 2 ** attempt, 10_000);
}

/**
 * Framework-agnostic HTTP client. Owns exactly one Axios instance per
 * `HttpClient` (never one per request — see `#21` in the phase spec)
 * and never leaks Axios types through its public surface; every method
 * returns/throws only `HttpResponse`/`HttpError`.
 */
export class HttpClient {
  private readonly transport: AxiosInstance;
  private readonly interceptors: HttpInterceptor[];

  constructor(private readonly config: HttpClientOptions = {}) {
    this.interceptors = config.interceptors ?? [];
    this.transport = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout ?? DEFAULT_HTTP_TIMEOUT_MS,
      headers: config.headers,
      withCredentials: config.withCredentials,
    });
  }

  /** Registers an interceptor and returns a function that removes it. */
  use(interceptor: HttpInterceptor): () => void {
    this.interceptors.push(interceptor);
    return () => {
      const index = this.interceptors.indexOf(interceptor);
      if (index >= 0) this.interceptors.splice(index, 1);
    };
  }

  /** The low-level entry point every convenience method and `execute` funnels through. */
  async request<T = unknown>(request: HttpRequest): Promise<HttpResponse<T>> {
    let resolvedRequest = request;
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) resolvedRequest = await interceptor.onRequest(resolvedRequest);
    }

    const retry = this.config.retry;
    const maxAttempts = retry?.enabled ? Math.max(1, retry.attempts ?? DEFAULT_RETRY_ATTEMPTS) : 1;
    let refreshedToken: string | null | undefined;
    let lastError: HttpError | undefined;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const axiosConfig = await this.toAxiosConfig(resolvedRequest, refreshedToken);

      try {
        const axiosResponse = await this.transport.request<T>(axiosConfig);
        let response: HttpResponse<T> = {
          data: axiosResponse.data,
          status: axiosResponse.status,
          headers: normalizeHeaders(axiosResponse.headers),
        };

        for (const interceptor of this.interceptors) {
          if (interceptor.onResponse) response = (await interceptor.onResponse(response)) as HttpResponse<T>;
        }

        return response;
      } catch (rawError) {
        let httpError = normalizeAxiosError(rawError);

        if (httpError.status === 401 && refreshedToken === undefined && this.config.tokenProvider?.refreshAccessToken) {
          refreshedToken = await this.config.tokenProvider.refreshAccessToken();
          if (refreshedToken) continue;
        }

        for (const interceptor of this.interceptors) {
          if (interceptor.onError) httpError = await interceptor.onError(httpError);
        }

        lastError = httpError;

        const canRetry =
          Boolean(retry?.enabled) &&
          attempt < maxAttempts - 1 &&
          isRetryableMethod(resolvedRequest.method, retry ?? {}) &&
          (retry?.shouldRetry ? retry.shouldRetry(httpError, attempt) : isRetryableError(httpError));

        if (!canRetry) throw httpError;

        await delay(computeRetryDelay(retry?.delayMs, attempt));
      }
    }

    throw lastError ?? new HttpError({ kind: HttpErrorKinds.Unknown, message: "Request failed" });
  }

  private async toAxiosConfig(request: HttpRequest, refreshedToken?: string | null): Promise<AxiosRequestConfig> {
    const headers: Record<string, string> = { ...request.headers };

    if (refreshedToken) {
      headers.Authorization = `Bearer ${refreshedToken}`;
    } else if (this.config.tokenProvider) {
      const token = await this.config.tokenProvider.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    return {
      url: request.path,
      method: request.method,
      params: request.query,
      headers,
      data: request.body,
      timeout: request.timeout ?? this.config.timeout ?? DEFAULT_HTTP_TIMEOUT_MS,
      signal: request.signal,
    };
  }

  get<T = unknown>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>({ method: HttpMethods.Get, path, ...options }).then((response) => response.data);
  }

  post<T = unknown, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>({ method: HttpMethods.Post, path, body, ...options }).then((response) => response.data);
  }

  put<T = unknown, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>({ method: HttpMethods.Put, path, body, ...options }).then((response) => response.data);
  }

  patch<T = unknown, TBody = unknown>(path: string, body?: TBody, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>({ method: HttpMethods.Patch, path, body, ...options }).then((response) => response.data);
  }

  delete<T = unknown>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>({ method: HttpMethods.Delete, path, ...options }).then((response) => response.data);
  }

  head<T = unknown>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>({ method: HttpMethods.Head, path, ...options }).then((response) => response.data);
  }

  options<T = unknown>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>({ method: HttpMethods.Options, path, ...options }).then((response) => response.data);
  }

  /** Executes an {@link EndpointDefinition}. Request keys matching `:name` tokens in the endpoint's path become route params; the rest become query params (`GET`/`HEAD`/`DELETE`/`OPTIONS`) or the JSON body (`POST`/`PUT`/`PATCH`). */
  async execute<TRequest = void, TResponse = unknown>(
    def: EndpointDefinition<TRequest, TResponse>,
    request?: TRequest,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    const { path, remaining } = resolveEndpointPath(def.path, request as Record<string, unknown> | undefined);
    const hasBody = BODY_METHODS.has(def.method);

    const response = await this.request<TResponse>({
      method: def.method,
      path,
      query: hasBody ? options?.query : { ...remaining, ...options?.query } as Record<string, HttpQueryValue>,
      body: hasBody ? remaining : undefined,
      headers: options?.headers,
      timeout: options?.timeout,
      signal: options?.signal,
    });

    return response.data;
  }
}

export function createHttpClient(options?: HttpClientOptions): HttpClient {
  return new HttpClient(options);
}
