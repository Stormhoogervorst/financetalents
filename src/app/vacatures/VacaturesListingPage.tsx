import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, MapPin, Search } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import VacatureCard from "@/components/VacatureCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/BreadcrumbSchema";
import RadiusSelect from "@/components/RadiusSelect";
import { createClient } from "@/lib/supabase/server";
import { geocodeCity } from "@/lib/geocode";
import { RECHTSGEBIEDEN } from "@/lib/constants/rechtsgebieden";
import { Job, JobFirmPreview, JOB_TYPE_OPTIONS } from "@/types";

export interface VacaturesSearchParams {
  q?: string;
  locatie?: string;
  straal?: string;
  type?: string;
  rechtsgebied?: string;
  functie?: string;
}

interface VacaturesListingPageProps {
  params: VacaturesSearchParams;
  fixedPracticeArea?: string;
  basePath?: string;
  headingText?: string;
  subtitleText?: string;
  typeValues?: string[];
  typeOptions?: { value: string; label: string }[];
  eyebrowText?: string;
  filterHelperText?: string;
  resultsHeadingText?: string;
  heroHeadingClassName?: string;
  fixedLocation?: string;
  resultLabel?: {
    singular: string;
    plural: string;
  };
  emptyState?: {
    filteredTitle: string;
    defaultTitle: string;
    filteredText: string;
    defaultText: string;
    viewAllText: string;
  };
  cardStageMode?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
}

const TYPE_ALIASES: Record<string, string[]> = {
  fulltime: ["fulltime", "full-time", "Voltijd"],
  parttime: ["parttime", "part-time", "Deeltijd"],
  "business-course": ["business-course", "lawcourse", "summer-course"],
  stage: ["stage", "internship", "student", "Studentbaan"],
};

const DEFAULT_JOB_TYPE_VALUES = ["full-time", "part-time"];

function fuzzy(term: string) {
  return term.trim().replace(/[\s-]+/g, "%");
}

function buildJobQuery(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: VacaturesSearchParams,
  ids?: string[],
  fixedPracticeArea?: string,
  typeValues: string[] = DEFAULT_JOB_TYPE_VALUES,
  fixedLocation?: string
) {
  let query = supabase
    .from("jobs")
    .select("*, firms ( name, logo_url, slug )")
    .eq("status", "active")
    .in("type", typeValues);

  if (ids) {
    query = query.in("id", ids);
  }

  if (fixedPracticeArea) {
    query = query.ilike("practice_area", `%${fixedPracticeArea}%`);
  } else if (params.rechtsgebied) {
    query = query.ilike("practice_area", `%${params.rechtsgebied}%`);
  }

  if (params.q) {
    const q = fuzzy(params.q);
    query = query.or(
      `title.ilike.%${q}%,practice_area.ilike.%${q}%,description.ilike.%${q}%,location.ilike.%${q}%`
    );
  }

  const locationFilter = fixedLocation ?? params.locatie;
  if (locationFilter && !ids) {
    query = query.ilike("location", `%${fuzzy(locationFilter)}%`);
  }

  if (params.type) {
    const aliases = TYPE_ALIASES[params.type] ?? [params.type];
    query = query.in("type", aliases);
  }

  if (params.functie) {
    query = query.ilike("title", `%${params.functie}%`);
  }

  return query.order("created_at", { ascending: false });
}

