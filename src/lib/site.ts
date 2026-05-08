/**
 * Canonical site URL — single source of truth.
 *
 * Two flavours, on purpose:
 *
 *   - `SITE_URL`    — forgiving. Has a sane production fallback so server
 *                     rendering of canonicals, OG tags, sitemaps and JSON-LD
 *                     never fails when the env var is absent.
 *
 *   - `getSiteUrl()` — strict. Throws if `NEXT_PUBLIC_SITE_URL` is not set.
 *                     Use this everywhere we build URLs that get embedded in
 *                     emails or external redirects (Supabase auth callbacks,
 *                     OAuth redirects). Failing loudly is better than
 *                     silently shipping `undefined/auth/callback...` in a
 *                     reset password email.
 *
 * Set `NEXT_PUBLIC_SITE_URL` in `.env.local` for dev/preview overrides and
 * in Vercel for every deployment environment.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.finance-talents.nl";

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set. Auth redirect URLs require this " +
        "to be configured in .env.local and on every Vercel environment " +
        "(Production / Preview / Development)."
    );
  }
  return url.replace(/\/$/, "");
}
