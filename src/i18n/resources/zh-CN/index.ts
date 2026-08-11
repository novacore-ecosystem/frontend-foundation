import type { en } from "../en";
import { admin } from "./admin";
import { auth } from "./auth";
import { common } from "./common";
import { errors } from "./errors";
import { navigation } from "./navigation";
import { permissions } from "./permissions";
import { validation } from "./validation";

/** The Simplified Chinese translation resource. Shape-checked against `typeof en` — see `../en/index.ts`. */
export const zhCN = {
  common,
  navigation,
  admin,
  auth,
  validation,
  errors,
  permissions,
} as const satisfies typeof en;
