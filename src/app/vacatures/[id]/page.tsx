import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Job, JobFirmPreview, JOB_TYPE_OPTIONS } from "@/types";
import { CITIES, cityDisplayName, cityLocationFilter, isValidCity } from "@/lib/cities";
import { getCityJobCount } from "@/lib/jobs/getCityJobCount";
import { SITE_URL as BASE_URL } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import { RECHTSGEBIEDEN_MET_OVERIG } from "@/lib/constants/rechtsgebieden";

export const revalidate = 0;

const TYPE_ALIASES: Record<string, string[]> = {
  fulltime: ["fulltime", "full-time", "Voltijd"],
  parttime: ["parttime", "part-time", "Deeltijd"],
  "business-course": ["business-course", "lawcourse", "summer-course"],
  stage: ["stage", "internship", "student", "Studentbaan"],
};

interface SearchParams {
  type?: string;
  rechtsgebied?: string;
  functie?: string;
}

export async function generateStaticParams() {
  return CITIES.map((city) => ({ id: city }));
}

function buildFilterLabel(sp: SearchParams): string | null {
  const parts: string[] = [];
  if (sp.functie) parts.push(sp.functie);
  if (sp.rechtsgebied) parts.push(sp.rechtsgebied);
  return parts.length > 0 ? parts.join(" — ") : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: city } = await params;
  const name = cityDisplayName(city);
  const count = await getCityJobCount(city);

  const baseKeywords = [
    "juridische vacatures",
    "vacatures",
    name,
    `juridische vacatures ${name}`,
    `vacatures ${name}`,
    "advocatuur",
    `advocatuur ${name}`,
    "Legal Talents",
  ];

  if (count === 0) {
    return {
      title: `Juridische Vacatures ${name} — geen actuele openingen`,
      description: `Momenteel geen juridische vacatures in ${name}. Bekijk alle landelijke juridische vacatures of schrijf je in voor een job alert om direct geïnformeerd te worden bij nieuwe posities.`,
      robots: { index: false, follow: true },
      keywords: baseKeywords,
      alternates: {
        canonical: `/vacatures/${city}`,
      },
    };
  }

  return {
    title: `Juridische Vacatures ${name} — ${count} openstaande posities`,
    description: `${count} actuele juridische vacatures in ${name}. Ontdek stages en vacatures bij advocatenkantoren en juridische werkgevers. Solliciteer direct.`,
    robots: { index: true, follow: true },
    keywords: baseKeywords,
    alternates: {
      canonical: `/vacatures/${city}`,
    },
  };
}

export default async function CityJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id: city } = await params;
  if (!isValidCity(city)) notFound();

  const name = cityDisplayName(city);
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select("*, firms ( name, logo_url, slug )")
    .eq("status", "active")
    .ilike("location", cityLocationFilter(city))
    .order("created_at", { ascending: false });

  if (sp.type) {
    const aliases = TYPE_ALIASES[sp.type] ?? [sp.type];
    query = query.in("type", aliases);
  }
  if (sp.rechtsgebied) {
    query = query.ilike("practice_area", `%${sp.rechtsgebied}%`);
  }
  if (sp.functie) {
    query = query.ilike("title", `%${sp.functie}%`);
  }

  const { data: jobs } = await query;

  type JobWithFirm = Omit<Job, "firms"> & { firms: JobFirmPreview | null };
  const jobList = (jobs ?? []).map((j) => ({
    ...j,
    firms: Array.isArray(j.firms) ? (j.firms[0] ?? null) : (j.firms ?? null),
  })) as JobWithFirm[];

  const hasFilters = !!(sp.type || sp.rechtsgebied || sp.functie);
  const filterLabel = buildFilterLabel(sp);

  const headingText = filterLabel
    ? `Juridische vacatures: ${filterLabel} in ${name}`
    : `Juridische Vacatures ${name}`;

  const subtitleText = filterLabel
    ? `Bekijk alle actuele ${filterLabel.toLowerCase()} vacatures bij juridische werkgevers in ${name}.`
    : `Ontdek alle actuele juridische mogelijkheden bij juridische werkgevers in ${name}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: headingText,
    numberOfItems: jobList.length,
    itemListElement: jobList.map((job, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: job.title,
      url: `${BASE_URL}/vacature/${job.slug}`,
    })),
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavbarPublic variant="hero" />

      {/* Hero — mesh-gradient header that fades seamlessly to white */}
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
                "calc(4.25rem + clamp(32px, 4vh, 56px)) clamp(24px, 5vw, 80px) clamp(80px, 10vh, 140px)",
            }}
          >
            <div
              className="text-white"
              style={{ textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)" }}
            >
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Vacatures", href: "/vacatures" },
                  { label: name, href: `/vacatures/${city}` },
                ]}
              />
            </div>

            <h1
              className="mt-8 font-bold tracking-[-0.03em] leading-[1.05]"
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

            {/* Deep-navy filter pill */}
            <form method="GET" className="mt-10 max-w-[820px]">
              <div
                className="flex flex-col md:flex-row items-stretch flex-wrap rounded-[28px] p-2 gap-2"
                style={{
                  background: "#0A0F3D",
                  boxShadow:
                    "0 20px 40px -18px rgba(10, 15, 61, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.10) inset",
                }}
              >
                {/* Type */}
                <label
                  htmlFor="filter-type"
                  className="relative flex items-center md:w-[180px] min-w-0 px-4 rounded-[22px]"
                >
                  <select
                    id="filter-type"
                    name="type"
                    defaultValue={sp.type ?? ""}
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
                  className="relative flex items-center flex-1 min-w-0 px-4 rounded-[22px] md:border-l border-white/10"
                >
                  <select
                    id="filter-rechtsgebied"
                    name="rechtsgebied"
                    defaultValue={sp.rechtsgebied ?? ""}
                    className="w-full bg-transparent border-none outline-none focus:outline-none appearance-none py-3 text-[14px] text-white cursor-pointer pr-6"
                  >
                    <option value="" className="text-[#0A0F3D]">
                      Alle rechtsgebieden
                    </option>
                    {RECHTSGEBIEDEN_MET_OVERIG.map((area) => (
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

                {/* Functie (hidden — preserved when arriving from index) */}
                {sp.functie && (
                  <input type="hidden" name="functie" value={sp.functie} />
                )}

                {/* Submit */}
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
                    href={`/vacatures/${city}`}
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
          paddingBottom: "clamp(60px, 8vh, 100px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999]">
              {jobList.length === 0
                ? `Geen vacatures in ${name}`
                : `${jobList.length} vacature${jobList.length !== 1 ? "s" : ""} in ${name}`}
            </p>
          </div>

          {jobList.length > 0 ? (
            <div>
              {jobList.map((job) => (
                <JobCard key={job.id} job={job} />
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
                  : `Binnenkort in ${name}`}
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
                  : `Momenteel zijn er geen vacatures in ${name}. Bekijk alle landelijke vacatures of kom binnenkort terug.`}
              </p>
              <div className="flex flex-wrap items-center gap-6 mt-8">
                <Link href="/vacatures" className="btn-primary">
                  Bekijk alle vacatures
                </Link>
                {hasFilters && (
                  <a
                    href={`/vacatures/${city}`}
                    className="text-[14px] text-[#999999] hover:text-[#0A0A0A] transition-colors duration-200"
                  >
                    Filters wissen
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
