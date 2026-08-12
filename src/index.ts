/**
 * @novacore/frontend-foundation
 *
 * Framework-agnostic foundation for NovaCore frontend applications:
 * tenant bootstrap contracts, translation resolution, date/number/
 * currency/phone/string utilities, platform contracts mirroring the
 * backend's shared Building Blocks (API response envelope, pagination,
 * search criteria, error codes, validation patterns, permissions/
 * authorization), and typed HTTP/realtime infrastructure (`http`,
 * `realtime` — Axios and SignalR are internal transports, never exposed
 * publicly). See the README for the full module list, backend-
 * contract sync notes (also `docs/backend-contract-sync.md`), and
 * architectural constraints (no React/Vue/Angular/UI-framework
 * dependencies here — those belong to future `@novacore/frontend-*`
 * adapter packages).
 */

export * from "./bootstrap";
export * from "./i18n";
export * from "./date";
export * from "./number";
export * from "./currency";
export * from "./phone";
export * from "./string";
export * from "./api";
export * from "./validation";
export * from "./authorization";
export * from "./errors";
export * from "./http";
export * from "./realtime";
