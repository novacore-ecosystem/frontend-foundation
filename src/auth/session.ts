import type { Locale, TranslationBundle } from "../i18n";
import { translateError } from "../errors/translation";
import { HttpError } from "../http/error";
import type { HttpClient } from "../http/client";
import { UserEndpoints } from "../user/endpoints";
import { AuthEndpoints } from "./endpoints";
import type { AuthSession, LoginRequest } from "./types";

export type AuthSessionStatus = "unknown" | "authenticated" | "unauthenticated";

export interface AuthSessionState {
  /** `unknown` until the first `login`/`refreshToken`/`restore` settles — lets a UI avoid flashing a guest state for a returning user. */
  status: AuthSessionStatus;
  session: AuthSession | null;
  /** `true` while a `login`/`logout`/`refreshToken` call is in flight. */
  loading: boolean;
  /** Localized (via `translateError`) message of the most recent failure — never a raw backend code. */
  error: string | null;
}

export type AuthSessionListener = (state: AuthSessionState) => void;

export interface AuthSessionControllerOptions {
  httpClient: HttpClient;
  /** Read at failure time, so a locale/tenant-translation change is picked up without recreating the controller. */
  getErrorTranslationOptions?: () => { locale?: Locale; tenantOverrides?: TranslationBundle };
  /** Called after a successful `login`/`refreshToken` with the tenant's current Bootstrap Version (`null` for Root) — wire to `BootstrapRefreshCoordinator.refreshBootstrap`. */
  onBootstrapVersion?: (version: number | null) => void;
}

function toTranslatableError(err: unknown): { messageCode?: string | null; message?: string } {
  if (err instanceof HttpError) return { messageCode: err.code, message: err.message };
  if (err instanceof Error) return { message: err.message };
  return { message: String(err) };
}

/**
 * Framework-agnostic session lifecycle for the platform's cookie-based auth — the same flow
 * `@novacore/frontend-next-shadcn`'s `useAuth` implements (`AuthEndpoints.login`/`logout`/
 * `refreshToken`, then `UserEndpoints.getMe` for who the cookie session belongs to), exposed as a
 * subscribable store (same pub/sub shape as `BootstrapRefreshCoordinator`) so non-shadcn apps
 * (e.g. the MUI landing site) can share it without depending on the shadcn package. Bind it to
 * React with `useSyncExternalStore(controller.subscribe, controller.getState)`.
 *
 * `HttpClient` must be configured with `withCredentials: true` and the per-deployment
 * `X-Tenant-Client-Key`/`X-App-Key` default headers — see `AuthEndpoints`'s module doc comment.
 */
export class AuthSessionController {
  private state: AuthSessionState = { status: "unknown", session: null, loading: false, error: null };
  private readonly listeners = new Set<AuthSessionListener>();

  constructor(private readonly options: AuthSessionControllerOptions) {}

  /** Stable between changes (a new object only when state actually changes) — safe for `useSyncExternalStore`. */
  readonly getState = (): AuthSessionState => this.state;

  readonly subscribe = (listener: AuthSessionListener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private setState(patch: Partial<AuthSessionState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener(this.state);
  }

  private fail(err: unknown): void {
    const { getErrorTranslationOptions } = this.options;
    this.setState({ error: translateError(toTranslatableError(err), getErrorTranslationOptions?.()) });
  }

  private async loadSession(): Promise<AuthSession> {
    const user = await this.options.httpClient.execute(UserEndpoints.getMe);
    const session: AuthSession = { user };
    this.setState({ status: "authenticated", session });
    return session;
  }

  clearError(): void {
    this.setState({ error: null });
  }

  async login(request: LoginRequest): Promise<AuthSession | null> {
    this.setState({ loading: true, error: null });
    try {
      const { version } = await this.options.httpClient.execute(AuthEndpoints.login, request);
      this.options.onBootstrapVersion?.(version);
      return await this.loadSession();
    } catch (err) {
      this.fail(err);
      return null;
    } finally {
      this.setState({ loading: false });
    }
  }

  /** Resolves `true` on success (including "already logged out"), `false` on failure — check `error`. */
  async logout(): Promise<boolean> {
    this.setState({ loading: true, error: null });
    try {
      await this.options.httpClient.execute(AuthEndpoints.logout);
      this.setState({ status: "unauthenticated", session: null });
      return true;
    } catch (err) {
      this.fail(err);
      return false;
    } finally {
      this.setState({ loading: false });
    }
  }

  /** Refreshes the cookie pair then loads the profile. Never throws; a failure resolves the session to signed-out. */
  async refreshToken(): Promise<AuthSession | null> {
    this.setState({ loading: true, error: null });
    try {
      const { version } = await this.options.httpClient.execute(AuthEndpoints.refreshToken);
      this.options.onBootstrapVersion?.(version);
      return await this.loadSession();
    } catch {
      this.setState({ status: "unauthenticated", session: null });
      return null;
    } finally {
      this.setState({ loading: false });
    }
  }

  /** Marks a known guest (no auth cookies at all) as signed-out without any network call. */
  markGuest(): void {
    if (this.state.status === "unknown") this.setState({ status: "unauthenticated" });
  }

  /**
   * Resumes a session on page load from the cookie hint (`buildInitialAuthState`): no cookies at
   * all -> guest with no network call; an expired/absent access token -> refresh first; otherwise
   * just load the profile (no token rotation on every page view).
   */
  async restore(hint: { hasAccessToken: boolean; hasRefreshToken: boolean; needsRefresh: boolean }): Promise<void> {
    if (!hint.hasAccessToken && !hint.hasRefreshToken) {
      this.markGuest();
      return;
    }
    if (hint.needsRefresh) {
      await this.refreshToken();
      return;
    }
    try {
      await this.loadSession();
    } catch {
      this.setState({ status: "unauthenticated", session: null });
    }
  }
}

export function createAuthSessionController(options: AuthSessionControllerOptions): AuthSessionController {
  return new AuthSessionController(options);
}
