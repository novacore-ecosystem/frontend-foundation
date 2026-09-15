import { endpoint } from "../http/endpoint";
import { HttpMethods } from "../http/types";
import type {
  ConfirmEmailRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendEmailRequest,
} from "./types";

/**
 * Typed `EndpointDefinition`s for the platform's authentication flows — declared once via
 * `endpoint()` (`../http/endpoint`) so every consuming application executes them the same way
 * (`httpClient.execute(AuthEndpoints.login, request)`) instead of hand-writing
 * `axios.post("/auth/login", ...)` per app.
 *
 * Every response type below is `void` — the backend either sets HTTP-only cookies (`login`,
 * `refreshToken`) or simply confirms the action with no meaningful payload (`register`,
 * `confirmEmail`, `forgotPassword`, `resendEmail`, `logout`). See `./types`'s module doc comment
 * for the "backend-confirmed 2026-09-15" audit this reflects.
 */
export const AuthEndpoints = {
  login: endpoint<LoginRequest, void>({ method: HttpMethods.Post, path: "/auth/login" }),
  /** No request body — the refresh token is sent automatically via its HTTP-only cookie; the `X-App-Key` header (see `./types` module doc comment) is still required. */
  logout: endpoint<void, void>({ method: HttpMethods.Post, path: "/auth/logout" }),
  /** No request body — same cookie-carried refresh token as `logout`. */
  refreshToken: endpoint<void, void>({ method: HttpMethods.Post, path: "/auth/refresh-token" }),
  forgotPassword: endpoint<ForgotPasswordRequest, void>({ method: HttpMethods.Post, path: "/auth/forgot-password" }),
  resendEmail: endpoint<ResendEmailRequest, void>({ method: HttpMethods.Post, path: "/auth/resend-email" }),
  /** Creates the account with its email unconfirmed and dispatches a verification email — issues no tokens, see `./types` module doc comment. */
  register: endpoint<RegisterRequest, void>({ method: HttpMethods.Post, path: "/auth/register" }),
  /** Completes the token-based email-verification link (`AuthEndpoints.resendEmail`/`Register`'s dispatched email). */
  confirmEmail: endpoint<ConfirmEmailRequest, void>({ method: HttpMethods.Post, path: "/auth/confirm-email" }),
} as const;
