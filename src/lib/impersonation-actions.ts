"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IMPERSONATION_COOKIE } from "./impersonation";

const COOKIE_MAX_AGE = 60 * 60 * 8;

/**
 * Start een impersonatie-sessie: zet een beveiligde cookie met de firm_id
 * van de werkgever, en stuur de admin door naar het werkgevers-dashboard.
 * De admin blijft ingelogd als zichzelf — de cookie werkt als overlay.
 */
export async function impersonateEmployerAction(formData: FormData) {
  const employerId = String(formData.get("employerId") ?? "").trim();
  if (!employerId) throw new Error("Geen werkgever geselecteerd.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/?error=unauthorized");
  }

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE, employerId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect("/portal");
}

/**
 * Beëindig impersonatie en stuur terug naar het admin-portaal.
 */
export async function stopImpersonationAction() {
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATION_COOKIE);
  redirect("/admin");
}
