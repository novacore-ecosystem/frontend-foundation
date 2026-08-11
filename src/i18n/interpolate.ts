import type { InterpolationOptions, InterpolationValues } from "./types";

const DEFAULT_PREFIX = "{{";
const DEFAULT_SUFFIX = "}}";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

/**
 * Substitutes `{{name}}`-style placeholders (delimiters configurable via
 * `options`) with values from `values`. A placeholder with no matching
 * value is left untouched (rather than silently emptied) so missing
 * interpolation data stays visible during development.
 */
export function interpolate(
  template: string,
  values?: InterpolationValues,
  options: InterpolationOptions = {},
): string {
  if (!values) return template;
  const prefix = options.prefix ?? DEFAULT_PREFIX;
  const suffix = options.suffix ?? DEFAULT_SUFFIX;
  const pattern = new RegExp(`${escapeRegExp(prefix)}\\s*([\\w.]+)\\s*${escapeRegExp(suffix)}`, "gu");

  return template.replace(pattern, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}
