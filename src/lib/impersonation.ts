import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const IMPERSONATION_COOKIE = "impersonation_firm_id";

/**
 * Returns the firm_id the current admin is impersonating, or null if there
 * is no impersonation in progress. We re-verify the admin role on every call
 * so a stale cookie on a non-admin session is safely ignored.
 */
export async function getImpersonatedFirmId(): Promise<string | null> {
  const cookieStore = await cookies();
  const firmId = cookieStore.get(IMPERSONATION_COOKIE)?.value;
  if (!firmId) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role === "admin" ? firmId : null;
}

/**
 * Resolves the "acting firm" for a portal page.
 *
 * - If an admin is impersonating a werkgever, returns that firm (via
 *   service-role client, so RLS never stands in the way of support).
 * - Otherwise falls back to the normal logic: first the firm owned by the
 *   current user, then any firm the user is linked to as team-member via
 *   profiles.firm_id.
 */
export async function getActingFirm<T = { id: string }>(
  select: string,
  userId: string
): Promise<{ firm: T | null; isImpersonating: boolean }> {
  const impersonatedId = await getImpersonatedFirmId();
  if (impersonatedId) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("firms")
      .select(select)
      .eq("id", impersonatedId)
      .maybeSingle();
    return { firm: (data as T | null) ?? null, isImpersonating: true };
  }

  const supabase = await createClient();
  const { data: owned } = await supabase
    .from("firms")
    .select(select)
    .eq("user_id", userId)
    .maybeSingle();
  if (owned) return { firm: owned as T, isImpersonating: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("firm_id")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.firm_id) {
    const admin = createAdminClient();
    const { data: teamFirm } = await admin
      .from("firms")
      .select(select)
      .eq("id", profile.firm_id)
      .maybeSingle();
    return { firm: (teamFirm as T | null) ?? null, isImpersonating: false };
  }

  return { firm: null, isImpersonating: false };
}
