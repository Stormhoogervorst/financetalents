/**
 * Backfill latitude/longitude for all jobs and vacancies that don't have
 * coordinates yet.
 *
 * Usage:
 *   npx tsx scripts/backfill-geo.ts
 *
 * Requires the following env vars (reads .env.local automatically):
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Nominatim geocoder ──────────────────────────────────────────────────────

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

interface GeoResult {
  lat: number;
  lng: number;
}

async function geocode(location: string): Promise<GeoResult | null> {
  const url = new URL(NOMINATIM);
  url.searchParams.set("q", location.trim());
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "nl");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "LegalTalents-Backfill/1.0" },
  });

  if (!res.ok) return null;

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Backfill logic ──────────────────────────────────────────────────────────

async function backfillTable(table: "jobs" | "vacancies") {
  console.log(`\n── Backfilling ${table} ──`);

  const { data: rows, error } = await supabase
    .from(table)
    .select("id, location")
    .or("latitude.is.null,longitude.is.null");

  if (error) {
    console.error(`  Error fetching ${table}:`, error.message);
    return;
  }

  if (!rows || rows.length === 0) {
    console.log(`  All ${table} already have coordinates. Nothing to do.`);
    return;
  }

  console.log(`  Found ${rows.length} ${table} without coordinates.`);

  let updated = 0;
  let failed = 0;

  for (const row of rows) {
    const loc = (row.location ?? "").trim();
    if (!loc) {
      console.log(`  [${row.id}] Empty location — skipping`);
      failed++;
      continue;
    }

    const geo = await geocode(loc);

    if (!geo) {
      console.log(`  [${row.id}] Could not geocode "${loc}" — skipping`);
      failed++;
    } else {
      const { error: updateErr } = await supabase
        .from(table)
        .update({ latitude: geo.lat, longitude: geo.lng })
        .eq("id", row.id);

      if (updateErr) {
        console.error(`  [${row.id}] Update failed:`, updateErr.message);
        failed++;
      } else {
        console.log(
          `  [${row.id}] "${loc}" → (${geo.lat}, ${geo.lng})`
        );
        updated++;
      }
    }

    // Nominatim rate limit: max 1 request/second
    await sleep(1100);
  }

  console.log(`  Done: ${updated} updated, ${failed} failed/skipped.`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Starting geo backfill…");
  await backfillTable("jobs");
  await backfillTable("vacancies");
  console.log("\nBackfill complete.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
