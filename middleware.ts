import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      "unknown";

    if (!checkRateLimit(ip)) {
      return new NextResponse("Te veel verzoeken. Wacht een minuutje.", {
        status: 429,
      });
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the Supabase session — must be called on every request
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /admin/login is de publieke "geheime voordeur" voor de Super Admin.
  // Hier mag elke (niet-)bezoeker langs zonder role-check.
  const isAdminLogin =
    pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  // Resolve admin role once, only when a downstream branch needs it. The
  // profiles_self_read RLS policy (id = auth.uid()) allows this query with the
  // anon key + the user's session cookie — no service role needed here.
  const needsRoleLookup =
    !!user &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register"));

  let isAdmin = false;
  if (needsRoleLookup) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .maybeSingle();
    isAdmin = profile?.role === "admin";
  }

  // ── /admin guard ──────────────────────────────────────────────────────────
  // /admin/login zelf staat altijd open (de inlogpagina kan zichzelf nooit
  // dichtmaken). Een ingelogde admin die /admin/login bezoekt wordt
  // doorgestuurd naar /admin, een ingelogde non-admin naar de homepage.
  if (isAdminLogin) {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = isAdmin ? "/admin" : "/";
      url.search = "";
      if (!isAdmin) url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  } else if (pathname.startsWith("/admin")) {
    // Geen sessie → naar de admin-voordeur, NIET naar de werkgevers-login.
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    // Ingelogd maar geen admin → terug naar homepage met waarschuwing.
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  // Unauthenticated users cannot access /portal
  if (pathname.startsWith("/portal") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in users are sent away from auth pages.
  // Admins land on /admin, everyone else on /portal.
  // Explicitly excluded: the LinkedIn apply confirmation flow at
  // /vacature/[slug]/bevestig-linkedin so users arriving after OAuth
  // are never bounced away mid-application.
  const isApplyFlow =
    pathname.startsWith("/vacature/") &&
    pathname.includes("/bevestig-linkedin");
  if (
    user &&
    !isApplyFlow &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : "/portal";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
