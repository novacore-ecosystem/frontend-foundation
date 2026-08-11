# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-08-11T07:10:25.716Z
> Files: 69 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~20 tok)
- `CHANGELOG.md` — Change log (~330 tok)
- `CLAUDE.md` — OpenWolf (~542 tok)
- `package.json` — Node.js package manifest (~304 tok)
- `pnpm-lock.yaml` — pnpm lock file (~13015 tok)
- `README.md` — Project documentation (~4850 tok)
- `tsconfig.json` — TypeScript configuration (~198 tok)
- `tsup.config.ts` (~64 tok)
- `vitest.config.ts` — Vitest test configuration (~68 tok)

## .claude/

- `settings.json` (~514 tok)
- `settings.local.json` (~57 tok)

## .claude/commands/

- `reframe.md` — Mode: migrate [framework] (~551 tok)
- `security-audit.md` — Layer 1 — Dependencies (~510 tok)

## .claude/rules/

- `openwolf.md` (~328 tok)

## .codegraph/

- `.gitignore` — Git ignore rules (~61 tok)

## src/

- `index.ts` (~242 tok)

## src/api/

- `index.ts` (~32 tok)

## src/api/error/

- `index.ts` (~30 tok)
- `message-code.ts` — Mirrors `NovaCore.BuildingBlock.Domain.Enums.MessageCode` (~1339 tok)
- `validation.ts` — Mirrors `NovaCore.BuildingBlock.Application.Exceptions.ValidationError` (~336 tok)

## src/api/pagination/

- `index.ts` (~34 tok)
- `types.ts` — Mirrors `NovaCore.BuildingBlock.Application.Abstractions.Common.PaginatedResult<T>` (~492 tok)

## src/api/response/

- `guards.ts` — Narrows an {@link ApiResponse} to its success branch. Note that `data` (~199 tok)
- `index.ts` (~31 tok)
- `types.ts` — Mirrors the backend's canonical API response envelope, (~336 tok)

## src/api/search/

- `build.ts` — Builds a {@link CriteriaFilter} without hand-typing the operator's wire code. (~523 tok)
  - fn `criteriaFilter` L7-11 (~90 tok)
  - fn `criteriaSort` L12-27 (~224 tok)
  - fn `buildCriteriaRequest` L28-38 (~106 tok)
- `index.ts` (~95 tok)
- `operators.ts` — Mirrors `NovaCore.BuildingBlock.Criteria.Enums.CriteriaOperator` (~442 tok)
- `types.ts` — A single filter value: a scalar, or an array of scalars for `In`/`NotIn`/`Between`. (~828 tok)
  - section `CriteriaFilter` L32-38 (~70 tok)
  - section `CriteriaSort` L39-60 (~265 tok)
  - section `CriteriaRequest` L61-68 (~44 tok)

## src/bootstrap/

