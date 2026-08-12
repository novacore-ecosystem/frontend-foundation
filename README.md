# @novacore/frontend-foundation

Framework-agnostic foundation layer for NovaCore frontend applications (OMS, CMS, CS, MP, and future apps).

## What this is

A small set of framework-independent contracts, algorithms, and utilities that any frontend technology can consume, in two categories:

**Runtime utilities**
- Tenant bootstrap contract
- A full shared internationalization architecture: locale standard, framework-independent translation resolution, tenant overrides, and shared translation resources (common/admin/auth/validation/errors/permissions terminology in English, Vietnamese, and Simplified Chinese)
- Date/time utilities
- Number and currency formatting
- Phone number utilities
- String utilities
- Typed HTTP client (`src/http`) and typed realtime hub client (`src/realtime`) — Axios and SignalR are internal transports, never exposed to consumers

**Platform contracts** — TypeScript mirrors of the backend's shared Building Blocks, so every frontend app shares one typed representation instead of redefining the same response envelope, pagination shape, search request, error codes, validation patterns, and permission keys:
- API response envelope (`ApiResponse<T>`)
- Pagination (`PaginatedResult<T>`, `CursorPaginatedResult<T>`)
- Search criteria (`CriteriaRequest`, filters, sorts, operators)
- Error/message codes (`MessageCode`), validation error shape, and error-code-to-translation-key mapping (`translateError`)
- Backend-mirrored validation regex patterns (email, slug, SKU, barcode)
- Permissions (`Permissions`), framework-agnostic permission checking (`hasPermission`, `hasAnyPermission`, `hasAllPermissions`), and permission category translation

See [`docs/backend-contract-sync.md`](docs/backend-contract-sync.md) for exactly where every platform contract comes from in the backend, how frequently each is expected to change, and the process for keeping them in sync. See [`docs/i18n.md`](docs/i18n.md) for the full internationalization architecture.

## What this is NOT

- **Not a UI library.** No components, no styling, no design system.
- **Not React, Vue, Angular, or Razor code.** No hooks, no composables, no services, no context/providers.
- **Not an i18n framework.** It provides the resolution *logic*; wiring it into a specific framework's state/reactivity model is the job of a future adapter package.
- **Not a permission/auth framework with framework bindings.** `hasPermission`/`hasAnyPermission`/`hasAllPermissions` are plain functions over a permissions array — there is no `usePermission()` hook, no Vue composable, no Angular service here. Those belong in a future `@novacore/frontend-react` (etc.) package that wraps this module's functions.
- **Not a business API SDK.** `src/http` provides a generic, typed HTTP client and `Endpoint` abstraction, but this package does not know your services' base URLs, endpoints, or response DTOs — those are declared by the consuming application (or a future generated API client) on top of `HttpClient`/`endpoint()`.
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

### Internationalization (`src/i18n`)

The full shared i18n architecture — **see [`docs/i18n.md`](docs/i18n.md) for the complete picture**; summary below.

