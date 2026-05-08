import type { AuthError } from "@supabase/supabase-js";

/**
 * Centralized handling for Supabase "Invalid Refresh Token" failures.
 *
 * Background:
 *   When a refresh token is missing, expired, or already used (token
 *   rotation), Supabase throws an AuthApiError with messages like
 *   "Refresh Token Not Found" or "Invalid Refresh Token". Bubbling this
 *   raw error to the UI is bad UX. The helpers below detect that error
 *   class and recover by clearing the local session and redirecting to
 *   the login route.
 */

const REFRESH_TOKEN_PATTERNS = [
  "refresh token not found",
  "invalid refresh token",
  "refresh_token_not_found",
  "refresh_token_already_used",
];

export const LOGIN_ROUTE = "/login";

export function isRefreshTokenError(error: unknown): boolean {
  if (!error) return false;
  const message =
    typeof error === "string"
      ? error
      : (error as { message?: string })?.message ?? "";
  const code = (error as { code?: string })?.code ?? "";
  const haystack = `${message} ${code}`.toLowerCase();
  return REFRESH_TOKEN_PATTERNS.some((p) => haystack.includes(p));
}

type SignOutFn = (opts?: {
  scope?: "local" | "global" | "others";
}) => Promise<unknown>;

type AnySupabase = {
  auth: {
    getUser: () => Promise<{
      data: { user: unknown };
      error: AuthError | null;
    }>;
    getSession: () => Promise<{
      data: { session: unknown };
      error: AuthError | null;
    }>;
    signOut: SignOutFn;
  };
};

/**
 * Browser-side recovery: clear localStorage session and redirect to /login,
 * preserving the current path so the user can be returned post-login.
 */
export async function handleClientAuthError(
  supabase: { auth: { signOut: SignOutFn } },
  redirectTo: string = LOGIN_ROUTE
): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Already broken — best effort.
  }
  if (typeof window !== "undefined") {
    const next = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    window.location.replace(`${redirectTo}?redirectTo=${next}`);
  }
}

/**
 * Safe wrapper around supabase.auth.getUser(). Returns { user: null } when
 * the refresh token is invalid (instead of throwing) and clears the broken
 * local session so subsequent calls in the same request don't keep failing.
 */
export async function safeGetUser<T extends AnySupabase>(
  supabase: T
): Promise<{ user: unknown | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (isRefreshTokenError(error)) {
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch {}
        return { user: null, error: null };
      }
      return { user: null, error };
    }
    return { user: data.user, error: null };
  } catch (e) {
    if (isRefreshTokenError(e)) {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {}
      return { user: null, error: null };
    }
    throw e;
  }
}

export async function safeGetSession<T extends AnySupabase>(
  supabase: T
): Promise<{ session: unknown | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      if (isRefreshTokenError(error)) {
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch {}
        return { session: null, error: null };
      }
      return { session: null, error };
    }
    return { session: data.session, error: null };
  } catch (e) {
    if (isRefreshTokenError(e)) {
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {}
      return { session: null, error: null };
    }
    throw e;
  }
}
