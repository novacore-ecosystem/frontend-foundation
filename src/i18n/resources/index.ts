import type { Locale } from "../locale";
import { en } from "./en";
import { vi } from "./vi";
import { zhCN } from "./zh-CN";

/**
 * The platform's own translation resources, keyed by {@link Locale} —
 * ready to hand to `createTranslator` as the `application` (or
 * `fallback`) layer. `en` is the completeness baseline; `vi` and
 * `zh-CN` are compiler-enforced to match its exact shape (see each
 * locale's `index.ts`).
 */
export const TRANSLATION_RESOURCES: Record<Locale, typeof en> = {
  en,
  vi,
  "zh-CN": zhCN,
};

export { en, vi, zhCN };