export default async function VacaturesListingPage({
  params,
  fixedPracticeArea,
  basePath = "/vacatures",
  headingText: headingTextOverride,
  subtitleText: subtitleTextOverride,
  typeValues = DEFAULT_JOB_TYPE_VALUES,
  typeOptions = JOB_TYPE_OPTIONS,
  eyebrowText = "Elite finance jobs. One platform.",
  filterHelperText = "Filter by role, city, radius, type and sector. Apply directly to the firm when you find a fit.",
  resultsHeadingText = "Open roles.",
  heroHeadingClassName = "max-w-[12ch] text-[clamp(64px,14vw,220px)] leading-[0.82] tracking-[-0.08em]",
  fixedLocation,
  resultLabel = { singular: "active job", plural: "active jobs" },
  emptyState = {
    filteredTitle: "No jobs found.",
    defaultTitle: "Coming soon.",
    filteredText: "Try another role, city or type to uncover more openings.",
    defaultText: "No active jobs at the moment. Check back soon for new opportunities.",
    viewAllText: "View all jobs",
  },
  cardStageMode = false,
  breadcrumbItems,
}: VacaturesListingPageProps) {
  const supabase = await createClient();

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
      const { data } = await buildJobQuery(
        supabase,
        params,
        nearbyIds,
        fixedPracticeArea,
        typeValues,
        fixedLocation
      );
      const dataMap = new Map((data ?? []).map((job) => [job.id, job]));
      jobs = nearbyIds
        .map((id) => dataMap.get(id))
        .filter(Boolean) as Job[];
    } else {
      jobs = [];
    }
  } else {
    const { data } = await buildJobQuery(
      supabase,
      params,
      undefined,
      fixedPracticeArea,
      typeValues,
      fixedLocation
    );
    jobs = data as Job[] | null;
  }

  type JobWithFirm = Omit<Job, "firms"> & { firms: JobFirmPreview | null };
  const jobList = (jobs ?? []).map((job) => ({
    ...job,
    firms: Array.isArray(job.firms) ? (job.firms[0] ?? null) : (job.firms ?? null),
  })) as JobWithFirm[];

  const hasFilters = !!(
    params.q ||
    (!fixedLocation && params.locatie) ||
    params.type ||
    (!fixedPracticeArea && params.rechtsgebied) ||
    params.functie ||
    (params.straal && params.straal !== "0")
  );

  const filterParts: string[] = [];
  if (params.q) filterParts.push(params.q);
  if (params.functie) filterParts.push(params.functie);
  if (!fixedPracticeArea && params.rechtsgebied) {
    filterParts.push(params.rechtsgebied);
  }
  if (fixedLocation) filterParts.push(fixedLocation);
  else if (params.locatie) filterParts.push(params.locatie);

  const filterLabel = filterParts.length > 0 ? filterParts.join(" - ") : null;
  const defaultHeadingText = fixedPracticeArea
    ? `${fixedPracticeArea} jobs`
    : filterLabel
      ? `${filterLabel} jobs`
      : "Finance jobs";
  const headingText = headingTextOverride ?? defaultHeadingText;
  const subtitleText =
    subtitleTextOverride ??
    (fixedPracticeArea
      ? `Browse active ${fixedPracticeArea} roles at finance firms and apply directly.`
      : filterLabel
        ? `Browse active finance roles matching ${filterLabel}.`
        : "Fresh roles at the funds, banks and builders shaping modern finance.");

  return (
    <div className="relative min-h-screen flex flex-col bg-[#EBEBEB] text-[#222222]">
      <NavbarPublic variant="hero" />

      <div className="-mt-[4.25rem]">
        <section className="relative isolate overflow-hidden bg-[#EBEBEB]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[22vw] top-[10vh] h-[58vw] max-h-[760px] min-h-[340px] w-[58vw] min-w-[340px] max-w-[760px] overflow-hidden rounded-full border border-[#222222]/10"
          >
            <Image
              src="/icon FT.png"
              alt=""
              fill
              className="object-contain opacity-[0.16]"
              sizes="58vw"
              priority
            />
          </div>

          <div
            className="max-w-[1600px] mx-auto relative"
            style={{
              padding:
                "calc(4.25rem + clamp(48px, 8vh, 110px)) clamp(24px, 5vw, 80px) clamp(48px, 8vh, 110px)",
            }}
          >
            <div className="grid min-h-[calc(72vh-4.25rem)] grid-cols-1 content-between gap-12">
              <div>
                {breadcrumbItems && breadcrumbItems.length > 0 && (
                  <div className="mb-10 text-[#222222]/70">
                    <Breadcrumbs items={breadcrumbItems} />
                  </div>
                )}
                <p className="ft-display text-[15px] font-normal tracking-[-0.02em] text-[#222222]/70 md:text-[18px]">
                  {eyebrowText}
                </p>
                <h1 className={`ft-display mt-8 font-extrabold text-[#222222] ${heroHeadingClassName}`}>
                  {headingText}
                </h1>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-5 lg:col-start-8">
                  <p className="max-w-[560px] text-[clamp(18px,2vw,28px)] leading-[1.15] tracking-[-0.03em] text-[#222222]">
                    {subtitleText}
                  </p>
                  <p className="mt-5 max-w-[460px] text-[15px] leading-[1.65] text-[#222222]/60">
                    {filterHelperText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(36px, 5vh, 72px)",
          paddingBottom: "clamp(56px, 8vh, 110px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <form method="GET">
            <div className="grid grid-cols-1 border border-[#222222] bg-[#EBEBEB] md:grid-cols-2 xl:grid-cols-[minmax(240px,1.3fr)_minmax(180px,0.85fr)_minmax(96px,0.45fr)_minmax(160px,0.7fr)_minmax(190px,0.9fr)_auto]">
              <label
                htmlFor="filter-q"
                className="flex min-h-[72px] items-center gap-3 border-b border-[#222222] bg-white px-5 md:border-r xl:border-b-0"
              >
                <Search className="h-4 w-4 shrink-0 text-[#222222]/55" />
                <input
                  id="filter-q"
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="Role, firm or keyword"
                  className="w-full border-none bg-transparent text-[15px] text-[#222222] outline-none placeholder:text-[#222222]/45 focus:outline-none"
                />
              </label>

              {fixedLocation ? (
                <div className="flex min-h-[72px] items-center gap-3 border-b border-[#222222] bg-white px-5 xl:border-r xl:border-b-0">
                  <MapPin className="h-4 w-4 shrink-0 text-[#222222]/55" />
                  <span className="text-[15px] text-[#222222]">
                    {fixedLocation}
                  </span>
                </div>
              ) : (
                <label
                  htmlFor="filter-locatie"
                  className="flex min-h-[72px] items-center gap-3 border-b border-[#222222] bg-white px-5 xl:border-r xl:border-b-0"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-[#222222]/55" />
                  <input
                    id="filter-locatie"
                    name="locatie"
                    defaultValue={params.locatie ?? ""}
                    placeholder="Location"
                    className="w-full border-none bg-transparent text-[15px] text-[#222222] outline-none placeholder:text-[#222222]/45 focus:outline-none"
                  />
                </label>
              )}

              <div className="flex min-h-[72px] items-center border-b border-[#222222] bg-white px-5 md:border-r xl:border-b-0">
                {fixedLocation ? (
                  <span className="text-[14px] text-[#222222]/55">
                    City page
                  </span>
                ) : (
                  <RadiusSelect
                    name="straal"
                    defaultValue={params.straal ?? "0"}
                    locationInputId="filter-locatie"
                    className="w-full appearance-none border-none bg-transparent py-3 pr-6 text-[14px] text-[#222222] outline-none focus:outline-none"
                  />
                )}
              </div>

              <label
                htmlFor="filter-type"
                className="relative flex min-h-[72px] items-center border-b border-[#222222] bg-white px-5 xl:border-r xl:border-b-0"
              >
                <select
                  id="filter-type"
                  name="type"
                  defaultValue={params.type ?? ""}
                  className="w-full appearance-none border-none bg-transparent py-3 pr-7 text-[14px] text-[#222222] outline-none focus:outline-none"
                >
                  <option value="">All types</option>
                  {typeOptions.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-5 h-4 w-4 text-[#222222]/55" />
              </label>

              {fixedPracticeArea ? (
                <div className="flex min-h-[72px] items-center border-b border-[#222222] bg-white px-5 md:border-b-0 md:border-r">
                  <span className="text-[14px] text-[#222222]">
                    {fixedPracticeArea}
                  </span>
                </div>
              ) : (
                <label
                  htmlFor="filter-rechtsgebied"
                  className="relative flex min-h-[72px] items-center border-b border-[#222222] bg-white px-5 md:border-b-0 md:border-r"
                >
                  <select
                    id="filter-rechtsgebied"
                    name="rechtsgebied"
                    defaultValue={params.rechtsgebied ?? ""}
                    className="w-full appearance-none border-none bg-transparent py-3 pr-7 text-[14px] text-[#222222] outline-none focus:outline-none"
                  >
                    <option value="">All sectors</option>
                    {RECHTSGEBIEDEN.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-5 h-4 w-4 text-[#222222]/55" />
                </label>
              )}

              <button
                type="submit"
                className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-none bg-[#222222] px-7 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[#E85A00] focus:outline-none focus:ring-2 focus:ring-[#E85A00]/30"
              >
                Apply filters
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            {hasFilters && (
              <div className="mt-5">
                <Link
                  href={basePath}
                  className="inline-flex text-[14px] font-medium text-[#222222]/65 underline decoration-[#222222]/25 underline-offset-4 transition-colors duration-200 hover:text-[#E85A00]"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </form>
        </div>
      </section>

      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(70px, 9vh, 140px)",
          paddingBottom: "clamp(80px, 10vh, 150px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-10 grid grid-cols-1 gap-8 md:mb-16 lg:grid-cols-12 lg:items-end">
            <h2 className="ft-display lg:col-span-8 text-[clamp(34px,5vw,72px)] font-extrabold leading-[0.95] tracking-[-0.06em] text-[#222222]">
              {resultsHeadingText}
            </h2>
            <div className="lg:col-span-4">
              <p className="max-w-[390px] text-[17px] leading-[1.45] tracking-[-0.02em] text-[#222222]/65">
                {jobList.length === 0
                  ? `No matching ${resultLabel.plural} right now.`
                  : `Showing ${jobList.length} ${
                      jobList.length === 1
                        ? resultLabel.singular
                        : resultLabel.plural
                    }.`}
              </p>
            </div>
          </div>

          {jobList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {jobList.map((job) => (
                <VacatureCard key={job.id} job={job} stageMode={cardStageMode} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 border border-[#222222] bg-white lg:grid-cols-12">
              <div className="p-6 md:p-8 lg:col-span-7">
                <h2 className="ft-display max-w-[720px] text-[clamp(42px,7vw,104px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
                  {hasFilters
                    ? emptyState.filteredTitle
                    : emptyState.defaultTitle}
                </h2>
              </div>
              <div className="border-t border-[#222222] p-6 md:p-8 lg:col-span-5 lg:border-l lg:border-t-0">
                <p className="max-w-[460px] text-[16px] leading-[1.65] text-[#222222]/65">
                  {hasFilters
                    ? emptyState.filteredText
                    : fixedPracticeArea
                      ? `No active ${fixedPracticeArea} jobs at the moment. Check back soon for new opportunities.`
                      : emptyState.defaultText}
                </p>
                {hasFilters && (
                  <Link href={basePath} className="btn-primary mt-8">
                    {emptyState.viewAllText}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        className="relative isolate overflow-hidden bg-[#0A0A0A]"
        style={{
          padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[18vw] top-1/2 -z-10 h-[58vw] max-h-[720px] min-h-[340px] w-[58vw] min-w-[340px] max-w-[720px] -translate-y-1/2 overflow-hidden rounded-full border border-white/15"
        >
          <Image
            src="/icon FT.png"
            alt=""
            fill
            className="object-contain opacity-[0.34]"
            sizes="58vw"
          />
        </div>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <h2 className="ft-display lg:col-span-8 text-[clamp(54px,9vw,142px)] font-extrabold leading-[0.88] tracking-[-0.075em] text-white">
            Your next move starts here.
          </h2>
          <div className="lg:col-span-4">
            <p className="max-w-[460px] text-[18px] leading-[1.45] tracking-[-0.02em] text-white/70">
              Create a profile so finance firms can discover you, or come back
              when fresh roles are published.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#222222] transition-colors duration-200 hover:bg-[#E85A00] hover:text-white"
              >
                Create profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
