import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import VacancyCard from "@/components/VacancyCard";
import RadiusSelect from "@/components/RadiusSelect";
import { Vacancy, EmploymentType, ExperienceLevel } from "@/types";
import { Search, SlidersHorizontal, Wifi } from "lucide-react";
import { employmentTypeLabels, experienceLevelLabels } from "@/lib/utils";
import { geocodeCity } from "@/lib/geocode";

interface SearchParams {
  q?: string;
  type?: EmploymentType;
  level?: ExperienceLevel;
  remote?: string;
  location?: string;
  radius?: string;
}

export default async function VacanciesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const radiusKm = parseInt(params.radius ?? "0", 10) || 0;
  const useGeo = !!(params.location && radiusKm > 0);
  const geo = useGeo ? await geocodeCity(params.location!) : null;

  let vacancies: Vacancy[] | null = null;

  if (geo && useGeo) {
    const { data: geoRows } = await supabase.rpc("get_vacancies_in_radius", {
      lat: geo.lat,
      lng: geo.lng,
      radius_km: radiusKm,
      vacancy_status: "open",
    });

    const nearbyIds = ((geoRows ?? []) as { id: string }[]).map((v) => v.id);

    if (nearbyIds.length > 0) {
      let geoQuery = supabase
        .from("vacancies")
        .select("*")
        .in("id", nearbyIds);

      if (params.q) {
        geoQuery = geoQuery.or(
          `title.ilike.%${params.q}%,company_name.ilike.%${params.q}%,description.ilike.%${params.q}%`
        );
      }
      if (params.type) geoQuery = geoQuery.eq("employment_type", params.type);
      if (params.level) geoQuery = geoQuery.eq("experience_level", params.level);
      if (params.remote === "true") geoQuery = geoQuery.eq("remote", true);

      const { data } = await geoQuery;
      const dataMap = new Map((data ?? []).map((v) => [v.id, v]));
      vacancies = nearbyIds
        .map((id) => dataMap.get(id))
        .filter(Boolean) as Vacancy[];
    } else {
      vacancies = [];
    }
  } else {
    let query = supabase
      .from("vacancies")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (params.q) {
      query = query.or(
        `title.ilike.%${params.q}%,company_name.ilike.%${params.q}%,description.ilike.%${params.q}%`
      );
    }
    if (params.type) query = query.eq("employment_type", params.type);
    if (params.level) query = query.eq("experience_level", params.level);
    if (params.remote === "true") query = query.eq("remote", true);
    if (params.location) query = query.ilike("location", `%${params.location}%`);

    const { data } = await query;
    vacancies = data;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="bg-brand-700 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Browse Vacancies</h1>

          {/* Search bar */}
          <form method="GET" className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                name="q"
                defaultValue={params.q}
                placeholder="Job title, company, or keyword…"
                className="input pl-9 h-11 w-full"
              />
            </div>
            <button type="submit" className="btn-primary bg-white text-brand-700 hover:bg-brand-50 h-11">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full flex gap-8">
        {/* Filters sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <form method="GET" className="card p-5 space-y-6 sticky top-24">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>

            <input type="hidden" name="q" value={params.q ?? ""} />

            <div>
              <label className="label">Employment type</label>
              <select name="type" defaultValue={params.type ?? ""} className="input text-sm">
                <option value="">All types</option>
                {(Object.entries(employmentTypeLabels) as [EmploymentType, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Experience level</label>
              <select name="level" defaultValue={params.level ?? ""} className="input text-sm">
                <option value="">All levels</option>
                {(Object.entries(experienceLevelLabels) as [ExperienceLevel, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Location</label>
              <input
                id="filter-location"
                name="location"
                defaultValue={params.location ?? ""}
                placeholder="e.g. Amsterdam"
                className="input text-sm"
              />
            </div>

            <div>
              <label className="label">Radius</label>
              <RadiusSelect
                name="radius"
                defaultValue={params.radius ?? "0"}
                locationInputId="filter-location"
                className="input text-sm cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
              <input
                type="checkbox"
                name="remote"
                value="true"
                defaultChecked={params.remote === "true"}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <Wifi className="h-4 w-4 text-purple-500" /> Remote only
            </label>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 text-sm">Apply</button>
              <a href="/vacancies" className="btn-secondary flex-1 text-sm text-center">Reset</a>
            </div>
          </form>
        </aside>

        {/* Results */}
        <main className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 mb-4">
            {vacancies?.length ?? 0} {vacancies?.length === 1 ? "vacancy" : "vacancies"} found
          </p>

          {vacancies && vacancies.length > 0 ? (
            <div className="space-y-4">
              {vacancies.map((v: Vacancy) => (
                <VacancyCard key={v.id} vacancy={v} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <Search className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No vacancies found</h3>
              <p className="text-sm text-gray-400 mt-1">Try different keywords or filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
