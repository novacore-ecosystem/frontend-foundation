import { admin } from "./admin";
import { auth } from "./auth";
import { common } from "./common";
import { errors } from "./errors";
import { navigation } from "./navigation";
import { permissions } from "./permissions";
import { validation } from "./validation";

/**
 * The English translation resource — the completeness baseline for
 * every other locale (see `docs/i18n.md`, "Adding a new translation
 * key"). `vi`/`zh-CN` are type-checked against this exact shape via
 * `satisfies typeof en`, so a missing or extra key in either is a
 * compile error, not a silent drift.
 */
export const en = {
  common,
  navigation,
  admin,
  auth,
  validation,
  errors,
  permissions,
};
