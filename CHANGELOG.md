# Changelog

All notable changes to this package will be documented in this file.

## [Unreleased]

Initial implementation of the framework-agnostic foundation layer. Not yet published.

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

### Notes

- Phone-number regex validation was intentionally **not** mirrored from the backend — the backend's canonical pattern is broken and its actual service-level rule is far more permissive than real validation. The existing `libphonenumber-js`-backed `phone` module remains authoritative.
- `AuditAction` was audited but intentionally **not** mirrored — its wire serialization format (string vs. numeric) could not be confirmed from the backend source. See the README's "Issues for backend cleanup" section.
- The User service's separate, dot-separated `PermissionCollection` business concept (e.g. `"product.product.read"`) was intentionally **not** mirrored — it's unrelated to and unenforced compared to the colon-separated `Permissions` catalog that actually backs the JWT `permission` claim and `RequirePermissions(...)` checks.
