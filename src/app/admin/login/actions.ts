"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Geheim, hardcoded "bootstrap"-adres voor de allereerste Super Admin.
 * Override mogelijk via .env: ADMIN_BOOTSTRAP_EMAIL=...
 *
 * Logica:
 *   1. Wordt er ingelogd met dit adres en het account bestaat nog NIET in
 *      Supabase Auth → maak het direct aan met het ingevulde wachtwoord en
 *      forceer rol = 'admin'. Andere admins worden eerst gedemoot wegens de
 *      partial unique index `profiles_single_admin_idx`.
 *   2. Bestaat het account al → normaal inloggen. Als de profile-rij om
 *      welke reden dan ook niet 'admin' is, repareer dat ook hier.
 */
const ADMIN_BOOTSTRAP_EMAIL = (
  process.env.ADMIN_BOOTSTRAP_EMAIL ?? "stormhoogervorst2@gmail.com"
)
  .trim()
  .toLowerCase();

export type AdminLoginState = {
  error: string | null;
};

export async function adminLoginAction(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Vul zowel e-mailadres als wachtwoord in." };
  }
  if (password.length < 8) {
    return { error: "Het wachtwoord moet minstens 8 tekens lang zijn." };
  }

  const admin = createAdminClient();

  // ── 1. Bootstrap-flow voor de geheime Super Admin ───────────────────────
  if (email === ADMIN_BOOTSTRAP_EMAIL) {
    const existingAuthUser = await findAuthUserByEmail(admin, email);

    if (!existingAuthUser) {
      // Demoot bestaande admins (single-admin index) en maak het account
      // direct aan met de juiste rol via raw_user_meta_data. De
      // handle_new_user trigger leest 'role' uit metadata.
      const { error: demoteErr } = await admin
        .from("profiles")
        .update({ role: "job_seeker" })
        .eq("role", "admin");
      if (demoteErr) {
        return { error: `Kon bestaande admins niet demoten: ${demoteErr.message}` };
      }

      const { error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: "admin", full_name: "Super Admin" },
      });
      if (createErr) {
        return { error: `Account aanmaken mislukt: ${createErr.message}` };
      }
    } else {
      // Account bestond al — zorg dat de rol klopt voordat we inloggen.
      const { data: profile } = await admin
        .from("profiles")
        .select("id, role")
        .eq("id", existingAuthUser.id)
        .maybeSingle();

      if (profile && profile.role !== "admin") {
        const { error: demoteErr } = await admin
          .from("profiles")
          .update({ role: "job_seeker" })
          .eq("role", "admin");
        if (demoteErr) {
          return {
            error: `Kon bestaande admins niet demoten: ${demoteErr.message}`,
          };
        }
        const { error: promoteErr } = await admin
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", profile.id);
        if (promoteErr) {
          return { error: `Promoveren tot admin mislukt: ${promoteErr.message}` };
        }
      }
    }
  }

  // ── 2. Echte inlog (zet auth-cookies via SSR client) ────────────────────
  const supabase = await createClient();
  const { data, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInErr || !data.user) {
    const isInvalid =
      signInErr?.message === "Invalid login credentials" ||
      signInErr?.status === 400;
    return {
      error: isInvalid
        ? "E-mailadres of wachtwoord is onjuist."
        : signInErr?.message ?? "Inloggen mislukt.",
    };
  }

  // ── 3. Verifieer admin-rol ──────────────────────────────────────────────
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return {
      error:
        "Dit account heeft geen admin-toegang. Gebruik je werkgevers-portaal via /login.",
    };
  }

  redirect("/admin");
}

/**
 * Zoekt een auth-user op e-mail via de service-role admin API. Supabase
 * biedt geen directe `getByEmail`, dus we paginneren `listUsers`.
 */
async function findAuthUserByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string
) {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;
    if (data.users.length < 200) break;
  }
  return null;
}
