/**
 * Data-migratie: hernoem legacy-waardes in jobs.practice_area en
 * firms.practice_areas naar de canonieke lijst uit
 * `src/lib/constants/rechtsgebieden.ts`.
 *
 *   "Onroerend goed"            → "Vastgoedrecht"
 *   "Personen- en familierecht" → "Familierecht"
 *
 * Idempotent: tweede run is no-op. Werkt via PostgREST (supabase-js) met
 * de service-role key — geen psql/CLI nodig. Atomic over de hele run is
 * het níet, dus we doen expliciete before/after verificatie en printen
 * elke wijziging.
 *
 * Gebruik:
 *   npx tsx scripts/migrate-rechtsgebieden-rename.ts            # dry-run
 *   npx tsx scripts/migrate-rechtsgebieden-rename.ts --apply    # echt schrijven
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const APPLY = process.argv.includes("--apply");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Mapping ─────────────────────────────────────────────────────────────────

const RENAMES: ReadonlyArray<[string, string]> = [
  ["Onroerend goed", "Vastgoedrecht"],
  ["Personen- en familierecht", "Familierecht"],
];

const LEGACY_VALUES = RENAMES.map(([from]) => from);

function renameOne(area: string): string {
  for (const [from, to] of RENAMES) {
    if (area === from) return to;
  }
  return area;
}

/** Dedupe terwijl de originele volgorde bewaard blijft. */
function dedupePreserveOrder(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of arr) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

// ── Migratie: jobs.practice_area ────────────────────────────────────────────

async function migrateJobs() {
  console.log("\n── jobs.practice_area ──");

  const { data: legacyJobs, error } = await supabase
    .from("jobs")
    .select("id, title, practice_area")
    .in("practice_area", LEGACY_VALUES);

  if (error) {
    console.error("  Lookup failed:", error.message);
    process.exit(1);
  }

  if (!legacyJobs || legacyJobs.length === 0) {
    console.log("  Geen legacy-rijen. Niets te doen.");
    return 0;
  }

  console.log(`  ${legacyJobs.length} rij(en) aan te passen:`);
  for (const j of legacyJobs) {
    const newArea = renameOne(j.practice_area);
    console.log(
      `    [${j.id.slice(0, 8)}…] "${j.title}": ${j.practice_area} → ${newArea}`,
    );
  }

  if (!APPLY) return legacyJobs.length;

  let updated = 0;
  for (const [from, to] of RENAMES) {
    const { error: updErr, count } = await supabase
      .from("jobs")
      .update({ practice_area: to }, { count: "exact" })
      .eq("practice_area", from);

    if (updErr) {
      console.error(`  Update "${from}" → "${to}" failed:`, updErr.message);
      process.exit(1);
    }
    if (count && count > 0) {
      console.log(`  ✔ ${count} rij(en) "${from}" → "${to}"`);
      updated += count;
    }
  }
  return updated;
}

// ── Migratie: firms.practice_areas (text[]) ─────────────────────────────────

async function migrateFirms() {
  console.log("\n── firms.practice_areas ──");

  // `overlaps` = PostgREST `&&` operator.
  const { data: legacyFirms, error } = await supabase
    .from("firms")
    .select("id, name, practice_areas")
    .overlaps("practice_areas", LEGACY_VALUES);

  if (error) {
    console.error("  Lookup failed:", error.message);
    process.exit(1);
  }

  if (!legacyFirms || legacyFirms.length === 0) {
    console.log("  Geen legacy-rijen. Niets te doen.");
    return 0;
  }

  console.log(`  ${legacyFirms.length} firm(s) aan te passen:`);

  const plans: Array<{ id: string; name: string; next: string[] }> = [];
  for (const f of legacyFirms) {
    const current: string[] = Array.isArray(f.practice_areas)
      ? f.practice_areas
      : [];
    const renamed = current.map(renameOne);
    const next = dedupePreserveOrder(renamed);
    console.log(`    [${f.id.slice(0, 8)}…] "${f.name}"`);
    console.log(`       voor:  ${JSON.stringify(current)}`);
    console.log(`       na:    ${JSON.stringify(next)}`);
    plans.push({ id: f.id, name: f.name, next });
  }

  if (!APPLY) return plans.length;

  let updated = 0;
  for (const p of plans) {
    const { error: updErr } = await supabase
      .from("firms")
      .update({ practice_areas: p.next })
      .eq("id", p.id);

    if (updErr) {
      console.error(`  Update firm ${p.id} failed:`, updErr.message);
      process.exit(1);
    }
    console.log(`  ✔ firm ${p.id.slice(0, 8)}… (${p.name}) geüpdatet`);
    updated += 1;
  }
  return updated;
}

// ── Verificatie ─────────────────────────────────────────────────────────────

async function verify() {
  console.log("\n── Verificatie ──");

  const { count: jobCount, error: jobErr } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .in("practice_area", LEGACY_VALUES);

  if (jobErr) {
    console.error("  Jobs verify failed:", jobErr.message);
    process.exit(1);
  }

  const { count: firmCount, error: firmErr } = await supabase
    .from("firms")
    .select("*", { count: "exact", head: true })
    .overlaps("practice_areas", LEGACY_VALUES);

  if (firmErr) {
    console.error("  Firms verify failed:", firmErr.message);
    process.exit(1);
  }

  console.log(`  jobs met legacy practice_area:   ${jobCount ?? 0}`);
  console.log(`  firms met legacy practice_areas: ${firmCount ?? 0}`);

  if ((jobCount ?? 0) > 0 || (firmCount ?? 0) > 0) {
    console.error("\n✘ Er staan nog legacy-waardes. Iets is misgegaan.");
    process.exit(1);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Rechtsgebieden-rename migratie");
  console.log(`  Mode: ${APPLY ? "APPLY (schrijft naar DB)" : "DRY-RUN (geen writes)"}`);

  const jobsCount = await migrateJobs();
  const firmsCount = await migrateFirms();

  if (APPLY) {
    await verify();
    console.log(
      `\n✔ Klaar. ${jobsCount} job-rij(en) + ${firmsCount} firm(s) aangepast.`,
    );
  } else {
    console.log(
      `\nDry-run: ${jobsCount} job-rij(en) + ${firmsCount} firm(s) zouden wijzigen.`,
    );
    console.log("Run met --apply om daadwerkelijk te schrijven.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