**Locale** (`src/i18n/locale`): `Locale` is a closed type (`"en" | "vi" | "zh-CN"`), not a bare `string` — `SUPPORTED_LOCALES`, `DEFAULT_LOCALE` (`"en"`), and `LOCALE_METADATA` (English/native display names + text direction, e.g. `"Tiếng Việt"`, `"简体中文"`) are all centralized here. `normalizeLocale`/`resolveLocale` are the single boundary for turning an arbitrary string (`"en-US"`, `"zh-cn"`, a tenant bootstrap's raw `locale` field) into a `Locale`, so application code never writes `locale as Locale`.

**Translation resolution**: `createTranslator(sources, options)` returns a bound `translate(key, values?, callOptions?)` function — still a plain closure, no framework dependency. Resolution order per call:

```text
tenant override (locale) → application dictionary (locale) → fallback dictionary (locale)
  → [only if options.fallbackLocale is set] tenant override (fallbackLocale) → application (fallbackLocale) → fallback (fallbackLocale)
  → the key itself (or onMissingKey's configured behavior)
```

`fallbackLocale` is opt-in and defaults to `undefined` (no locale fallback — identical to this function's behavior before this phase), so it's a fully backward-compatible addition. Pass `DEFAULT_LOCALE` to get platform-standard behavior.

- Dictionaries are keyed by locale (`TranslationBundle`) and support both flat dotted keys (`"welcome.message"`) and nested objects (`{ welcome: { message: "..." } }`) transparently.
- Interpolation syntax is `{{name}}` (configurable delimiters via `options.interpolation`). Placeholders with no matching value are left untouched rather than silently emptied, so missing data stays visible.
- Missing keys return the key itself by default (`onMissingKey: "key"`); `"empty"`, a custom function, or `strict: true` (throws `TranslationMissingError`) are also supported.
- Locale can be overridden per call via the third argument.

**Translation resources** (`src/i18n/resources`): this package ships its own English/Vietnamese/Simplified-Chinese resource dictionaries — `common.*` (actions, statuses, pagination, table states), `navigation.*`, `admin.*` (shared entity nouns), `auth.*`, `validation.*` (client-side form messages), `errors.*` (a representative `MessageCode` subset), and `permissions.*` (category-level fallback labels) — as `TRANSLATION_RESOURCES: Record<Locale, ...>`. Every non-English locale is declared `satisfies typeof en`, so a missing or extra key is a **TypeScript compile error**, not a silent runtime drift; `tests/i18n/resources.test.ts` runs the same completeness check at runtime too.

**Type-safe keys, no code generation**: `TranslationKey` is a plain recursive TypeScript type derived from the English resource (`DotPath<typeof en>`) — autocomplete and typo-catching for this package's own keys, achieved without a build/codegen step. `Translator.key` itself stays plain `string` so applications/tenants can add their own keys beyond this baseline.

**Tenant bootstrap integration**: `resolveTenantLocale(bootstrap)` (`src/bootstrap`) is the normalization boundary for `TenantBootstrap.locale`; `createTranslatorFromBootstrap` uses it automatically and defaults `fallbackLocale` to `DEFAULT_LOCALE`.

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

### HTTP client (`src/http`)

**Axios and SignalR are implementation details and must not be used directly by consuming applications.** `src/http` wraps Axios as its internal transport; nothing in this module's public exports references `AxiosRequestConfig`, `AxiosResponse`, or `AxiosError` — only NovaCore's own `HttpRequest`/`HttpResponse`/`HttpError` types. Import it from the package root or the `@novacore/frontend-foundation/http` subpath (so an app that only needs HTTP doesn't pull in the realtime module or vice versa).

```ts
import { createHttpClient, endpoint, HttpError } from "@novacore/frontend-foundation/http";

const httpClient = createHttpClient({
  baseUrl: "https://api.example.com",
  timeout: 10_000,
  tokenProvider: {
    getAccessToken: () => localStorage.getItem("access_token"),
    refreshAccessToken: async () => refreshViaYourAuthService(),
  },
  retry: { enabled: true, attempts: 3 },
});

// Low-level, ad-hoc calls:
const product = await httpClient.get<Product>("/products/123");
await httpClient.post("/orders", { items: [...] });

// Typed, reusable endpoints — request/response types and HTTP config declared together:
const getProduct = endpoint<{ id: string }, Product>({ method: "GET", path: "/products/:id" });
const product2 = await httpClient.execute(getProduct, { id: "123" });
// `:id` is interpolated into the path from the request object; any remaining
// fields become query params (GET/HEAD/DELETE/OPTIONS) or the JSON body
// (POST/PUT/PATCH).

try {
  await httpClient.get("/will-fail");
} catch (error) {
  if (error instanceof HttpError) {
    // error.kind: "network" | "timeout" | "cancelled" | "api" | "unknown"
    // error.status, error.code (backend MessageCode), error.validationErrors, error.requestId
  }
}

// Cancellation uses the platform-standard AbortSignal, not an Axios CancelToken:
const controller = new AbortController();
httpClient.get("/slow", { signal: controller.signal });
controller.abort();
```

- `HttpClientOptions` configures `baseUrl`, `timeout`, `headers`, `withCredentials`, `tokenProvider`, `retry`, and `interceptors` — one Axios instance is created per `HttpClient`, never per request.
- `HttpInterceptor` (`onRequest`/`onResponse`/`onError`) is this package's own interception point; Axios's interceptor API is never exposed.
- `TokenProvider.getAccessToken()` attaches `Authorization: Bearer <token>`; an optional `refreshAccessToken()` is called once on a `401` before the request is retried — this is the hook point for a future token-refresh flow, without coupling this module to any specific auth implementation.
- Retry is off by default and, when enabled, only applies to safe/idempotent methods (`GET`/`HEAD`/`OPTIONS`) unless `retry.methods`/`retry.shouldRetry` says otherwise — mutations are never silently retried by default.
- Server validation errors are normalized onto `HttpError.validationErrors` (`ValidationFieldError[]`, from `src/api/error`) whenever `ApiResponse.details` matches that shape — see that type's doc comment for the current backend-population caveat.

### Realtime (`src/realtime`)

Wraps `@microsoft/signalr` as the internal transport for a single hub connection; nothing in this module's public exports references `HubConnection`, `HubConnectionState`, or `HubConnectionBuilder`. Import it from the package root or the `@novacore/frontend-foundation/realtime` subpath.

```ts
import { createRealtimeClient, hub, RealtimeConnectionStates, RealtimeError } from "@novacore/frontend-foundation/realtime";

const realtime = createRealtimeClient({
  hubUrl: "https://api.example.com/hubs/notifications",
  tokenProvider: { getAccessToken: () => localStorage.getItem("access_token") },
  reconnect: { enabled: true }, // uses DEFAULT_RECONNECT_DELAYS_MS unless overridden
});

realtime.on("reconnecting", () => console.warn("reconnecting..."));
await realtime.connect(); // safe to call repeatedly — never opens duplicate connections

const unsubscribe = realtime.subscribe<{ orderId: string; status: string }>(
  "OrderStatusChanged",
  (payload) => console.log(payload.orderId, payload.status),
);
await realtime.invoke("SubscribeOrder", { orderId: "123" });

unsubscribe();
await realtime.disconnect(); // safe to call when already disconnected

// Typed hub contracts — declare the shape once, get compile-time-checked
// event/method names everywhere it's used (no business hubs ship in this
// package; applications define their own, e.g.:
const OrderHub = hub<
  { OrderStatusChanged: { orderId: string; status: string } },
  { SubscribeOrder: { request: { orderId: string }; response: void } }
>({ name: "OrderHub" });

const orderHub = realtime.forHub(OrderHub);
orderHub.subscribe("OrderStatusChanged", (payload) => { /* payload is typed */ });
await orderHub.invoke("SubscribeOrder", { orderId: "123" });
```

- `RealtimeConnectionStates` (`disconnected`/`connecting`/`connected`/`reconnecting`/`disconnecting`/`failed`) is this package's own normalized state, mapped from SignalR's `HubConnectionState` — read live via `realtime.state`.
- `realtime.on(event, handler)` exposes normalized connection-lifecycle events (`connecting`/`connected`/`reconnecting`/`reconnected`/`disconnected`/`error`).
- Errors thrown from `connect()`/`invoke()` are always `RealtimeError` (`kind`, `message`, `connectionState`), never a raw SignalR error.
- `tokenProvider` reuses the same `TokenProvider` contract as `src/http`, so one auth source can back both HTTP and realtime.
- `realtime.dispose()` disconnects and clears connection-lifecycle listeners; call the `unsubscribe` function returned by `subscribe()` to remove a per-event handler.

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

Do not resolve user-facing copy from a hypothetical "default message" table for these codes — use `translateError` (`src/errors`, built on the `i18n` module) instead, keyed by the code, since the backend's actual `message` field can differ per call site. `ValidationFieldError` mirrors the backend's per-field validation error shape (`propertyName`/`errorMessage`) — see its doc comment for an important caveat: the backend currently computes this list but never actually sends it in `ApiResponse.details` (always `null` today).

**Error translation** (`src/errors`): `translateError(error, options)` resolves `{ messageCode, message }` (e.g. a failed `ApiResponse`) to a human-readable message — `translateError({ messageCode: MessageCode.UserNotFound, message: "..." }, { locale: "vi" })` → `"Không tìm thấy người dùng"`. `ERROR_DEFINITIONS` maps a **representative subset** of `MessageCode` (every non-success System/Validation/Client/Auth code, plus one illustrative code per business service — about 20 of the backend's ~90 codes) to a translation key and default message; the rest gracefully fall back to the backend-provided message, then a generic localized message, then (only in `{ debug: true }`) the raw code — never a raw key or code in production. See [`docs/i18n.md`](docs/i18n.md) §7 for the exact fallback chain and why the subset is intentionally not exhaustive.

### Validation patterns (`src/validation`)

`EMAIL_REGEX`/`SLUG_REGEX`/`SKU_REGEX`/`BARCODE_REGEX` (plus their string-source `_PATTERN` counterparts) and `isEmail`/`isSlug`/`isSku`/`isBarcode` are mirrored verbatim from `NovaCore.BuildingBlock.SharedKernel.RegexPatterns`, so frontend and backend validation agree. **Phone number validation is deliberately not mirrored** — the backend's canonical phone regex is broken (it literally embeds JS regex-literal delimiters `/…/g` inside a .NET pattern), and the User service's actual rule (`^\d{10,}$`) is far more permissive than real phone validation. This package's existing `phone` module (backed by `libphonenumber-js`) remains the source of truth for phone validation; see "Issues for backend cleanup" below.

### Permissions (`src/authorization`)

`Permissions` mirrors `NovaCore.BuildingBlock.SharedKernel.Constants.Permissions` verbatim — the single, code-first canonical source of every permission key in the platform, referenced by every business service's `RequirePermissions(...)` calls:

```ts
import { Permissions, hasPermission } from "@novacore/frontend-foundation";

Permissions.Root;                 // "system:root"
Permissions.User;                 // "system:user" — baseline, every authenticated non-Root account
Permissions.Order.View;           // "order:view"
Permissions.Order.Full;           // "order:full" — implicitly grants every order:* permission

hasPermission(currentUserPermissions, Permissions.Order.View);
```

- Keys are lowercase `module:action` strings (hyphenated for multi-word actions, e.g. `"inventory:stock-move"`) — not a TypeScript `enum`, matching how they're plain strings on every backend wire boundary too.
- `PERMISSION_VALUES` is the flat list of every key (mirrors the backend's `Permissions.SupportedValues`), and `isKnownPermission(value)` validates an untyped string against it — mirroring the backend's `PermissionKey` value object, which validates the same way rather than via a format regex.
- **Do not confuse `Permissions.User` (singular) with `Permissions.Users` (plural).** They're unrelated: `User` is the baseline capability every account has; `Users` is the admin module for managing *other* users' accounts. This naming collision exists in the backend source itself and is preserved intentionally rather than "cleaned up" in the frontend mirror.
- `hasPermission`/`hasAnyPermission`/`hasAllPermissions` mirror the backend's `PermissionAuthorization.HasAnyPermission` evaluation rule exactly: `Permissions.Root` bypasses every check, and each required permission resolves either by exact match or via its module's `"{module}:full"` aggregate. They take the caller's owned permissions as a plain array — no implicit global state, no framework binding. `hasAllPermissions` has no direct backend equivalent (the backend only ever needs OR-semantics for a single endpoint guard) but is a safe, natural AND-composition of the same rule for frontend call sites gating a feature behind multiple permissions.
- `CurrentUserAuthorization` (`{ roles, permissions }`) mirrors the `roles`/`permissions` fields of the User service's `GetUserDetailResponse` — the closest thing the backend has to a "current user's effective permissions" response (`GET /profiles/current/detail`). Per the backend handler's own doc comment, this is a **UI-only signal** (e.g. for conditionally rendering navigation) — actual authorization is always enforced server-side via the JWT's `permission` claims, never by this frontend check alone.

**Permission translation** (`src/authorization/translation`): a permission identifier must stay technical (`"order:view"`), but a UI must never show that raw string. `getPermissionCategoryTranslationKey(permission)` derives a category-level translation key (`"order:view"` → `"permissions.categories.order"`; `Permissions.Root`/`Permissions.User` → their own dedicated keys), and `translatePermissionCategory(permission, translate)` resolves it to a label ("Orders", "Đơn hàng", "订单") via a caller-supplied translator. This package deliberately does **not** ship static translations for all 43 individual permission display names — the backend already owns that content dynamically and admin-editable via `PermissionDefinitionTranslation`/`PermissionGroupTranslation` (see `docs/i18n.md` §8); `PermissionDisplayInfo` documents the shape a future admin UI should expect when it fetches that data from the Auth service directly, and the category-level label is the safe fallback until/unless it's available.

## Issues for backend cleanup

Found during the audit behind this package's platform contracts. Not fixed here — this is a frontend repo and the backend is the source of truth — but reported so the backend team can address them:

- **`RegexPatterns.PhoneNumber()` is broken.** It embeds JavaScript regex-literal delimiters (`/…/g`) inside a .NET pattern string, so as a real .NET regex it only matches strings that literally start with `/` and end with `/g` — it cannot match an actual phone number. Not mirrored here.
- **Phone validation is duplicated and inconsistent.** The (broken) SharedKernel pattern above and the User service's own local rule (`^\d{10,}$`, digits-only, no country-code awareness) disagree, and neither is internationally correct. Consider adopting a proper phone-number library on the backend too.
- **Field-level validation errors are computed but never sent.** `ValidationException.ValidationErrors` (a `List<ValidationError>` with per-field messages) is folded into a single log string and dropped before reaching `ApiResponse.details`, which is always `null` on the wire today. The domain model supports structured field errors; the wire contract currently doesn't expose them.
- **`AuditAction` has no confirmed wire format.** It's a plain C# enum with no `[JsonConverter]` attribute, and no global `JsonStringEnumConverter` is registered anywhere in the HTTP pipeline (the one centralized `JsonSerializerConfiguration` that *does* configure options is only used for Redis caching/metadata serialization, never wired into the ASP.NET Core response pipeline) — so it most likely serializes as a raw integer (`0`/`1`/`2`) over HTTP, not the strings assumed by a first draft of this audit. Not mirrored here until the backend confirms/fixes the actual wire format.
- **Slug validation is defined twice.** `RegexPatterns.Slug()` (SharedKernel, mirrored here as canonical) and `Product.Domain`'s own local `Slug` value object use slightly different patterns (capturing vs. non-capturing group, no `IgnoreCase` flag) instead of sharing one definition.
- **Several near-identical "code" value objects are defined independently.** Six backend value objects (`RoleKey`, `PermissionGroupCode`, `TenantCode`, `PositionCode`, `RoleCode`, `ScopeCode`) each redeclare the same snake_case identifier pattern (`^[a-z][a-z0-9]*(_[a-z0-9]+)*$`) rather than referencing one shared constant. Not mirrored here since none currently live in `BuildingBlock.SharedKernel`, but flagged as a candidate for a future canonical pattern.
- **No shared `CurrencyCode` or `LanguageCode`/`Locale` enum exists in the backend.** Currency is validated only as a bare `^[A-Z]{3}$` string per-service (intentionally, per a doc comment — Payment's `Currency` type is deliberately service-local). This package's `currency`/`date` modules already use `Intl`'s locale/currency handling instead, so this is noted for awareness rather than as a gap to fill.
- **Two independent "permission" vocabularies exist in the User service.** Only the colon-separated `Permissions.cs` vocabulary (the one actually enforced via the JWT `permission` claim) is mirrored here. User service also has its own dot-separated `PermissionCollection` value object (e.g. `"product.product.read"`) backing a separate, currently-unenforced business concept with no HTTP endpoint exposing it — not mirrored, and should not be merged into the same TypeScript type if it's ever wired up later.
- **`Permissions.User` and `Permissions.Users` are easy to confuse** (see the Permissions section above) — this is a backend naming choice, preserved as-is rather than silently renamed.
- **Backend and frontend supported-locale lists diverge.** Backend's `LanguageCodeConstant.SupportedLanguages` is `["en", "vi"]` only; this package supports `["en", "vi", "zh-CN"]`. Only backend-owned dynamic content (permission display-name translations) is affected — see `docs/i18n.md` §1 and §8, and `docs/backend-contract-sync.md`.

## Backend Contract Synchronization

These contracts are high-impact: many frontend applications depend on them, so treat changes here like a platform API, not an app-local type. See [`docs/backend-contract-sync.md`](docs/backend-contract-sync.md) for the full contract-by-contract map (frontend location, backend location, search anchors, change-frequency classification) — the summary below is the short version.

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
