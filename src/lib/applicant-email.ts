/**
 * LinkedIn-sollicitanten die hun e-mailadres niet delen krijgen een
 * placeholder-adres in het formaat: `linkedin+<slug>@legal-talents.nl`.
 * Zie `src/app/api/auth/linkedin-apply/auto/route.ts`.
 */
const LINKEDIN_PLACEHOLDER_EMAIL_REGEX =
  /^linkedin\+[^@]+@legal-talents\.nl$/i;

export function isLinkedInPlaceholderEmail(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  return LINKEDIN_PLACEHOLDER_EMAIL_REGEX.test(email.trim());
}
