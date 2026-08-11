import type { TranslationKey } from "../../i18n/keys";
import type { Translator } from "../../i18n/types";
import { Permissions, type Permission } from "../permissions";

/**
 * The shape of a backend-provided, admin-editable permission display.
 * Mirrors `NovaCore.Auth.Domain.Entities.Permissions.PermissionDefinitionTranslation`
 * (backend repository-relative path:
 * `src/Services/Auth/Auth.Domain/Entities/Permissions/PermissionDefinitionTranslation.cs`;
 * search anchor: `PermissionDefinitionTranslation`) — `DisplayName`/`Description`,
 * one row per `(PermissionDefinition, LanguageCode)`.
 *
 * **This package does not ship static translations for individual
 * permission keys, and this type has no accompanying data file.** The
 * backend already owns this content dynamically and lets admins edit
 * it per language — duplicating all 43 `Permissions` keys × 3 locales
 * of static text here would fight that ownership, not complement it
 * (see `docs/i18n.md`'s "Permission translation" section for the full
 * rationale). This type exists purely as the contract a future
 * framework adapter/admin UI should expect when it fetches permission
 * display data from the Auth service itself.
 *
 * For a permission with no backend-provided translation yet (or when
 * building UI offline from just the `Permissions` keys), see
 * {@link getPermissionCategoryTranslationKey} for a foundation-owned
 * category-level fallback label instead of showing the raw identifier.
 */
export interface PermissionDisplayInfo {
  id: Permission;
  displayName: string;
  description?: string;
}

/**
 * Derives the translation key for a permission's **category-level**
 * fallback label (see each locale's `permissions.ts` under
 * `i18n/resources`) — not a per-permission display name (there isn't
 * one shipped here; see
 * {@link PermissionDisplayInfo}'s doc comment). `Permissions.Root` and
 * `Permissions.User` resolve to their own dedicated keys; every other
 * permission resolves to `"permissions.categories.<module>"`, derived
 * from the part of the key before the first `:` (e.g. `"order:view"`
 * -> `"permissions.categories.order"`). Every module prefix that
 * appears in `PERMISSION_VALUES` has a corresponding category key —
 * verified by a drift-detection test, not just assumed.
 */
export function getPermissionCategoryTranslationKey(permission: Permission | string): TranslationKey {
  if (permission === Permissions.Root) return "permissions.root";
  if (permission === Permissions.User) return "permissions.user";

  const separatorIndex = permission.indexOf(":");
  const module = separatorIndex > 0 ? permission.slice(0, separatorIndex) : permission;
  return `permissions.categories.${module}` as TranslationKey;
}

/**
 * Resolves a human-readable **category-level** label for a permission
 * using a caller-supplied {@link Translator} (so this stays agnostic of
 * which tenant/locale/dictionary setup produced it) — e.g. "Orders" for
 * any `order:*` permission. Intended as a safe, always-available
 * fallback for admin screens (permission lists, role/position
 * authorization matrices) before/unless a backend-provided per-
 * permission {@link PermissionDisplayInfo} is available — never show
 * the raw identifier (`"order:view"`) directly in such UI.
 */
export function translatePermissionCategory(permission: Permission | string, translate: Translator): string {
  return translate(getPermissionCategoryTranslationKey(permission));
}
