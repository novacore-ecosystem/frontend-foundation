# @novacore/frontend-foundation

Framework-agnostic foundation layer for NovaCore frontend applications (OMS, CMS, CS, MP, and future apps).

## What this is

A small set of framework-independent contracts, algorithms, and utilities that any frontend technology can consume, in two categories:

**Runtime utilities**
- Tenant bootstrap contract
- Translation (i18n) resolution
- Date/time utilities
- Number and currency formatting
- Phone number utilities
- String utilities

**Platform contracts** — TypeScript mirrors of the backend's shared Building Blocks, so every frontend app shares one typed representation instead of redefining the same response envelope, pagination shape, search request, error codes, and validation patterns:
- API response envelope (`ApiResponse<T>`)
- Pagination (`PaginatedResult<T>`, `CursorPaginatedResult<T>`)
- Search criteria (`CriteriaRequest`, filters, sorts, operators)
- Error/message codes (`MessageCode`) and validation error shape
- Backend-mirrored validation regex patterns (email, slug, SKU, barcode)

## What this is NOT

- **Not a UI library.** No components, no styling, no design system.
- **Not React, Vue, Angular, or Razor code.** No hooks, no composables, no services, no context/providers.
- **Not an i18n framework.** It provides the resolution *logic*; wiring it into a specific framework's state/reactivity model is the job of a future adapter package.
- **Not an API SDK.** It does not wrap `fetch`/`axios`, does not know your services' base URLs, and does not contain a generic HTTP client. It only provides the typed shapes and (de)serialization helpers for the parts of the wire contract that are genuinely shared across every backend service.
- **Not a place for domain DTOs.** `UserDto`, `OrderDto`, `ProductDto`, `InventoryDto`, `PaymentDto`, `ShipmentDto`, and their domain-specific status enums (`OrderStatus`, `PaymentStatus`, ...) do not belong here — only cross-system contracts used by *every* service belong in this package. Domain DTOs belong to their own domain packages or a future generated API client.
- **Not published yet.** This is an internal/private package (`"private": true` in `package.json`).

## Architecture role

This package is the lowest shared layer in the NovaCore frontend ecosystem, and is itself the frontend-side mirror of the backend's shared Building Blocks:

```text
        Backend Building Blocks (source of truth)
                           |
                     Audit / mirror
                           v
                    Framework Agnostic
                  @novacore/frontend-foundation
              (runtime utilities + platform contracts)
                           |
        +------------------+------------------+
        |                  |                  |
      React               Vue              Angular
   (frontend-react)  (frontend-vue)  (frontend-angular)
        |                  |                  |
      React UI          Vue UI           Angular UI
        |
    Next.js apps
                           |
                           v
                     Applications
                  (OMS, CMS, CS, MP, ...)
```

Future packages such as `@novacore/frontend-react`, `@novacore/frontend-vue`, and `@novacore/frontend-angular` will depend on this package — never the other way around. This package must never depend on a UI framework, and this package's platform contracts must never depend on a framework adapter.

## Installation

```bash
pnpm add @novacore/frontend-foundation
```

## Basic usage

```ts
import {
  formatDate,
  formatCurrency,
  relativeTime,
  formatPhoneNumber,
  createTranslator,
} from "@novacore/frontend-foundation";

formatDate("2026-08-11", { locale: "en-US" }); // "Aug 11, 2026"
formatCurrency(100000, "VND", { locale: "vi-VN" }); // "100.000 ₫"
relativeTime(new Date(Date.now() - 5 * 60_000)); // "5 minutes ago"
formatPhoneNumber("+84969123456"); // "+84 969 123 456"

const translate = createTranslator(
  { application: { en: { "welcome.message": "Hello, {{name}}" } } },
  { locale: "en" },
);
translate("welcome.message", { name: "Tan" }); // "Hello, Tan"
```

## Modules

### Tenant bootstrap (`src/bootstrap`)

`TenantBootstrap` is a generic, extensible contract for the data a frontend app typically needs to initialize for a tenant/session: `tenant`, `locale`, `timezone`, `translations`, `theme`, `settings`, `features`, `metadata`. It intentionally does not model business-specific tenant data — applications extend it themselves for anything beyond this generic shape.

There is no React context, Vue composable, or Angular service here by design; those belong in framework adapter packages. `createTranslatorFromBootstrap(bootstrap)` and `isFeatureEnabled(features, key)` are provided as small, framework-agnostic conveniences on top of the contract.

### Translation resolution (`src/i18n`)

`createTranslator(sources, options)` returns a bound `translate(key, values?, callOptions?)` function. Resolution order per call:

```text
tenant override → application dictionary → fallback dictionary → the key itself
```

