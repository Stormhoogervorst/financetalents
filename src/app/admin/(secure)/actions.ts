"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Sign out vanuit het admin-portaal en stuur door naar /admin/login.
 * Bewust géén shared logout met het werkgevers-portaal: het admin-portaal
 * heeft een eigen "voordeur" en mag onafhankelijk leven.
 */
export async function adminSignOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
