# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

`@novacore/frontend-foundation` is the framework-agnostic foundation layer for the NovaCore frontend ecosystem (OMS, CMS, CS, MP, and future apps). It implements tenant bootstrap contracts, i18n translation resolution, date/number/currency/phone/string utilities, and platform contracts mirroring the backend's shared Building Blocks (API response envelope, pagination, search criteria, error codes, validation patterns, permissions/authorization). See `README.md` for the full module list, usage, and the "Backend Contract Synchronization" process; see `docs/backend-contract-sync.md` for the contract-by-contract backend source map.

## Critical architectural rule

This package MUST NOT depend on React, Vue, Angular, Next.js, Razor, or any UI framework (Tailwind, Shadcn, Radix, MUI, Chakra, Ant Design, etc.) — at build time or runtime. It is the lowest shared layer; future `@novacore/frontend-react`/`-vue`/`-angular` packages will depend on it, never the reverse. Prefer native `Intl`/`Date`/`JSON`/ECMAScript APIs over new dependencies; the only current runtime dependency is `libphonenumber-js` (phone validation is not solvable with a regex — see `src/phone/index.ts` for the rationale). This package is not an API SDK — no `fetch`/`axios` wrapper — and must not contain domain-specific DTOs (`UserDto`, `OrderDto`, etc.) or domain status enums (`OrderStatus`, `PaymentStatus`, ...); only contracts genuinely shared across every backend service belong here. `src/authorization` provides plain functions (`hasPermission`, `hasAnyPermission`, `hasAllPermissions`) only — no `usePermission()` hook or other framework binding belongs in this repo.

## Backend as source of truth

The `src/api`, `src/validation`, and `src/authorization` modules mirror the .NET backend's shared Building Blocks (`BackEnd/src/BuildingBlocks/`, particularly `BuildingBlock.Application`, `BuildingBlock.Criteria`, `BuildingBlock.Domain`, `BuildingBlock.SharedKernel`, `BuildingBlock.Web`). Before changing any type/constant in those modules, re-audit the corresponding backend source directly — do not guess or infer from this repo's doc comments alone, since the backend may have changed. Every exported contract cites the exact backend file it mirrors in its own doc comment; keep that citation accurate when updating. Never write a machine-specific absolute path in any doc comment or doc file — backend paths are always repository-relative (`core-backend/src/...`), and every contract also has a search-anchor fallback in `docs/backend-contract-sync.md` in case the file has moved. See the README's "Backend Contract Synchronization" and "Issues for backend cleanup" sections, and `docs/backend-contract-sync.md`, for the known process, change-frequency classification, and open discrepancies (e.g. `AuditAction`'s wire format is unconfirmed and intentionally not mirrored; the backend's phone regex is broken and not mirrored; permissions and error codes are classified High-frequency and should be re-audited most often).

## Structure

Each domain is its own directory under `src/` (`bootstrap`, `i18n`, `date`, `number`, `currency`, `phone`, `string`, `api`, `validation`, `authorization`) with a barrel `index.ts`; the package's public API is re-exported from `src/index.ts`. `api/` is further split into `response`, `pagination`, `search`, and `error` submodules; `validation/` into `patterns` and `validators`; `authorization/` into `permissions`, `helpers`, and `types`. Do not add catch-all `utils.ts`/`helpers.ts`/`misc.ts` files — every module should represent one coherent capability. Tests mirror this structure under `tests/`.

## Commands

```bash
pnpm install       # install dependencies
pnpm dev           # tsup --watch
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest run
pnpm test:watch    # vitest
pnpm build         # tsup (ESM + .d.ts + source maps, cleans dist/ first)
```

## Notes for future work

- This package is not yet published (`"private": true`).
- Do not implement React/Vue/Angular/Razor adapters, UI components, or Next.js integration in this repo — those belong in separate `@novacore/frontend-*` packages that will depend on this one.
