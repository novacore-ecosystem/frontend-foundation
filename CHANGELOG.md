# Changelog

All notable changes to this package will be documented in this file.

## [Unreleased]

Initial implementation of the framework-agnostic foundation layer. Not yet published.

### Added (2026-09-15 — Auth service email-confirmation/registration-defaults audit)

- `src/registration-defaults`: `RegistrationDefaultsEndpoints` (`get`/`replacePermissions`/`replaceRoles`) and types, mirroring the Auth service's new per-`(Tenant, App)` Default Role/Default Permission module (`Auth.API/Endpoints/Registrations/*.cs`). `Permissions.RegistrationDefaults` (`{ View, Manage }`) added to the permission catalog.
- `AuthEndpoints.confirmEmail` — the token-based email-verification completion endpoint (`POST /auth/confirm-email`).
- `MessageCode.EmailResendCooldown` ("206") and `MessageCode.VerificationCodeLocked` ("207"), with matching `ErrorDefinition`s and `errors.auth.*` translations in all three locales.

### Fixed (2026-09-15 — same audit)

- **Breaking**: `AuthSession` no longer assumes a bearer `accessToken` — the real Auth service issues no token in any response body (HTTP-only cookies only). It's now `{ user: UserProfile }`, populated by fetching the current user right after login/refresh. `AuthEndpoints.login/logout/refreshToken/register`'s request/response shapes were all reconciled against the real backend (see `src/auth/types.ts`'s module doc comment); `register`'s response is now `void` (no id/email, no tokens).
- `UserEndpoints.changePassword`/`resetPassword` pointed at the wrong paths (`/profiles/current/change-password`, `/auth/reset-password` — colliding with each other's actual real paths). Fixed to `/auth/reset-password` (authenticated, current-password based) and `/auth/reset-password/complete` (anonymous, token based) respectively.
- `HttpClient.execute()` returned the raw `ApiResponse<T>` envelope instead of unwrapping it, silently breaking every one of its consumers (`useAuth`/`useUserProfile`/`useNotifications` in `@novacore/frontend-next-shadcn`) against a real backend. Now unwraps via `isErrorResponse`, throwing `HttpError` on `success: false` even on an HTTP 200 — see `docs/backend-contract-sync.md`'s "Known gaps" for the full writeup.

### Added

- Tenant bootstrap contract (`TenantBootstrap` and related types) plus `createTranslatorFromBootstrap` and `isFeatureEnabled` helpers.
- Translation resolution (`createTranslator`) with tenant → application → fallback → key resolution order, `{{placeholder}}` interpolation, nested/dotted key lookup, and configurable missing-key behavior.
- Date/time utilities: manipulation (`addDays`/`addWeeks`/`addMonths`/`addYears`, `subtract*`, `startOfDay`/`endOfDay`), comparison (`isBefore`/`isAfter`/`isSameDay`/`isSameMonth`/`isSameYear`), formatting (`formatDate`/`formatDateTime`), relative time (`relativeTime`), and explicit-timezone input parsing (`parseDateInput`).
- Number utilities: `formatNumber`, `formatDecimal`, `formatPercent`.
- Currency utilities: `formatCurrency`.
- Phone utilities: `formatPhoneNumber`, `normalizePhoneNumber`, `isValidPhoneNumber` (backed by `libphonenumber-js`).
- String utilities: `capitalize`, `camelCase`, `pascalCase`, `kebabCase`, `snakeCase`, `truncate`, `isBlank`, `isNullOrEmpty`, `toStringSafe`, `normalizeString`, `slugify`.
- Platform contracts mirroring the backend's shared Building Blocks (audited directly from `BackEnd/src/BuildingBlocks`):
  - `ApiResponse<T>` response envelope with `isSuccessResponse`/`isErrorResponse` guards.
  - `PaginatedResult<T>`, `CursorPaginatedResult<T>`, and `PAGINATION_DEFAULTS`.
  - Search criteria contract: `CriteriaRequest`, `CriteriaFilter`, `CriteriaSort`, `CriteriaOperators`, `SortDirections`, and `buildCriteriaRequest`/`criteriaFilter`/`criteriaSort` builders — matching the backend's JSON-body search protocol exactly (no invented URL query DSL, since the backend has none).
  - `MessageCode` — the backend's full cross-service error/status code contract — and `ValidationFieldError`.
  - Backend-mirrored validation patterns/validators: `EMAIL_REGEX`/`isEmail`, `SLUG_REGEX`/`isSlug`, `SKU_REGEX`/`isSku`, `BARCODE_REGEX`/`isBarcode`.
  - Permission/authorization contracts: `Permissions` (verbatim mirror of the backend's full permission-key catalog), `PERMISSION_VALUES`, `isKnownPermission`, `hasPermission`/`hasAnyPermission`/`hasAllPermissions` (mirroring the backend's `PermissionAuthorization.HasAnyPermission` evaluation rule — Root bypass + `{module}:full` aggregate resolution), and `CurrentUserAuthorization` (mirrors the User service's "current user" roles/permissions response shape).
- Public API surface exported from `src/index.ts`.
- `docs/backend-contract-sync.md`: a contract-by-contract map of every platform contract's frontend location, backend location, search anchors, and change-frequency classification (Stable/Moderate/High-frequency), plus the synchronization workflow to follow when the backend changes.
- Full shared internationalization architecture:
  - Locale standard (`src/i18n/locale`): `Locale` (`"en" | "vi" | "zh-CN"`), `SUPPORTED_LOCALES`, `DEFAULT_LOCALE`, `LOCALE_METADATA`/`getLocaleMetadata`/`getSupportedLocales`, and `normalizeLocale`/`resolveLocale`/`isSupportedLocale` as the single normalization boundary from arbitrary locale strings.
  - Locale fallback (`createTranslator`'s new opt-in `fallbackLocale` option, additive/backward-compatible) and translation resources (`src/i18n/resources`): shipped English/Vietnamese/Simplified-Chinese dictionaries for `common`, `navigation`, `admin`, `auth`, `validation`, `errors`, and `permissions` namespaces, exposed as `TRANSLATION_RESOURCES`, `en`, `vi`, `zhCN` — every non-English locale is `satisfies typeof en`-checked at compile time for completeness.
  - `TranslationKey` (`src/i18n/keys`): a plain recursive TypeScript type (no code generation) giving autocomplete/typo-catching against this package's own resource keys.
  - `resolveTenantLocale` (`src/bootstrap`): the normalization boundary for `TenantBootstrap.locale`, now used automatically by `createTranslatorFromBootstrap` (which also defaults `fallbackLocale` to `DEFAULT_LOCALE`).
  - `src/errors`: `ERROR_DEFINITIONS`/`getErrorDefinition`/`getErrorMessageKey` mapping a representative `MessageCode` subset to translation keys, and `translateError` resolving a backend error response to a human-readable, locale-aware message with a deterministic, never-raw-in-production fallback chain.
  - `src/authorization/translation`: `getPermissionCategoryTranslationKey`/`translatePermissionCategory` for human-readable permission category labels, and the `PermissionDisplayInfo` type contract for future backend-driven per-permission display data.
- `docs/i18n.md`: the full internationalization architecture — locale standard, translation resolution/fallback, resource organization and domain ownership boundaries, error-code and permission translation, framework adapter expectations, and step-by-step guides for adding a locale or a translation key.

### Notes

- Phone-number regex validation was intentionally **not** mirrored from the backend — the backend's canonical pattern is broken and its actual service-level rule is far more permissive than real validation. The existing `libphonenumber-js`-backed `phone` module remains authoritative.
- `AuditAction` was audited but intentionally **not** mirrored — its wire serialization format (string vs. numeric) could not be confirmed from the backend source. See the README's "Issues for backend cleanup" section.
- The User service's separate, dot-separated `PermissionCollection` business concept (e.g. `"product.product.read"`) was intentionally **not** mirrored — it's unrelated to and unenforced compared to the colon-separated `Permissions` catalog that actually backs the JWT `permission` claim and `RequirePermissions(...)` checks.
- The backend's supported-language list (`LanguageCodeConstant.SupportedLanguages`) is `en`/`vi` only, while this package supports `en`/`vi`/`zh-CN` per explicit product requirement — this only affects backend-owned dynamic content (permission display-name translations), not this package's own static resources. See `docs/i18n.md` and `docs/backend-contract-sync.md`.
- Individual permission display names/descriptions were intentionally **not** mirrored as static translations — the backend already owns that content dynamically and admin-editable (`PermissionDefinitionTranslation`/`PermissionGroupTranslation`); duplicating it here would fight, not complement, that ownership.
- Only a representative subset (~20 of ~90) of `MessageCode` values have shipped translations — the rest fall back gracefully through `translateError`'s chain rather than being exhaustively translated, per this package's domain-boundary principle (cross-system terminology only, not every domain's every message).
