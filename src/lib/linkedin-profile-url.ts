const PUBLIC_LINKEDIN_IN_PREFIX = "https://www.linkedin.com/in/";

function isLinkedInHostname(host: string): boolean {
  const h = host.toLowerCase();
  return (
    h === "linkedin.com" ||
    h === "www.linkedin.com" ||
    h.endsWith(".linkedin.com")
  );
}

/**
 * Verwijdert query en hash en zet om naar https://www.linkedin.com/in/<slug>/
 * zolang de invoer als LinkedIn-profiel-URL te parsen is. Anders de getrimde ruwe string
 * (zodat typen in het veld niet wordt verstoord).
 */
export function sanitizeLinkedInProfileUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  try {
    const url = new URL(t.startsWith("http") ? t : `https://${t}`);
    if (!isLinkedInHostname(url.hostname)) return t;
    const path = url.pathname.replace(/\/+/g, "/");
    const match = path.match(/^\/in\/([^/]+)\/?$/);
    if (!match?.[1]) return t;
    return `${PUBLIC_LINKEDIN_IN_PREFIX}${match[1]}/`;
  } catch {
    return t;
  }
}

export function isValidLinkedInInUrl(url: string): boolean {
  const s = url.trim();
  if (!s.startsWith(PUBLIC_LINKEDIN_IN_PREFIX)) return false;
  const rest = s.slice(PUBLIC_LINKEDIN_IN_PREFIX.length).replace(/\/+$/, "");
  return rest.length > 0;
}

/** Voor href/tekst in het portaal: best-effort opschonen van bestaande DB-waarden. */
export function toPublicLinkedInProfileUrl(
  url: string | null | undefined
): string | null {
  if (!url?.trim()) return null;
  const s = sanitizeLinkedInProfileUrl(url);
  return isValidLinkedInInUrl(s) ? s : url.trim();
}
