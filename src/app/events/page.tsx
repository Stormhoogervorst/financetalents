import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import JobCard from "@/components/JobCard";
import { Job, JobFirmPreview } from "@/types";
import { RECHTSGEBIEDEN } from "@/lib/constants/rechtsgebieden";

const BUSINESS_COURSE_TYPES = ["business-course", "lawcourse", "summer-course"];

interface SearchParams {
  q?: string;
  locatie?: string;
  rechtsgebied?: string;
}

export const revalidate = 0;

export const metadata = {
  title: "Events & Business Courses",
  description:
    "Bekijk alle juridische events en business courses bij werkgevers in Nederland.",
  alternates: {
    canonical: "/events",
  },
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const fuzzy = (term: string) => term.trim().replace(/[\s\-]+/g, "%");

  let query = supabase
    .from("jobs")
    .select("*, firms ( name, logo_url, slug )")
    .eq("status", "active")
    .in("type", BUSINESS_COURSE_TYPES)
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
  if (params.rechtsgebied) {
    query = query.ilike("practice_area", `%${params.rechtsgebied}%`);
  }

  const { data: jobs } = await query;

  type JobWithFirm = Omit<Job, "firms"> & { firms: JobFirmPreview | null };
  const jobList = (jobs ?? []).map((j) => ({
    ...j,
    firms: Array.isArray(j.firms) ? (j.firms[0] ?? null) : (j.firms ?? null),
  })) as JobWithFirm[];

  const hasFilters = !!(params.q || params.locatie || params.rechtsgebied);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      {/* Hero */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(60px, 8vh, 120px)",
          paddingBottom: "clamp(40px, 5vh, 64px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#587DFE] mb-6" />
          <h1
            className="font-bold tracking-[-0.03em] leading-[1.05] text-[#0A0A0A]"
            style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
          >
            Events &amp; Business Courses
          </h1>
          <p
            className="mt-6 leading-relaxed max-w-[640px]"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              lineHeight: 1.65,
              color: "#6B6B6B",
            }}
          >
            Ontdek juridische events, law courses en business courses bij
            toonaangevende werkgevers in Nederland.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section
        className="border-b border-[#E5E5E5]"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <form
            method="GET"
            className="flex flex-wrap items-end gap-x-8 gap-y-5 py-8"
          >
            {/* Search */}
            <div className="flex-1 min-w-[200px] max-w-[280px]">
              <label htmlFor="filter-q" className="sr-only">
                Zoeken
              </label>
              <input
                id="filter-q"
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Zoek op titel, trefwoord of locatie"
                className="w-full bg-transparent border-0 border-b border-[#CCCCCC] py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200"
              />
            </div>

            {/* Location */}
            <div className="min-w-[160px] max-w-[200px]">
              <label htmlFor="filter-locatie" className="sr-only">
                Locatie
              </label>
              <input
                id="filter-locatie"
                name="locatie"
                defaultValue={params.locatie ?? ""}
                placeholder="Locatie"
                className="w-full bg-transparent border-0 border-b border-[#CCCCCC] py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200"
              />
            </div>

            {/* Practice area */}
            <div className="min-w-[180px]">
              <label htmlFor="filter-rechtsgebied" className="sr-only">
                Rechtsgebied
              </label>
              <select
                id="filter-rechtsgebied"
                name="rechtsgebied"
                defaultValue={params.rechtsgebied ?? ""}
                className="w-full bg-transparent border-0 border-b border-[#CCCCCC] py-3 text-[15px] text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200 appearance-none cursor-pointer"
              >
                <option value="">Alle rechtsgebieden</option>
                {RECHTSGEBIEDEN.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pb-1">
              <button type="submit" className="btn-primary">
                Toepassen
              </button>
              {hasFilters && (
                <a
                  href="/events"
                  className="text-[14px] text-[#999999] hover:text-[#0A0A0A] transition-colors duration-200 border-b border-transparent hover:border-[#E5E5E5] pb-1"
                >
                  Wissen
                </a>
              )}
            </div>
          </form>
        </div>
      </section>

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
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999]">
              {jobList.length === 0
                ? "Geen resultaten"
                : `${jobList.length} event${jobList.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {jobList.length > 0 ? (
            <div className="border-t border-[#E5E5E5]">
              {jobList.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div
              className="border-t border-[#E5E5E5] pt-16 pb-8"
              style={{ maxWidth: "640px" }}
            >
              <h2
                className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A]"
                style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
              >
                {hasFilters
                  ? "Geen events gevonden"
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
                  : "Er zijn momenteel geen actieve events of business courses. Kom binnenkort terug voor nieuwe mogelijkheden."}
              </p>
              {hasFilters && (
                <a href="/events" className="btn-primary mt-8">
                  Bekijk alle events
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <CtaBand />

      <Footer />
    </div>
  );
}
