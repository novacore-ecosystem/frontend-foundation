# @novacore/frontend-foundation

Framework-agnostic foundation layer for NovaCore frontend applications (OMS, CMS, CS, MP, and future apps).

## What this is

A small set of framework-independent contracts, algorithms, and utilities that any frontend technology can consume:

- Tenant bootstrap contract
- Translation (i18n) resolution
- Date/time utilities
- Number and currency formatting
- Phone number utilities
- String utilities

## What this is NOT

- **Not a UI library.** No components, no styling, no design system.
- **Not React, Vue, Angular, or Razor code.** No hooks, no composables, no services, no context/providers.
- **Not an i18n framework.** It provides the resolution *logic*; wiring it into a specific framework's state/reactivity model is the job of a future adapter package.
- **Not published yet.** This is an internal/private package (`"private": true` in `package.json`).

## Architecture role

This package is the lowest shared layer in the NovaCore frontend ecosystem:

```text
                    Frontend Platform
                           |
                    Framework Agnostic
                  @novacore/frontend-foundation
                           |
        +------------------+------------------+
        |                  |                  |
      React               Vue              Angular
   (frontend-react)  (frontend-vue)  (frontend-angular)
        |
    Next.js apps
```

Future packages such as `@novacore/frontend-react`, `@novacore/frontend-vue`, and `@novacore/frontend-angular` will depend on this package — never the other way around. This package must never depend on a UI framework.

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
- **Small dependency footprint.** The only runtime dependency is `libphonenumber-js`, added because correct phone validation genuinely requires it (see the Phone section above). Every other module uses native `Intl`/`Date`/`URL`/ECMAScript APIs.
- **No framework state.** No context providers, composables, or DI services — those are the responsibility of future `@novacore/frontend-react`, `@novacore/frontend-vue`, and `@novacore/frontend-angular` packages, which will depend on this package.
- **ESM only**, built with `tsup`, targeting ES2022.
