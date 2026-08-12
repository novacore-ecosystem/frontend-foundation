import type { HttpMethod } from "./types";

/**
 * A typed HTTP call declared once and reused everywhere, so applications
 * stop hand-writing `axios.get(...)`/`AxiosRequestConfig` at every call
 * site. `TRequest`/`TResponse` are phantom (carried in the type system
 * only, via optional never-assigned fields) — the runtime object is just
 * `{ method, path }`.
 *
 * `path` may contain `:name` route params (e.g. `"/products/:id"`),
 * interpolated by {@link resolveEndpointPath} from matching keys on the
 * request object passed to `HttpClient.execute`.
 */
export interface EndpointDefinition<TRequest = void, TResponse = unknown> {
  readonly method: HttpMethod;
  readonly path: string;
  readonly __request?: TRequest;
  readonly __response?: TResponse;
}

/** Declares an {@link EndpointDefinition}. See the module doc comment for the route-param convention. */
export function endpoint<TRequest = void, TResponse = unknown>(config: {
  method: HttpMethod;
  path: string;
}): EndpointDefinition<TRequest, TResponse> {
  return { method: config.method, path: config.path };
}

/**
 * Substitutes `:name` tokens in `path` with matching keys from
 * `request`, and returns whatever's left over (used by
 * `HttpClient.execute` as the query params or body, depending on
 * method — see `client.ts`). Internal to this module; not part of the
 * public API.
 */
export function resolveEndpointPath(
  path: string,
  request: Record<string, unknown> | undefined,
): { path: string; remaining: Record<string, unknown> } {
  const remaining: Record<string, unknown> = { ...request };

  const resolvedPath = path.replace(/:([a-zA-Z0-9_]+)/g, (token, key: string) => {
    if (!(key in remaining)) return token;
    const value = remaining[key];
    delete remaining[key];
    return encodeURIComponent(String(value));
  });

  return { path: resolvedPath, remaining };
}