- `helpers.ts` — Returns whether a feature flag is enabled. Any truthy value (`true`, a (~435 tok)
- `index.ts` (~64 tok)
- `types.ts` — Identifies the tenant an application instance is running for. (~688 tok)
  - section `TenantIdentity` L4-37 (~384 tok)
  - section `TenantBootstrap` L38-60 (~266 tok)

## src/currency/

- `index.ts` — Currency formatting built on `Intl.NumberFormat`'s `style: "currency"`. (~492 tok)

## src/date/

- `compare.ts` — Returns true if `a` is chronologically before `b`. (~391 tok)
- `format.ts` — BCP 47 locale tag. Defaults to the runtime's default locale when omitted. (~385 tok)
- `index.ts` (~156 tok)
- `manipulate.ts` — All manipulation functions in this file operate on the **local wall (~1031 tok)
  - fn `daysInMonth` L14-18 (~63 tok)
  - fn `addDays` L19-25 (~75 tok)
  - fn `addWeeks` L26-36 (~107 tok)
  - fn `addMonths` L37-51 (~142 tok)
  - fn `addYears` L52-64 (~144 tok)
  - fn `subtractDays` L65-69 (~55 tok)
  - fn `subtractWeeks` L70-74 (~56 tok)
  - fn `subtractMonths` L75-79 (~56 tok)
  - fn `subtractYears` L80-84 (~55 tok)
  - fn `startOfDay` L85-91 (~67 tok)
  - fn `endOfDay` L92-97 (~40 tok)
- `parse.ts` — Parses a {@link DateInput} into a `Date` instance. (~942 tok)
  - fn `parseDateInput` L39-80 (~408 tok)
- `relative.ts` — BCP 47 locale tag. Defaults to the runtime's default locale when omitted. (~850 tok)
  - section `RelativeTimeOptions` L4-57 (~628 tok)
  - fn `relativeTime` L58-75 (~198 tok)
- `types.ts` — Accepted input for all date utilities in this module: (~90 tok)

## src/i18n/

- `index.ts` (~138 tok)
- `interpolate.ts` — Substitutes `{{name}}`-style placeholders (delimiters configurable via (~299 tok)
- `resolve.ts` — Looks up `key` in `dict`. Supports two dictionary shapes transparently: (~513 tok)
  - fn `lookupTranslationKey` L10-27 (~155 tok)
  - section `ResolveTranslationResult` L28-39 (~112 tok)
  - fn `resolveTranslation` L40-54 (~121 tok)
- `translator.ts` — Thrown by a translator created with `{ strict: true }` when a key is missing from every source. (~527 tok)
  - class `TranslationMissingError` L6-30 (~232 tok)
  - fn `createTranslator` L31-48 (~213 tok)
- `types.ts` — A single translation string, or a nested group of keys (e.g. `{ welcome: { message: "..." } }`). (~681 tok)
  - section `TranslationDictionary` L2-6 (~49 tok)
  - section `TranslationBundle` L7-15 (~78 tok)
  - section `TranslationSources` L16-35 (~251 tok)
  - section `InterpolationOptions` L36-42 (~58 tok)
  - section `CreateTranslatorOptions` L43-52 (~112 tok)
  - section `TranslateCallOptions` L53-64 (~104 tok)

## src/number/

- `index.ts` — Thin, well-documented wrappers around `Intl.NumberFormat`. This module (~678 tok)
  - section `FormatNumberOptions` L8-13 (~74 tok)
  - fn `formatNumber` L14-18 (~59 tok)
  - section `FormatDecimalOptions` L19-31 (~137 tok)
  - fn `formatDecimal` L32-40 (~90 tok)
  - section `FormatPercentOptions` L41-54 (~156 tok)
  - fn `formatPercent` L55-63 (~90 tok)

## src/phone/

- `index.ts` — Phone number utilities. (~795 tok)
  - fn `formatPhoneNumber` L38-54 (~194 tok)
  - fn `normalizePhoneNumber` L55-65 (~128 tok)
  - fn `isValidPhoneNumber` L66-69 (~40 tok)

## src/string/

- `index.ts` — Framework-agnostic string utilities. (~1530 tok)
  - fn `isNullOrEmpty` L10-14 (~72 tok)
  - fn `isBlank` L15-19 (~65 tok)
  - fn `toStringSafe` L20-34 (~137 tok)
  - fn `normalizeString` L35-40 (~70 tok)
  - fn `capitalize` L41-49 (~104 tok)
  - fn `toWords` L50-60 (~106 tok)
  - fn `camelCase` L61-72 (~116 tok)
  - fn `pascalCase` L73-83 (~100 tok)
  - fn `kebabCase` L84-90 (~66 tok)
  - fn `snakeCase` L91-96 (~44 tok)
  - section `TruncateOptions` L97-106 (~92 tok)
  - fn `truncate` L107-122 (~136 tok)
  - section `SlugifyOptions` L123-134 (~111 tok)
  - fn `slugify` L135-154 (~211 tok)

## src/validation/

- `index.ts` (~64 tok)

## src/validation/patterns/

- `index.ts` — Regex patterns mirrored verbatim from the backend's shared kernel, (~889 tok)

## src/validation/validators/

- `index.ts` — Tests a value against the shared, backend-mirrored {@link EMAIL_REGEX}. (~212 tok)

## tests/

- `public-api.test.ts` — Declares ApiResponse (~840 tok)

## tests/api/

- `error.test.ts` — ApiResponse: describe (~628 tok)
- `pagination.test.ts` — Declares CursorPaginatedResult (~639 tok)
- `response.test.ts` — Declares ApiResponse (~429 tok)
- `search.test.ts` — Declares CriteriaRequest (~1822 tok)

## tests/bootstrap/

- `bootstrap.test.ts` — Declares TenantBootstrap (~549 tok)

## tests/currency/

- `currency.test.ts` — Declares result (~401 tok)

## tests/date/

- `compare.test.ts` (~430 tok)
- `format.test.ts` — Declares result (~272 tok)
- `manipulate.test.ts` — Declares result (~1056 tok)
- `parse.test.ts` — Declares original (~524 tok)
- `relative.test.ts` — NOW: agoMs (~683 tok)
  - fn `agoMs` L6-72 (~642 tok)

## tests/i18n/

- `interpolate.test.ts` (~204 tok)
- `translator.test.ts` — Declares TranslationSources (~1237 tok)

## tests/number/

- `number.test.ts` — Declares result (~436 tok)

## tests/phone/

- `phone.test.ts` — Declares result (~582 tok)

## tests/string/

- `string.test.ts` — Declares result (~1326 tok)

## tests/validation/

- `patterns.test.ts` (~795 tok)
