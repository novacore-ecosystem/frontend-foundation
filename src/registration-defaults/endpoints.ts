import { endpoint } from "../http/endpoint";
import { HttpMethods } from "../http/types";
import type {
  GetRegistrationDefaultsRequest,
  GetRegistrationDefaultsResponse,
  ReplaceRegistrationDefaultPermissionsRequest,
  ReplaceRegistrationDefaultRolesRequest,
} from "./types";

/**
 * Typed `EndpointDefinition`s for Registration Defaults — see `./types`'s module doc comment for
 * the full contract and backend audit citation. `appId` resolves the `:appId` route token; the
 * two `replace*` bodies are the remaining request field (`permissionKeys`/`roleIds`) once the
 * route param is extracted — see `resolveEndpointPath` (`../http/endpoint`).
 */
export const RegistrationDefaultsEndpoints = {
  get: endpoint<GetRegistrationDefaultsRequest, GetRegistrationDefaultsResponse>({
    method: HttpMethods.Get,
    path: "/auth/apps/:appId/registration-defaults",
  }),
  replacePermissions: endpoint<ReplaceRegistrationDefaultPermissionsRequest, void>({
    method: HttpMethods.Put,
    path: "/auth/apps/:appId/registration-defaults/permissions",
  }),
  replaceRoles: endpoint<ReplaceRegistrationDefaultRolesRequest, void>({
    method: HttpMethods.Put,
    path: "/auth/apps/:appId/registration-defaults/roles",
  }),
} as const;
