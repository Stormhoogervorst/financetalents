/**
 * Canonical site URL — single source of truth.
 *
 * Used for canonicals, OG URLs, sitemap entries and JSON-LD `url` fields.
 * Set `NEXT_PUBLIC_SITE_URL` in .env.local for dev/preview overrides.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.finance-talents.com";
