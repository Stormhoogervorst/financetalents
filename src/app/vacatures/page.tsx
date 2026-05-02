import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import VacatureCard from "@/components/VacatureCard";
import RadiusSelect from "@/components/RadiusSelect";
import { Job, JobFirmPreview, JOB_TYPE_OPTIONS } from "@/types";
import { geocodeCity } from "@/lib/geocode";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { RECHTSGEBIEDEN } from "@/lib/constants/rechtsgebieden";

interface SearchParams {
  q?: string;
  locatie?: string;
  straal?: string;
  type?: string;
  rechtsgebied?: string;
  functie?: string;
}

export const revalidate = 0;

export const metadata = {
  title: "Vacatures",
  description:
    "Bekijk alle juridische vacatures, stages en studentbanen bij juridische werkgevers in Nederland.",
  alternates: {
    canonical: "/vacatures",
  },
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const fuzzy = (term: string) => term.trim().replace(/[\s\-]+/g, "%");

  const TYPE_ALIASES: Record<string, string[]> = {
    fulltime: ["fulltime", "full-time", "Voltijd"],
    parttime: ["parttime", "part-time", "Deeltijd"],
    "business-course": ["business-course", "lawcourse", "summer-course"],
    stage: ["stage", "internship", "student", "Studentbaan"],
  };

  const radiusKm = parseInt(params.straal ?? "0", 10) || 0;
  const useGeo = !!(params.locatie && radiusKm > 0);
  const geo = useGeo ? await geocodeCity(params.locatie!) : null;

  let jobs: Job[] | null = null;

  if (geo && useGeo) {
    const { data: geoJobs } = await supabase.rpc("get_jobs_in_radius", {
      lat: geo.lat,
      lng: geo.lng,
      radius_km: radiusKm,
      job_status: "active",
    });

    const nearbyIds = ((geoJobs ?? []) as { id: string }[]).map((j) => j.id);

    if (nearbyIds.length > 0) {
      let geoQuery = supabase
        .from("jobs")
        .select("*, firms ( name, logo_url, slug )")
        .in("id", nearbyIds);

      if (params.q) {
        const q = fuzzy(params.q);
        geoQuery = geoQuery.or(
          `title.ilike.%${q}%,practice_area.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`
        );
      }
      if (params.type) {
        const aliases = TYPE_ALIASES[params.type] ?? [params.type];
        geoQuery = geoQuery.in("type", aliases);
      }
      if (params.rechtsgebied) {
        geoQuery = geoQuery.ilike("practice_area", `%${params.rechtsgebied}%`);
      }
      if (params.functie) {
        geoQuery = geoQuery.ilike("title", `%${params.functie}%`);
      }

      const { data } = await geoQuery;
      const orderedIds = nearbyIds;
      const dataMap = new Map((data ?? []).map((j) => [j.id, j]));
      jobs = orderedIds
        .map((id) => dataMap.get(id))
        .filter(Boolean) as typeof data;
    } else {
      jobs = [];
    }
  } else {
    let query = supabase
      .from("jobs")
      .select("*, firms ( name, logo_url, slug )")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (params.q) {
      const q = fuzzy(params.q);
      query = query.or(
        `title.ilike.%${q}%,practice_area.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`
      );
    }
    if (params.locatie) {
      const loc = fuzzy(params.locatie);
      query = query.ilike("location", `%${loc}%`);
    }
    if (params.type) {
      const aliases = TYPE_ALIASES[params.type] ?? [params.type];
      query = query.in("type", aliases);
    }
    if (params.rechtsgebied) {
      query = query.ilike("practice_area", `%${params.rechtsgebied}%`);
    }
    if (params.functie) {
      query = query.ilike("title", `%${params.functie}%`);
    }

    const { data } = await query;
    jobs = data;
  }

  type JobWithFirm = Omit<Job, "firms"> & { firms: JobFirmPreview | null };
  const jobList = (jobs ?? []).map((j) => ({
    ...j,
    firms: Array.isArray(j.firms) ? (j.firms[0] ?? null) : (j.firms ?? null),
  })) as JobWithFirm[];

  const hasFilters = !!(
    params.q ||
    params.locatie ||
    params.type ||
    params.rechtsgebied ||
    params.functie ||
    (params.straal && params.straal !== "0")
  );

  const filterParts: string[] = [];
  if (params.functie) filterParts.push(params.functie);
  if (params.rechtsgebied) filterParts.push(params.rechtsgebied);
  const filterLabel = filterParts.length > 0 ? filterParts.join(" — ") : null;

  const headingText = filterLabel
    ? `${filterLabel} vacatures`
    : "Alle vacatures";

  const subtitleText = filterLabel
    ? `Bekijk alle actuele ${filterLabel.toLowerCase()} vacatures bij juridische werkgevers in Nederland.`
    : "Stages, studentbanen en startersfuncties bij de beste juridische werkgevers in Nederland.";

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <NavbarPublic variant="hero" />

      {/* Hero — mesh-gradient matching the homepage, fading seamlessly to white */}
      <div className="-mt-[4.25rem]">
        <section
          className="relative isolate overflow-hidden"
          style={{
            background: `linear-gradient(135deg,
              #4B3BD6 0%,
              #5668E8 22%,
              #7A8BF5 42%,
              #A8B6FF 62%,
              #C9D4FF 82%,
              #FFFFFF 100%)`,
          }}
        >
          {/* Layered radial gradients — soft "liquid" purple → blue wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(60% 55% at 50% 40%,
                  rgba(178, 140, 255, 0.65) 0%,
                  rgba(140, 120, 255, 0.30) 35%,
                  rgba(120, 150, 255, 0) 70%),
                radial-gradient(50% 60% at 50% 60%,
                  rgba(255, 255, 255, 0.45) 0%,
                  rgba(255, 255, 255, 0) 60%),
                radial-gradient(55% 70% at 96% 6%,
                  rgba(42, 20, 230, 0.80) 0%,
                  rgba(59, 44, 220, 0.35) 22%,
                  rgba(88, 125, 254, 0) 60%),
                radial-gradient(32% 38% at 2% 0%,
                  rgba(215, 168, 255, 0.85) 0%,
                  rgba(215, 168, 255, 0) 65%),
                radial-gradient(38% 45% at 10% 55%,
                  rgba(255, 255, 255, 0.55) 0%,
                  rgba(255, 255, 255, 0) 65%)
              `,
            }}
          />

          {/* Seamless fade to pure white at the bottom */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:h-56"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 55%, #FFFFFF 100%)",
            }}
          />

          <div
            className="max-w-[1400px] mx-auto relative"
            style={{
              padding:
                "calc(4.25rem + clamp(60px, 8vh, 120px)) clamp(24px, 5vw, 80px) clamp(80px, 10vh, 140px)",
            }}
          >
            <h1
              className="font-bold tracking-[-0.03em] leading-[1.05]"
              style={{
                fontSize: "clamp(48px, 6vw, 80px)",
                color: "#FFFFFF",
                textShadow: "0 1px 24px rgba(20, 24, 80, 0.25)",
              }}
            >
              {headingText}
            </h1>
            <p
              className="mt-6 leading-relaxed max-w-[640px]"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "#FFFFFF",
                opacity: 0.95,
                textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)",
              }}
            >
              {subtitleText}
            </p>

            {/* Deep-navy filter pill — matches the homepage hero search contrast */}
            <form method="GET" className="mt-10 max-w-[1100px]">
              <div
                className="flex flex-col md:flex-row items-stretch flex-wrap rounded-[28px] p-2 gap-2"
                style={{
                  background: "#0A0F3D",
                  boxShadow:
                    "0 20px 40px -18px rgba(10, 15, 61, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.10) inset",
                }}
              >
                {/* Search */}
                <label
                  htmlFor="filter-q"
                  className="flex items-center gap-2.5 flex-1 min-w-[220px] px-4 rounded-[22px]"
                >
                  <Search
                    className="h-4 w-4 shrink-0"
                    style={{ color: "rgba(255, 255, 255, 0.65)" }}
                  />
                  <input
                    id="filter-q"
                    name="q"
                    defaultValue={params.q ?? ""}
                    placeholder="Zoek op titel of trefwoord"
                    className="w-full bg-transparent border-none outline-none focus:outline-none py-3 text-[14px] text-white placeholder:text-white/55"
                  />
                </label>

                {/* Location */}
                <label
                  htmlFor="filter-locatie"
                  className="flex items-center gap-2.5 md:w-[170px] min-w-0 px-4 rounded-[22px] md:border-l border-white/10"
                >
                  <MapPin
                    className="h-4 w-4 shrink-0"
                    style={{ color: "rgba(255, 255, 255, 0.65)" }}
                  />
                  <input
                    id="filter-locatie"
                    name="locatie"
                    defaultValue={params.locatie ?? ""}
                    placeholder="Locatie"
                    className="w-full bg-transparent border-none outline-none focus:outline-none py-3 text-[14px] text-white placeholder:text-white/55"
                  />
                </label>

                {/* Radius — only shows when a location is entered */}
                <div className="flex items-center md:w-[110px] px-4 md:border-l border-white/10">
                  <RadiusSelect
                    name="straal"
                    defaultValue={params.straal ?? "0"}
                    locationInputId="filter-locatie"
                    className="w-full bg-transparent border-none outline-none focus:outline-none appearance-none py-3 text-[14px] text-white cursor-pointer"
                  />
                </div>

                {/* Type */}
                <label
                  htmlFor="filter-type"
                  className="relative flex items-center md:w-[160px] min-w-0 px-4 rounded-[22px] md:border-l border-white/10"
                >
                  <select
                    id="filter-type"
                    name="type"
                    defaultValue={params.type ?? ""}
                    className="w-full bg-transparent border-none outline-none focus:outline-none appearance-none py-3 text-[14px] text-white cursor-pointer pr-6"
                  >
                    <option value="" className="text-[#0A0F3D]">
                      Alle types
                    </option>
                    {JOB_TYPE_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value} className="text-[#0A0F3D]">
                        {label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="h-4 w-4 pointer-events-none absolute right-4"
                    style={{ color: "rgba(255, 255, 255, 0.55)" }}
                  />
                </label>

                {/* Practice area */}
                <label
                  htmlFor="filter-rechtsgebied"
                  className="relative flex items-center md:w-[210px] min-w-0 px-4 rounded-[22px] md:border-l border-white/10"
                >
                  <select
                    id="filter-rechtsgebied"
                    name="rechtsgebied"
                    defaultValue={params.rechtsgebied ?? ""}
                    className="w-full bg-transparent border-none outline-none focus:outline-none appearance-none py-3 text-[14px] text-white cursor-pointer pr-6"
                  >
                    <option value="" className="text-[#0A0F3D]">
                      Alle rechtsgebieden
                    </option>
                    {RECHTSGEBIEDEN.map((area) => (
                      <option key={area} value={area} className="text-[#0A0F3D]">
                        {area}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="h-4 w-4 pointer-events-none absolute right-4"
                    style={{ color: "rgba(255, 255, 255, 0.55)" }}
                  />
                </label>

                {/* Submit — bright blue gradient */}
                <button
                  type="submit"
                  className="shrink-0 inline-flex items-center justify-center rounded-full font-semibold text-white transition-all duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0A0F3D]"
                  style={{
                    padding: "12px 28px",
                    fontSize: "14px",
                    background:
                      "linear-gradient(135deg, #4B3BD6 0%, #587DFE 55%, #7A8BF5 100%)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Toepassen
                </button>
              </div>

              {hasFilters && (
                <div className="mt-4">
                  <a
                    href="/vacatures"
                    className="text-[13px] font-medium border-b border-white/30 pb-0.5 hover:border-white transition-colors"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Filters wissen
                  </a>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>

      {/* Results */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(40px, 5vh, 64px)",
          paddingBottom: "clamp(80px, 10vh, 140px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-baseline justify-between mb-6">
            <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999]">
              {jobList.length === 0
                ? "Geen resultaten"
                : `${jobList.length} vacature${jobList.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {jobList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {jobList.map((job) => (
                <VacatureCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div
              className="pt-16 pb-8"
              style={{ maxWidth: "640px" }}
            >
              <h2
                className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A]"
                style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
              >
                {hasFilters
                  ? "Geen vacatures gevonden"
                  : "Binnenkort beschikbaar"}
              </h2>
              <p
                className="mt-6 leading-relaxed"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#6B6B6B",
                }}
              >
                {hasFilters
                  ? "Probeer andere filters of verwijder de huidige selectie om meer resultaten te zien."
                  : "Er zijn momenteel geen actieve vacatures. Kom binnenkort terug voor nieuwe mogelijkheden."}
              </p>
              {hasFilters && (
                <a href="/vacatures" className="btn-primary mt-8">
                  Bekijk alle vacatures
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
