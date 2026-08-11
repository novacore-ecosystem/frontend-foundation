# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

`@novacore/frontend-foundation` is the framework-agnostic foundation layer for the NovaCore frontend ecosystem (OMS, CMS, CS, MP, and future apps). It implements tenant bootstrap contracts, i18n translation resolution, and date/number/currency/phone/string utilities. See `README.md` for the full module list and usage.

## Critical architectural rule

This package MUST NOT depend on React, Vue, Angular, Next.js, Razor, or any UI framework (Tailwind, Shadcn, Radix, MUI, Chakra, Ant Design, etc.) — at build time or runtime. It is the lowest shared layer; future `@novacore/frontend-react`/`-vue`/`-angular` packages will depend on it, never the reverse. Prefer native `Intl`/`Date`/ECMAScript APIs over new dependencies; the only current runtime dependency is `libphonenumber-js` (phone validation is not solvable with a regex — see `src/phone/index.ts` for the rationale).

## Structure

Each domain is its own directory under `src/` (`bootstrap`, `i18n`, `date`, `number`, `currency`, `phone`, `string`) with a barrel `index.ts`; the package's public API is re-exported from `src/index.ts`. Do not add catch-all `utils.ts`/`helpers.ts`/`misc.ts` files — every module should represent one coherent capability. Tests mirror this structure under `tests/`.

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
