import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChevronDown } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import JobCard from "@/components/JobCard";
import { Job, JobFirmPreview } from "@/types";
import { CITIES, cityDisplayName, cityLocationFilter, isValidCity } from "@/lib/cities";
import { getCityJobCount } from "@/lib/jobs/getCityJobCount";
import { SITE_URL as BASE_URL } from "@/lib/site";
import Breadcrumbs from "@/components/Breadcrumbs";
import { RECHTSGEBIEDEN_MET_OVERIG } from "@/lib/constants/rechtsgebieden";

export const revalidate = 0;

const STAGE_TYPE_VALUES = ["stage", "internship", "student", "Studentbaan"];

interface SearchParams {
  rechtsgebied?: string;
}

export async function generateStaticParams() {
  return CITIES.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const name = cityDisplayName(city);
  const count = await getCityJobCount(city, { stagesOnly: true });

  const baseKeywords = [
    "finance internships",
    "internships",
    name,
    `finance internships ${name}`,
    `internships ${name}`,
    "finance",
    `finance ${name}`,
    "Finance Talents",
  ];

  if (count === 0) {
    return {
      title: `Finance Internships ${name} — no current openings`,
      description: `No finance internships in ${name} at the moment. Check back soon for new internship opportunities in this city.`,
      robots: { index: false, follow: true },
      keywords: baseKeywords,
      alternates: {
        canonical: `/stages/${city}`,
      },
    };
  }

  return {
    title: `Finance Internships ${name} — ${count} open positions`,
    description: `${count} current finance internships in ${name}. Discover internships at PE funds, investment banks and FinTechs. Apply directly.`,
    robots: { index: true, follow: true },
    keywords: baseKeywords,
    alternates: {
      canonical: `/stages/${city}`,
    },
  };
}

export default async function CityStagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { city } = await params;
  if (!isValidCity(city)) notFound();

  const name = cityDisplayName(city);
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("jobs")
    .select("*, firms ( name, logo_url, slug )")
    .eq("status", "active")
    .ilike("location", cityLocationFilter(city))
    .in("type", STAGE_TYPE_VALUES)
    .order("created_at", { ascending: false });

  if (sp.rechtsgebied) {
    query = query.ilike("practice_area", `%${sp.rechtsgebied}%`);
  }

  const { data: jobs } = await query;

  type JobWithFirm = Omit<Job, "firms"> & { firms: JobFirmPreview | null };
  const jobList = (jobs ?? []).map((j) => ({
    ...j,
    firms: Array.isArray(j.firms) ? (j.firms[0] ?? null) : (j.firms ?? null),
  })) as JobWithFirm[];

  const hasFilters = !!sp.rechtsgebied;
  const headingText = sp.rechtsgebied
    ? `${sp.rechtsgebied} Internships ${name}`
    : `Finance Internships ${name}`;

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
                  { label: name, href: `/stages/${city}` },
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
              {sp.rechtsgebied
                ? `View all current ${sp.rechtsgebied.toLowerCase()} internships at firms in ${name}.`
                : `Discover all current finance internships at leading firms in ${name}.`}
            </p>

            {/* Deep-navy filter pill — matches the homepage/jobs hero contrast */}
            <form method="GET" className="mt-10 max-w-[620px]">
              <div
                className="flex flex-col md:flex-row items-stretch flex-wrap rounded-[28px] p-2 gap-2"
                style={{
                  background: "#0A0F3D",
                  boxShadow:
                    "0 20px 40px -18px rgba(10, 15, 61, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.10) inset",
                }}
              >
                {/* Practice area */}
                <label
                  htmlFor="filter-rechtsgebied"
                  className="relative flex items-center flex-1 min-w-0 px-4 rounded-[22px]"
                >
                  <select
                    id="filter-rechtsgebied"
                    name="rechtsgebied"
                    defaultValue={sp.rechtsgebied ?? ""}
                    className="w-full bg-transparent border-none outline-none focus:outline-none appearance-none py-3 text-[14px] text-white cursor-pointer pr-6"
                  >
                    <option value="" className="text-[#0A0F3D]">
                      All sectors
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
                  Apply
                </button>
              </div>

              {hasFilters && (
                <div className="mt-4">
                  <a
                    href={`/stages/${city}`}
                    className="text-[13px] font-medium border-b border-white/30 pb-0.5 hover:border-white transition-colors"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Clear filters
                  </a>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>

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
                ? `No internships in ${name}`
                : `${jobList.length} internship${jobList.length !== 1 ? "s" : ""} in ${name}`}
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
                  ? "No internships found"
                  : `Coming soon in ${name}`}
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
                  ? "Probeer een ander rechtsgebied of verwijder het filter om meer resultaten te zien."
                  : `No internships in ${name} right now. Check back soon for new opportunities.`}
              </p>
              <div className="flex flex-wrap items-center gap-6 mt-8">
                {hasFilters && (
                  <a
                    href={`/stages/${city}`}
                    className="text-[14px] text-[#999999] hover:text-[#0A0A0A] transition-colors duration-200"
                  >
                    Clear filters
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <CtaBand />

      <Footer />
    </div>
  );
}
