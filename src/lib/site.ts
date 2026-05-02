/**
 * Canonical site URL — single source of truth.
 *
 * Gebruikt voor canonicals, OG-URLs, sitemap entries en JSON-LD `url` velden.
 * Zet `NEXT_PUBLIC_SITE_URL` in .env.local voor dev/preview overrides.
 *
 * Het canonieke productiedomein is `https://www.legal-talents.nl`.
 * Alle andere varianten (apex, http://) worden via DNS/proxy geredirect.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.legal-talents.nl";
