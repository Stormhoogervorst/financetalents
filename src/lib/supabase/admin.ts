import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS. Only use server-side in API routes.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