- Dictionaries are keyed by locale (`TranslationBundle`) and support both flat dotted keys (`"welcome.message"`) and nested objects (`{ welcome: { message: "..." } }`) transparently.
- Interpolation syntax is `{{name}}` (configurable delimiters via `options.interpolation`). Placeholders with no matching value are left untouched rather than silently emptied, so missing data stays visible.
- Missing keys return the key itself by default (`onMissingKey: "key"`); `"empty"`, a custom function, or `strict: true` (throws `TranslationMissingError`) are also supported.
- Locale can be overridden per call via the third argument.

### Date/time (`src/date`)

Organized around manipulation (`addDays`/`addWeeks`/`addMonths`/`addYears` and their `subtract*` counterparts, `startOfDay`/`endOfDay`), comparison (`isBefore`/`isAfter`/`isSameDay`/`isSameMonth`/`isSameYear`), formatting (`formatDate`/`formatDateTime`, via `Intl.DateTimeFormat`), and relative time (`relativeTime`, via `Intl.RelativeTimeFormat`).

**Timezone assumptions (read before using):** `Date` has no inherent timezone — it stores a UTC instant. `parseDateInput` (used internally by every function here) treats:

- `Date` / numeric timestamp — passed through unambiguously.
- Full ISO strings with a time + offset/`Z` (e.g. `"2026-08-11T00:00:00Z"`) — parsed unambiguously via native `Date` parsing.
- Date-only strings (`"2026-08-11"` or `"2026/08/11"`) — **deliberately interpreted as local midnight**, not UTC midnight. This is an intentional deviation from native `Date`, which treats bare `"YYYY-MM-DD"` as UTC and is a well-known source of off-by-one-day bugs. If you need UTC midnight from a date-only string, append `T00:00:00Z` yourself.

All manipulation/comparison functions operate on the local wall clock (`getDate`/`setMonth`/etc.). Month/year arithmetic clamps day-of-month overflow (e.g. Jan 31 + 1 month → Feb 28/29, not Mar 3).

`relativeTime` unit-selection thresholds (documented in `src/date/relative.ts`): "just now" below 10s, then seconds/minutes/hours/days/weeks/months/years as the difference grows. Wording comes entirely from `Intl.RelativeTimeFormat`, so it's locale-correct, not hard-coded English.

### Number (`src/number`)

`formatNumber`, `formatDecimal`, `formatPercent` — thin, documented wrappers around `Intl.NumberFormat`. `formatPercent` takes a fraction (`0.5` → `"50%"`), matching `Intl`'s own `style: "percent"` semantics.

### Currency (`src/currency`)

`formatCurrency(value, currencyCode, options)` wraps `Intl.NumberFormat({ style: "currency" })`. Currency symbols, digit grouping, and default fraction-digit counts (VND: 0, USD/EUR: 2) all come from `Intl`'s CLDR data — none are hard-coded in this package.

### Phone (`src/phone`)

`formatPhoneNumber`, `normalizePhoneNumber`, `isValidPhoneNumber` all take an optional ISO 3166-1 alpha-2 `region` code (required for national-format input; not needed for E.164 input, since the country is encoded in the number).

