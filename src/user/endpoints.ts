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
 * Typed `EndpointDefinition`s for the current user's own profile. `getEffectivePermissions`
 * mirrors the backend-confirmed `GET /profiles/current/detail` (see `CurrentUserAuthorization`'s
 * doc comment, `../authorization/types`). `changePassword`/`resetPassword` are backend-confirmed
 * as of the 2026-09-15 Auth-service audit (`../auth/types`'s module doc comment) — both actually
 * live under the Auth service's own `/auth` prefix, not `/profiles/current/*` as originally
 * (incorrectly) guessed: `changePassword` is `Auth.API`'s authenticated `POST /reset-password`
 * (`ResetPasswordRequest(CurrentPassword, NewPassword)`, revokes every other session on success),
 * `resetPassword` is the anonymous token-based `POST /reset-password/complete`
 * (`ResetPasswordWithTokenRequest(Token, NewPassword)`, completes `AuthEndpoints.forgotPassword`'s
 * emailed link). `getMe`/`getById`/`updateProfile` remain forward-looking — reconcile against the
 * real Profile/User service when audited.
 */
export const UserEndpoints = {
  /** Backend-confirmed: `User.API`'s `GET /profiles/current/detail` (`GetUserDetailResponse` — a superset of `UserProfile`: `id`/`displayName`/`email`/`roles` line up). There is no plain `GET /profiles/current`. */
  getMe: endpoint<void, UserProfile>({ method: HttpMethods.Get, path: "user/profiles/current/detail" }),
  getById: endpoint<{ id: string }, UserDetail>({ method: HttpMethods.Get, path: "user/profiles/:id" }),
  /** Mirrors the backend-confirmed `GET /profiles/current/detail` — see `CurrentUserAuthorization`'s doc comment (`../authorization/types`). */
  getEffectivePermissions: endpoint<void, CurrentUserAuthorization>({
    method: HttpMethods.Get,
    path: "user/profiles/current/detail",
  }),
  updateProfile: endpoint<UpdateProfileRequest, UserProfile>({ method: HttpMethods.Patch, path: "user/profiles/current" }),
  /** Requires the current password; revokes every other active session on success (`Auth.API`'s `POST /reset-password`). */
  changePassword: endpoint<ChangePasswordRequest, void>({
    method: HttpMethods.Post,
    path: "/auth/reset-password",
  }),
  /** Completes a `AuthEndpoints.forgotPassword` email link via its single-use token (`Auth.API`'s `POST /reset-password/complete`). */
  resetPassword: endpoint<ResetPasswordRequest, void>({ method: HttpMethods.Post, path: "/auth/reset-password/complete" }),
} as const;
