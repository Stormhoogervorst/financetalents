"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LOGIN_ROUTE,
  handleClientAuthError,
  isRefreshTokenError,
} from "@/lib/supabase/auth-errors";

const PROTECTED_PREFIXES = [
  "/portal",
  "/admin",
  "/dashboard",
  "/update-password",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

/**
 * Global auth state listener. Mounted once in the root layout.
 *
 * Responsibilities:
 *   - On mount, surface stale/invalid refresh tokens stuck in localStorage.
 *   - Listen for TOKEN_REFRESHED with no session → broken rotation, recover.
 *   - Listen for SIGNED_OUT → bounce to /login if on a protected route.
 *
 * /admin/login uses /admin specifically; we still send admins to /login
 * if they get signed out, because middleware will then redirect them to
 * /admin/login when they next visit /admin. Keeping a single recovery
 * destination avoids ambiguity.
 */
export default function AuthListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ error }) => {
      if (error && isRefreshTokenError(error)) {
        void handleClientAuthError(supabase);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && !session) {
        void handleClientAuthError(supabase);
        return;
      }
      if (event === "SIGNED_OUT") {
        if (isProtected(pathname ?? "")) {
          router.replace(LOGIN_ROUTE);
        } else {
          router.refresh();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  return null;
}
