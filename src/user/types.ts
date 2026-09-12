/**
 * Request/response contracts for the current user's own profile —
 * identity/session infrastructure every NovaCore application needs
 * (view/edit "my profile", change/reset password), not business domain
 * data. See `../auth/types`'s doc comment for the same "why this belongs
 * in the foundation, not a business DTO" reasoning and the matching
 * "forward-looking, not yet backend-audited" caveat — with one
 * exception: `getEffectivePermissions` (`./endpoints`) reuses the
 * already backend-confirmed `CurrentUserAuthorization`/
 * `GET /profiles/current/detail` contract (`../authorization/types`)
 * rather than inventing a new shape for the same data.
 *
 * `UserProfile`'s fields deliberately mirror `@novacore/frontend-next-shadcn`'s
 * existing `UserProfileData` (`packages/shadcn/src/components/user-profile/types.ts`)
 * one-for-one, so `useUserProfile` (the React hook consuming this) needs
 * no mapping layer between what this endpoint returns and what
 * `UserProfilePage` already expects.
 */

/** A superset of fields a real Auth/User API may expose — every field but `id`/`displayName` is optional, matching `UserProfileData`'s own "only fill in what the backend actually returns" contract. */
export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  status?: string;
  tenantId?: string;
  tenantName?: string;
  roles?: string[];
}

/** One label/value pair of read-only profile metadata not covered by `UserProfile`'s fixed fields — same open-ended pattern as the Access Control module's `SubjectDetailField`, so an application only surfaces metadata its backend actually has. */
export interface UserDetailField {
  label: string;
  value: string;
}

/** `UserProfile` plus whatever additional read-only metadata the backend exposes for a given user id (e.g. viewed by an admin) — `fields` is omitted, not empty-arrayed, when there's nothing further to show. */
export interface UserDetail extends UserProfile {
  fields?: UserDetailField[];
}

export type UpdateProfileRequest = Partial<Pick<UserProfile, "displayName" | "email">>;

/** Changing your own password while authenticated — requires proving you hold the current one. Distinct from `ResetPasswordRequest`, which follows a forgot-password email link and has no current password to check. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** Completing a forgot-password flow: `token` is the opaque value from the emailed reset link (see `AuthEndpoints.forgotPassword`). */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
