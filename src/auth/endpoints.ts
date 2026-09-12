import { endpoint } from "../http/endpoint";
import { HttpMethods } from "../http/types";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResendEmailRequest,
} from "./types";

/**
 * Typed `EndpointDefinition`s for the platform's authentication flows —
 * declared once via `endpoint()` (`../http/endpoint`) so every consuming
 * application executes them the same way (`httpClient.execute(AuthEndpoints.login, request)`)
 * instead of hand-writing `axios.post("/auth/login", ...)` per app. See
 * `./types`'s doc comment for the "forward-looking, not yet
 * backend-audited" caveat on the paths below — adjust them here, once,
 * when the real Auth service is confirmed, rather than in every
 * consuming application's own hand-rolled client.
 */
export const AuthEndpoints = {
  login: endpoint<LoginRequest, LoginResponse>({ method: HttpMethods.Post, path: "/auth/login" }),
  logout: endpoint<LogoutRequest, void>({ method: HttpMethods.Post, path: "/auth/logout" }),
  refreshToken: endpoint<RefreshTokenRequest, RefreshTokenResponse>({ method: HttpMethods.Post, path: "/auth/refresh-token" }),
  forgotPassword: endpoint<ForgotPasswordRequest, void>({ method: HttpMethods.Post, path: "/auth/forgot-password" }),
  resendEmail: endpoint<ResendEmailRequest, void>({ method: HttpMethods.Post, path: "/auth/resend-email" }),
  register: endpoint<RegisterRequest, RegisterResponse>({ method: HttpMethods.Post, path: "/auth/register" }),
} as const;
