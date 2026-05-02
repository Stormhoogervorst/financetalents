import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { cityLocationFilter, isValidCity } from "@/lib/cities";

const STAGE_TYPE_VALUES = ["stage", "internship", "student", "Studentbaan"];

type CountOptions = {
  /** When true, only count jobs whose `type` falls within the stage buckets. */
  stagesOnly?: boolean;
};

/**
 * Returns the number of active jobs for a given city.
 *
 * Wrapped in React's `cache` so `generateMetadata` and the page component
 * share a single Supabase round-trip per request (per unique argument set).
 *
 * Uses `{ count: "exact", head: true }` so Postgres only has to return the
 * count, not the row payloads — cheap even if a city grows large.
 */
export const getCityJobCount = cache(
  async (citySlug: string, options: CountOptions = {}): Promise<number> => {
    if (!isValidCity(citySlug)) return 0;

    const supabase = await createClient();

    let query = supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .ilike("location", cityLocationFilter(citySlug));

    if (options.stagesOnly) {
      query = query.in("type", STAGE_TYPE_VALUES);
    }

    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  }
);
