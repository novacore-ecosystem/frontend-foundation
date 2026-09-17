import { endpoint } from "../http/endpoint";
import { HttpMethods } from "../http/types";
import type { TenantBootstrapResponse } from "./types";

/**
 * Typed `EndpointDefinition` for Auth's tenant bootstrap. Anonymous — resolved via the
 * `X-Tenant-Client-Key` header (configure it as a default header on your `HttpClient` instance,
 * same as `AuthEndpoints`'s module doc comment describes; not a request field here either).
 */
export const BootstrapEndpoints = {
  get: endpoint<void, TenantBootstrapResponse>({ method: HttpMethods.Get, path: "/bootstrap" }),
} as const;
