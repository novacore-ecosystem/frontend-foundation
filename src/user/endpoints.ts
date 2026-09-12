import type { CurrentUserAuthorization } from "../authorization/types";
import { endpoint } from "../http/endpoint";
import { HttpMethods } from "../http/types";
import type {
  ChangePasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UserDetail,
  UserProfile,
} from "./types";

/**
 * Typed `EndpointDefinition`s for the current user's own profile. See
 * `./types`'s doc comment for the backend-audit status of each path —
 * `getEffectivePermissions` is the one confirmed entry here (mirrors
 * `GET /profiles/current/detail`, already cited by
 * `CurrentUserAuthorization`'s own doc comment); the rest are
 * forward-looking, reconcile against the real Profile/User service when
 * it's audited.
 */
export const UserEndpoints = {
  getMe: endpoint<void, UserProfile>({ method: HttpMethods.Get, path: "/profiles/current" }),
  getById: endpoint<{ id: string }, UserDetail>({ method: HttpMethods.Get, path: "/profiles/:id" }),
  /** Mirrors the backend-confirmed `GET /profiles/current/detail` — see `CurrentUserAuthorization`'s doc comment (`../authorization/types`). */
  getEffectivePermissions: endpoint<void, CurrentUserAuthorization>({
    method: HttpMethods.Get,
    path: "/profiles/current/detail",
  }),
  updateProfile: endpoint<UpdateProfileRequest, UserProfile>({ method: HttpMethods.Patch, path: "/profiles/current" }),
  changePassword: endpoint<ChangePasswordRequest, void>({
    method: HttpMethods.Post,
    path: "/profiles/current/change-password",
  }),
  resetPassword: endpoint<ResetPasswordRequest, void>({ method: HttpMethods.Post, path: "/auth/reset-password" }),
} as const;
