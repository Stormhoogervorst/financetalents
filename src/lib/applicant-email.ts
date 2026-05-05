/**
 * LinkedIn applicants who don't share their email address get a
 * placeholder address in the format: `linkedin+<slug>@finance-talents.com`.
 * See `src/app/api/auth/linkedin-apply/auto/route.ts`.
 */
const LINKEDIN_PLACEHOLDER_EMAIL_REGEX =
  /^linkedin\+[^@]+@finance-talents\.com$/i;

export function isLinkedInPlaceholderEmail(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  return LINKEDIN_PLACEHOLDER_EMAIL_REGEX.test(email.trim());
}
