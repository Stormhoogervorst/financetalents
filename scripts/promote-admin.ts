/**
 * Eenmalig (of idempotent) script om precies één account de rol 'admin'
 * te geven in public.profiles.
 *
 * Gebruik:
 *   npx tsx scripts/promote-admin.ts
 *   npx tsx scripts/promote-admin.ts ander@email.nl
 *
 * Werking:
 *   1. Alle bestaande admins worden gedemoveerd naar 'job_seeker'
 *      (compat met de single-admin partial unique index).
 *   2. Het target-account wordt op 'admin' gezet.
 *
 * Vereist in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// ── Load .env.local ─────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const DEFAULT_EMAIL = "stormhoogervorst2@gmail.com";
const TARGET_EMAIL = (process.argv[2] ?? DEFAULT_EMAIL).trim().toLowerCase();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\nPromoting ${TARGET_EMAIL} to admin…\n`);

  // ── 1. Bevestig dat het account bestaat ──────────────────────────────────
  const { data: target, error: lookupErr } = await supabase
    .from("profiles")
    .select("id, email, role")
    .ilike("email", TARGET_EMAIL)
    .maybeSingle();

  if (lookupErr) {
    console.error("Lookup failed:", lookupErr.message);
    process.exit(1);
  }

  if (!target) {
    console.error(`No profile found for ${TARGET_EMAIL}.`);
    console.error("Registreer het account eerst via /register en draai dit script opnieuw.");
    process.exit(1);
  }

  console.log(`Found profile: id=${target.id} current role=${target.role}`);

  if (target.role === "admin") {
    console.log("Dit account heeft al de rol 'admin'. Klaar.");
    return;
  }

  // ── 2. Demoot eventuele bestaande admins ─────────────────────────────────
  // Veilig bij de partial unique index `profiles_single_admin_idx`:
  // de index staat maar één admin-rij toe, dus we moeten eerst schoonvegen.
  const { data: existingAdmins, error: fetchAdminsErr } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("role", "admin");

  if (fetchAdminsErr) {
    console.error("Failed to list existing admins:", fetchAdminsErr.message);
    process.exit(1);
  }

  if (existingAdmins && existingAdmins.length > 0) {
    console.log(`Demoting ${existingAdmins.length} existing admin(s):`);
    for (const a of existingAdmins) console.log(`  - ${a.email} (${a.id})`);

    const { error: demoteErr } = await supabase
      .from("profiles")
      .update({ role: "job_seeker" })
      .eq("role", "admin");

    if (demoteErr) {
      console.error("Demote failed:", demoteErr.message);
      process.exit(1);
    }
  } else {
    console.log("No existing admins to demote.");
  }

  // ── 3. Promoveer het target ──────────────────────────────────────────────
  const { data: updated, error: promoteErr } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", target.id)
    .select("id, email, role")
    .maybeSingle();

  if (promoteErr) {
    console.error("Promote failed:", promoteErr.message);
    process.exit(1);
  }

  console.log(`\n✔ Promoted ${updated?.email} to role=${updated?.role}`);
  console.log("\nVolgende stap: log in op /login en ga naar /admin.\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
