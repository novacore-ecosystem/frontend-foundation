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
- Public API surface exported from `src/index.ts`.