This module wraps [`libphonenumber-js`](https://www.npmjs.com/package/libphonenumber-js) — the only runtime dependency in this package. Correct international phone validation is not a regex-solvable problem (numbering plans differ per country and change over time); a hand-rolled regex would silently accept invalid numbers and reject valid ones. The dependency is fully isolated behind this module's three functions and is not re-exported, so it can be swapped later without a breaking change.

### String (`src/string`)

`capitalize`, `camelCase`, `pascalCase`, `kebabCase`, `snakeCase`, `truncate`, `isBlank`, `isNullOrEmpty`, `toStringSafe`, `normalizeString`, `slugify`. All operate on Unicode code points (not UTF-16 code units) where it matters — e.g. `truncate` won't split an emoji's surrogate pair, and `slugify` strips diacritics via NFKD normalization rather than a fragile character map.

## Platform contracts

Every type/constant below was produced by directly auditing the backend source (`BackEnd/src/BuildingBlocks`), not guessed from convention. Each module's doc comments cite the exact backend file mirrored, so you can re-verify against the backend at any time — see "Backend Contract Synchronization" below for what to do when the backend changes.

### API response (`src/api/response`)

Mirrors `NovaCore.BuildingBlock.Application.Abstractions.Common.ApiResponse<T>`, used uniformly by every backend service:

```ts
interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  messageCode?: string | null; // e.g. "001", "700" — see MessageCode
  data?: T | null;
  details?: unknown | null;
}
```

There is **no status/timestamp/traceId/metadata field** — the backend does not put those in the JSON body (HTTP status lives only on the transport layer). Don't add them; they wouldn't reflect the real contract. `isSuccessResponse`/`isErrorResponse` type guards narrow on `success`.

### Pagination (`src/api/pagination`)

Mirrors `PaginatedResult<T>` (the single canonical offset-paginated response, used by every service's search/list endpoints) and `CursorPaginatedResult<T>` (a cursor/lazy-load sibling, currently used only by one Notification endpoint):

```ts
interface PaginatedResult<T> {
  items: T[];
  pageNumber: number; // one-based — confirmed via backend's HasPreviousPage => PageNumber > 1
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPages: number;
}
```

`PAGINATION_DEFAULTS` (`{ page: 1, pageSize: 20, maxPageSize: 200 }`) mirrors the backend's `CriteriaRequestValidator` defaults/limits exactly.

### Search criteria (`src/api/search`)

Mirrors `CriteriaRequest`/`CriteriaFilter`/`CriteriaSort` (`BuildingBlock.Criteria`), the canonical search request sent as a **JSON POST body** (e.g. `POST /users/search`) — confirmed there is no bespoke URL query-string DSL anywhere in the backend, so this module does not invent one.

```ts
const request = buildCriteriaRequest({
  keyword: "jun",
  filters: [
    criteriaFilter("status", CriteriaOperators.In, ["active", "pending"]),
    criteriaFilter("age", CriteriaOperators.Gte, 18),
  ],
  sorts: [criteriaSort("createdAt", SortDirections.Desc)],
});
// -> { keyword: "jun", filters: [...], sorts: [...], page: 1, pageSize: 20 }
// JSON.stringify(request) is already backend-compatible — send it directly as the POST body.
```

- `CriteriaOperators` (`Eq/Ne/Gt/Gte/Lt/Lte/Contains/StartsWith/EndsWith/In/NotIn/Between/IsNull/IsNotNull`) map to the exact short wire codes the backend's `CriteriaOperatorJsonConverter` expects (`"eq"`, `"c"`, `"sw"`, `"nin"`, `"null"`, ...) — not the C# member names.
- `SortDirections` (`Asc`/`Desc`) map to `"asc"`/`"desc"`.
- `field` on both `CriteriaFilter` and `CriteriaSort` is a plain string — arbitrary/custom field identifiers are supported, matching the backend (field whitelisting happens server-side, per entity, not in the wire contract).
- `value` accepts a scalar, an array (for `in`/`nin`/`between`), or is omitted (for `isnull`/`isnotnull`) — mirroring the backend's `JsonElement?`. For date/time fields, pass an ISO 8601 string.
- `page` is one-based, `pageSize` defaults to 20 with a backend-enforced max of 200 (same `PAGINATION_DEFAULTS` as above).

### Error codes (`src/api/error`)

`MessageCode` mirrors `NovaCore.BuildingBlock.Domain.Enums.MessageCode` — a single ~90-member code space shared by every service's error *and* success responses, partitioned by numeric range per service. Represented as an `as const` string-literal map (matching the actual wire value, which is the code's string attribute, not the C# enum's int):

```ts
switch (response.messageCode) {
  case MessageCode.UserNotFound: // "700"
    ...
  case MessageCode.ValidationFailed: // "100"
    ...
}
```

Do not resolve user-facing copy from a hypothetical "default message" table for these codes — use the `i18n` module's `createTranslator`, keyed by the code, since the backend's actual `message` field can differ per call site. `ValidationFieldError` mirrors the backend's per-field validation error shape (`propertyName`/`errorMessage`) — see its doc comment for an important caveat: the backend currently computes this list but never actually sends it in `ApiResponse.details` (always `null` today).

### Validation patterns (`src/validation`)

`EMAIL_REGEX`/`SLUG_REGEX`/`SKU_REGEX`/`BARCODE_REGEX` (plus their string-source `_PATTERN` counterparts) and `isEmail`/`isSlug`/`isSku`/`isBarcode` are mirrored verbatim from `NovaCore.BuildingBlock.SharedKernel.RegexPatterns`, so frontend and backend validation agree. **Phone number validation is deliberately not mirrored** — the backend's canonical phone regex is broken (it literally embeds JS regex-literal delimiters `/…/g` inside a .NET pattern), and the User service's actual rule (`^\d{10,}$`) is far more permissive than real phone validation. This package's existing `phone` module (backed by `libphonenumber-js`) remains the source of truth for phone validation; see "Issues for backend cleanup" below.

## Issues for backend cleanup

Found during the audit behind this package's platform contracts. Not fixed here — this is a frontend repo and the backend is the source of truth — but reported so the backend team can address them:

- **`RegexPatterns.PhoneNumber()` is broken.** It embeds JavaScript regex-literal delimiters (`/…/g`) inside a .NET pattern string, so as a real .NET regex it only matches strings that literally start with `/` and end with `/g` — it cannot match an actual phone number. Not mirrored here.
- **Phone validation is duplicated and inconsistent.** The (broken) SharedKernel pattern above and the User service's own local rule (`^\d{10,}$`, digits-only, no country-code awareness) disagree, and neither is internationally correct. Consider adopting a proper phone-number library on the backend too.
- **Field-level validation errors are computed but never sent.** `ValidationException.ValidationErrors` (a `List<ValidationError>` with per-field messages) is folded into a single log string and dropped before reaching `ApiResponse.details`, which is always `null` on the wire today. The domain model supports structured field errors; the wire contract currently doesn't expose them.
- **`AuditAction` has no confirmed wire format.** It's a plain C# enum with no `[JsonConverter]` attribute, and no global `JsonStringEnumConverter` is registered anywhere in the HTTP pipeline (the one centralized `JsonSerializerConfiguration` that *does* configure options is only used for Redis caching/metadata serialization, never wired into the ASP.NET Core response pipeline) — so it most likely serializes as a raw integer (`0`/`1`/`2`) over HTTP, not the strings assumed by a first draft of this audit. Not mirrored here until the backend confirms/fixes the actual wire format.
- **Slug validation is defined twice.** `RegexPatterns.Slug()` (SharedKernel, mirrored here as canonical) and `Product.Domain`'s own local `Slug` value object use slightly different patterns (capturing vs. non-capturing group, no `IgnoreCase` flag) instead of sharing one definition.
- **Several near-identical "code" value objects are defined independently.** Six backend value objects (`RoleKey`, `PermissionGroupCode`, `TenantCode`, `PositionCode`, `RoleCode`, `ScopeCode`) each redeclare the same snake_case identifier pattern (`^[a-z][a-z0-9]*(_[a-z0-9]+)*$`) rather than referencing one shared constant. Not mirrored here since none currently live in `BuildingBlock.SharedKernel`, but flagged as a candidate for a future canonical pattern.
- **No shared `CurrencyCode` or `LanguageCode`/`Locale` enum exists in the backend.** Currency is validated only as a bare `^[A-Z]{3}$` string per-service (intentionally, per a doc comment — Payment's `Currency` type is deliberately service-local). This package's `currency`/`date` modules already use `Intl`'s locale/currency handling instead, so this is noted for awareness rather than as a gap to fill.

## Backend Contract Synchronization

These contracts are high-impact: many frontend applications depend on them, so treat changes here like a platform API, not an app-local type.

```text
Backend Building Block changes
        ↓
Audit the backend source directly (never guess or infer from docs alone)
        ↓
Update the corresponding frontend-foundation module + its doc comments
        ↓
Update/add tests that assert the exact wire shape
        ↓
Version bump (semver — additive changes are minor/patch; renames or shape changes affecting existing consumers are major)
        ↓
Frontend applications upgrade on their own schedule
```

Guidelines:

- Prefer additive changes (new optional fields, new `MessageCode`/`CriteriaOperator` members) over renames.
- If the backend is internally inconsistent (e.g. two services naming the same concept differently), do not silently pick one and hide the discrepancy — mirror the canonical one, and document the divergent one in this README or the relevant module's doc comment (see the Slug/phone examples above).
- Every exported type/constant here should cite the exact backend file it mirrors in its doc comment, so a future audit can re-verify quickly instead of re-deriving from scratch.

## Development

```bash
pnpm install       # install dependencies
pnpm dev           # tsup --watch
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest run
pnpm test:watch    # vitest
pnpm build         # tsup (ESM + .d.ts + source maps, cleans dist/ first)
```

## Architectural constraints

- **Framework-agnostic.** No React, React DOM, Next.js, Vue, Angular, Svelte, Razor, or any UI framework (Tailwind, Shadcn, Radix, MUI, Chakra, Ant Design, etc.) is a dependency of this package, at build time or runtime.
- **Small dependency footprint.** The only runtime dependency is `libphonenumber-js`, added because correct phone validation genuinely requires it (see the Phone section above). Every other module — including all platform contracts — uses native `Intl`/`Date`/`URL`/`JSON`/ECMAScript APIs.
- **No framework state.** No context providers, composables, or DI services — those are the responsibility of future `@novacore/frontend-react`, `@novacore/frontend-vue`, and `@novacore/frontend-angular` packages, which will depend on this package.
- **Not an API SDK.** Platform contracts are typed shapes and small (de)serialization helpers, not an HTTP client — no `fetch`/`axios` wrapper exists or is planned for this package.
- **Cross-system contracts only.** Only Building Blocks used across every backend service belong here; domain-specific DTOs and status enums belong to their own domain/generated-client packages.
- **ESM only**, built with `tsup`, targeting ES2022.
