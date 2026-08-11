// Note: MessageCode itself is not re-exported here — it already lives in
// the top-level public API via `../api/error` (`./codes` re-exports it
// internally within this module only, so definitions.ts doesn't need a
// deep relative import). Re-exporting it again here would collide with
// that existing export in `src/index.ts`'s `export * from "./api"`.
export { ERROR_DEFINITIONS, getErrorDefinition, getErrorMessageKey } from "./definitions";
export type { ErrorDefinition } from "./definitions";
export { translateError } from "./translation";
export type { TranslateErrorOptions } from "./translation";
