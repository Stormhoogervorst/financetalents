import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowUpRight } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import HeroSection from "@/components/HeroSection";
import VacatureCarousel from "@/components/VacatureCarousel";
import VacatureListMobile from "@/components/VacatureListMobile";
import OrganizationJsonLd from "@/components/OrganizationJsonLd";
import { createClient } from "@/lib/supabase/server";
import { Firm, Job } from "@/types";
import {
  getRechtsgebiedSlug,
  RECHTSGEBIEDEN,
} from "@/lib/constants/rechtsgebieden";

interface BlogPreview {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  image_url: string | null;
  created_at: string;
  firms: { name: string; logo_url: string | null } | null;
}

const blogCategoryLabels: Record<string, string> = {
  carriere: "Career",
  finance: "Finance",
  kantoorleven: "Life at the firm",
};

/**
 * FAQ content and FAQPage JSON-LD are built from the same array,
 * so visible DOM and structured data are guaranteed to match.
 */
const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "How do I find a finance internship?",
    a: "On Finance Talents you can filter all opportunities by type, sector and city. Search for internships in Private Equity, Venture Capital or Investment Banking. You apply directly to the firm — no middleman, no fees.",
  },
  {
    q: "What does an analyst earn at a PE fund?",
    a: "Salaries vary significantly by firm type and geography. At large buyout funds an analyst can expect £60–90k base, while boutique firms may offer £45–65k. Many listings on Finance Talents include a salary indication.",
  },
  {
    q: "What is the difference between an internship and a full-time role?",
    a: "An internship is a structured programme — typically 8–12 weeks — designed to give students and recent graduates hands-on experience. A full-time role is a permanent or fixed-term position. Both are listed on Finance Talents under their respective categories.",
  },
  {
    q: "How do I write a strong application for a finance role?",
    a: "Keep it concise and specific. Explain why this firm, why this role, and why now. Reference a deal, a fund strategy, or something concrete about their culture. Avoid generic phrases. A strong CV with relevant experience and grades matters — attach it alongside a tight cover letter.",
  },
  {
    q: "What does Finance Talents do?",
    a: "Finance Talents is the curated career platform for Private Equity, Venture Capital, Investment Banking and FinTech. We connect ambitious professionals at every level with the firms shaping the future of finance. Listings are free to browse, you never need an account to search, and applying is always free.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org/",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};


export default async function HomePage() {
  const supabase = await createClient();

  const { data: allFirms } = await supabase
    .from("firms")
    .select("id, name, slug, location, practice_areas, logo_url, team_size, is_published")
    .eq("is_published", true);

  const firms = (allFirms ?? []) as Firm[];
  const featuredFirms = firms
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  const { data: topJobs } = await supabase
    .from("jobs")
    .select("*, firms ( name, logo_url, slug )")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  const allJobs = (topJobs ?? []).map((j) => ({
    ...j,
    firms: Array.isArray(j.firms) ? (j.firms[0] ?? null) : (j.firms ?? null),
  })) as Job[];

  const { data: blogData } = await supabase
    .from("blogs")
    .select(`
      id, title, slug, category, content, image_url, created_at,
      firms ( name, logo_url )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);

  const latestBlogs = ((blogData ?? []) as unknown as BlogPreview[]).map((b) => ({
    ...b,
    firms: Array.isArray(b.firms) ? b.firms[0] ?? null : b.firms,
  }));

  return (
    <div className="relative min-h-screen flex flex-col bg-[#EBEBEB] text-[#222222]">
      <OrganizationJsonLd />
      <NavbarPublic variant="hero" />

      {/* ── Hero ──────────────────────────────────────────────── */}
      {/* Negative margin pulls the hero gradient up behind the liquid-glass navbar */}
      <div className="-mt-[4.25rem]">
        <HeroSection />
      </div>

      {/* ── Top vacatures carrousel ───────────────────────────── */}
      <section
        className="bg-white"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-10 grid grid-cols-1 gap-8 md:mb-16 lg:grid-cols-12 lg:items-end">
            <h2
              className="ft-display lg:col-span-8"
              style={{
                fontSize: "clamp(54px, 9vw, 132px)",
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: "-0.075em",
                color: "#222222",
              }}
            >
              Latest finance jobs.
            </h2>
            <div className="lg:col-span-4">
              <p className="max-w-[390px] text-[17px] leading-[1.45] tracking-[-0.02em] text-[#222222]/65">
                Fresh openings at ambitious finance firms, selected for people
                who want signal over volume.
              </p>
              <Link href="/vacatures" className="btn-primary mt-6 shrink-0 hidden md:inline-flex">
                View all jobs
              </Link>
            </div>
          </div>

          {allJobs.length > 0 ? (
            <>
              {/* Mobile: compact vertical list (max 5) */}
              <div className="md:hidden">
                <VacatureListMobile jobs={allJobs} limit={5} />
              </div>

              {/* Desktop / tablet: existing carousel */}
              <div className="hidden md:block">
                <VacatureCarousel jobs={allJobs} />
              </div>
            </>
          ) : (
            <p style={{ fontSize: "15px", color: "rgba(34,34,34,0.55)" }}>
              No jobs available at the moment.
            </p>
          )}
        </div>
      </section>

      {/* ── Werkgevers grid ───────────────────────────────────── */}
      <section
        className="bg-[#EBEBEB]"
        style={{
          paddingTop: "clamp(80px, 10vh, 150px)",
          paddingBottom: "clamp(80px, 10vh, 160px)",
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">

          <div className="mb-8 grid grid-cols-1 gap-8 md:mb-16 lg:grid-cols-12 lg:items-end">
            <h2
              className="ft-display lg:col-span-8"
              style={{
                fontSize: "clamp(54px, 9vw, 132px)",
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: "-0.075em",
                color: "#222222",
              }}
            >
              Featured companies.
            </h2>
            <div className="lg:col-span-4">
              <p className="max-w-[390px] text-[17px] leading-[1.45] tracking-[-0.02em] text-[#222222]/65">
                Discover the funds, banks and builders shaping modern finance.
              </p>
              <Link href="/werkgevers" className="btn-primary mt-6 shrink-0 hidden md:inline-flex">
                All companies
              </Link>
            </div>
          </div>

          {/* ── Mobile: vertical list with roomier cards ── */}
          <div className="md:hidden">
            <ul className="flex flex-col gap-3">
              {featuredFirms.map((firm) => (
                <li key={firm.id}>
                  <Link
                    href={`/werkgevers/${firm.slug}`}
                    className="group flex items-center gap-4 border border-[#222222] bg-white px-4 py-5 transition-colors duration-200 active:bg-[#0A0A0A]"
                  >
                    {/* Logo */}
                    <div className="w-14 h-14 bg-white border border-[#222222] flex items-center justify-center overflow-hidden p-2 shrink-0">
                      {firm.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firm.logo_url}
                          alt={`${firm.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#222222" }}>
                          {firm.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold leading-[1.08] line-clamp-2 text-[#222222] transition-colors duration-200 group-active:text-[#E85A00]"
                        style={{
                          fontSize: "20px",
                          letterSpacing: "-0.035em",
                        }}
                      >
                        {firm.name}
                      </h3>

                      {firm.location && (
                        <div
                          className="flex items-center gap-1 mt-1.5"
                          style={{ fontSize: "13px", color: "rgba(34,34,34,0.55)" }}
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {firm.location}
                            {firm.team_size && (
                              <><span className="mx-1">·</span>{firm.team_size} mw.</>
                            )}
                          </span>
                        </div>
                      )}

                      {firm.practice_areas && firm.practice_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {firm.practice_areas.slice(0, 2).map((area) => (
                            <span
                              key={area}
                              className="border border-[#222222] text-[#222222] text-[11px] font-medium px-2.5 py-1 rounded-full leading-none"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/werkgevers"
              className="btn-primary mt-6 w-full justify-center inline-flex"
            >
              View all companies
            </Link>
          </div>

          {/* ── Desktop: existing grid ── */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4">
            {featuredFirms.map((firm) => (
              <Link
                key={firm.id}
                href={`/werkgevers/${firm.slug}`}
                className="group flex min-h-[320px] flex-col border border-[#222222] bg-white p-6 transition-colors duration-200 hover:bg-[#0A0A0A]"
              >
                <div className="w-14 h-14 bg-white border border-[#222222] flex items-center justify-center mb-5 overflow-hidden p-2">
                  {firm.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={firm.logo_url} alt={`${firm.name} logo`} className="w-full h-full object-contain" />
                  ) : (
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#222222" }}>
                      {firm.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <h3
                  className="mt-auto text-[#222222] transition-colors duration-200 group-hover:text-[#E85A00]"
                  style={{
                    fontSize: "clamp(24px, 2.3vw, 36px)",
                    fontWeight: 600,
                    lineHeight: 1.02,
                    letterSpacing: "-0.045em",
                  }}
                >
                  {firm.name}
                </h3>
                {firm.location && (
                  <p
                    className="flex items-center gap-1 mt-3 w-full overflow-hidden text-[#222222]/55 transition-colors duration-200 group-hover:text-white/55"
                    style={{ fontSize: "12px", letterSpacing: "-0.01em", lineHeight: 1.3 }}
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="min-w-0 truncate">
                      {firm.location}
                      {firm.team_size && (
                        <><span className="mx-1">·</span>{firm.team_size} employees</>
                      )}
                    </span>
                  </p>
                )}
                {firm.practice_areas && firm.practice_areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {firm.practice_areas.slice(0, 2).map((area) => (
                      <span
                        key={area}
                        className="border border-[#222222] text-[#222222] text-[12px] font-medium px-3 py-1 rounded-full transition-colors duration-200 group-hover:border-[#E85A00] group-hover:text-[#E85A00]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── Voor werkgevers ───────────────────────────────────── */}
      <section
        className="relative isolate overflow-hidden bg-[#0A0A0A]"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-[20vw] top-1/2 -z-10 h-[62vw] max-h-[760px] min-h-[360px] w-[62vw] min-w-[360px] max-w-[760px] -translate-y-1/2 rounded-full border border-white/15"
        />
        <div className="max-w-[1400px] mx-auto relative">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <h2
                className="ft-display"
                style={{
                  fontSize: "clamp(54px, 9vw, 142px)",
                  fontWeight: 800,
                  lineHeight: 0.88,
                  letterSpacing: "-0.075em",
                  color: "#FFFFFF",
                }}
              >
                Reach finance talent directly.
              </h2>
            </div>

            <div className="lg:col-span-4">
              <p className="max-w-[460px] text-[18px] leading-[1.45] tracking-[-0.02em] text-white/70">
                Set up a company profile and post your jobs in minutes.
                Applications land directly in your inbox and dashboard.
              </p>

              <div className="flex flex-col gap-5 mt-10">
                {[
                  { label: "Free profile", desc: "Set up a company profile instantly." },
                  { label: "Unlimited postings", desc: "Publish as many jobs as you want." },
                  { label: "Direct applications", desc: "Applications straight to your inbox." },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-[#E85A00] flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p style={{ fontSize: "15px", lineHeight: 1.5, color: "rgba(255,255,255,0.65)" }}>
                      <span style={{ fontWeight: 600, color: "#FFFFFF" }}>{item.label}</span>
                      {" - "}
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/voor-werkgevers" className="inline-flex items-center justify-center rounded-full border border-white px-5 py-2.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-white hover:text-[#222222] sm:w-auto w-full">
                  Learn more
                </Link>
                <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#222222] transition-colors duration-200 hover:bg-[#E85A00] hover:text-white sm:w-auto w-full">
                  Post a job
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Finance Talents ──────────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <h2
            className="ft-display"
            style={{
              fontSize: "clamp(54px, 9vw, 132px)",
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: "-0.075em",
              color: "#222222",
            }}
          >
            Why Finance Talents
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 mt-12 md:mt-16">
            {[
              {
                title: "The most complete offering",
                body: "On Finance Talents you find jobs and internships at the largest buyout funds, boutique advisory firms, and fast-growing FinTechs. Everything in one place — no endless career-page trawling.",
              },
              {
                title: "Built for finance",
                body: "Not a generalist job board. Every listing is aimed at finance professionals — from student intern to Managing Director. Filter by sector, type and city and find what fits you quickly.",
              },
              {
                title: "Direct contact with the employer",
                body: "You apply straight to the firm. No middlemen, no recruiters reselling your CV. That saves you time and means employers give your application their full attention.",
              },
            ].map((usp) => (
              <div key={usp.title} className="border border-[#222222] bg-white p-6 md:min-h-[260px]">
                <h3
                  style={{
                    fontSize: "clamp(24px, 2.4vw, 34px)",
                    fontWeight: 600,
                    lineHeight: 1.02,
                    letterSpacing: "-0.045em",
                    color: "#222222",
                  }}
                >
                  {usp.title}
                </h3>
                <p
                  className="mt-3"
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.65,
                    color: "rgba(34,34,34,0.62)",
                  }}
                >
                  {usp.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ─────────────────────────────────────── */}
      <section
        style={{
          padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-[720px]">
            <h2
              className="ft-display"
              style={{
                fontSize: "clamp(54px, 9vw, 132px)",
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: "-0.075em",
                color: "#222222",
              }}
            >
              How it works
            </h2>
            <p
              className="mt-5"
              style={{
                fontSize: "16px",
                lineHeight: 1.65,
                color: "rgba(34,34,34,0.62)",
              }}
            >
              From student to first finance role in three steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 mt-12 md:mt-16">
            {[
              {
                n: "01",
                title: "Search",
                body: "Filter by city, sector and job type. Or browse the full listing and discover firms you haven't heard of yet.",
              },
              {
                n: "02",
                title: "Apply",
                body: "Click a listing and send your cover letter and CV directly to the firm. No account, no extra steps.",
              },
              {
                n: "03",
                title: "Start",
                body: "The employer gets in touch. If it's a match, you're on your way to your next finance role.",
              },
            ].map((step) => (
              <div key={step.n} className="border border-[#222222] p-6">
                <span
                  style={{
                    fontSize: "clamp(56px, 7vw, 104px)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#E85A00",
                    lineHeight: 1,
                  }}
                >
                  {step.n}
                </span>
                <h3
                  className="mt-5"
                  style={{
                    fontSize: "clamp(24px, 2.4vw, 34px)",
                    fontWeight: 600,
                    lineHeight: 1.02,
                    letterSpacing: "-0.045em",
                    color: "#222222",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-3"
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.65,
                    color: "rgba(34,34,34,0.62)",
                  }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rechtsgebieden ────────────────────────────────────── */}
      <section
        className="bg-[#0A0A0A]"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-[720px]">
            <h2
              className="ft-display"
              style={{
                fontSize: "clamp(38px, 9vw, 132px)",
                fontWeight: 800,
                lineHeight: 0.9,
                letterSpacing: "-0.075em",
                color: "#FFFFFF",
              }}
            >
              <span className="whitespace-nowrap">Finance jobs</span>
              <br />
              <span className="whitespace-nowrap">by sector</span>
            </h2>
            <p
              className="mt-5"
              style={{
                fontSize: "16px",
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              Specialise in the sector that fits you - from Private Equity
              to FinTech.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-12 md:mt-16">
            {RECHTSGEBIEDEN.map((area) => (
              <Link
                key={area}
                href={`/vacatures/${getRechtsgebiedSlug(area)}`}
                className="group flex min-h-[112px] items-start justify-between border border-white/35 px-5 py-5 transition-colors duration-150 hover:border-[#EBEBEB] hover:bg-[#EBEBEB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85A00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
              >
                <span
                  className="text-white transition-colors duration-150 group-hover:text-[#222222]"
                  style={{
                    fontSize: "clamp(14px, 1.1vw, 16px)",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.3,
                  }}
                >
                  {area}
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-[#E85A00] transition-colors duration-150"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Veelgestelde vragen ──────────────────────────────── */}
      <section
        style={{
          padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)",
          backgroundColor: "#EBEBEB",
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <div className="max-w-[880px] mx-auto">
          <h2
            className="ft-display"
            style={{
              fontSize: "clamp(54px, 9vw, 120px)",
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: "-0.075em",
              color: "#222222",
            }}
          >
            Frequently asked questions
          </h2>

          <div className="mt-10 md:mt-14 flex flex-col gap-3">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group border border-[#222222] bg-white transition-colors duration-200 hover:bg-[#0A0A0A] open:bg-[#0A0A0A]"
              >
                <summary
                  className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-5 md:px-6"
                  style={{
                    fontSize: "clamp(16px, 1.25vw, 18px)",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.4,
                  }}
                >
                  <span className="text-[#222222] transition-colors duration-200 group-hover:text-white group-open:text-white">{q}</span>
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 select-none text-[20px] font-normal leading-none text-[#E85A00] transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-5 pb-5 text-white/70 md:px-6"
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.65,
                  }}
                >
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kennisbank ────────────────────────────────────────── */}
      {latestBlogs.length > 0 && (
        <section
          className="bg-white"
          style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-12 grid grid-cols-1 gap-8 sm:mb-16 lg:grid-cols-12 lg:items-end">
              <h2
                className="ft-display leading-none m-0 p-0 lg:col-span-8"
                style={{
                  fontSize: "clamp(54px, 9vw, 132px)",
                  fontWeight: 800,
                  lineHeight: 0.9,
                  letterSpacing: "-0.075em",
                  color: "#222222",
                  margin: 0,
                  padding: 0,
                }}
              >
                Articles and insights
              </h2>
              <div className="lg:col-span-4">
                <p className="max-w-[390px] text-[17px] leading-[1.45] tracking-[-0.02em] text-[#222222]/65">
                  Direct reads for candidates and hiring teams in finance.
                </p>
                <Link
                  href="/kennisbank"
                  className="btn-primary mt-6 shrink-0"
                >
                  All articles
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {latestBlogs.slice(0, 3).map((blog) => (
                <Link
                  key={blog.id}
                  href={`/kennisbank/${blog.slug}`}
                  className="group block border border-[#222222] bg-white p-4 transition-colors duration-200 hover:bg-[#0A0A0A]"
                >
                  <div className="relative w-full aspect-video overflow-hidden">
                    {blog.image_url ? (
                      <Image
                        src={blog.image_url}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#EBEBEB]" />
                    )}
                  </div>
                  <div className="mt-5">
                    <span
                      className="inline-block rounded-full border border-[#222222] transition-colors duration-200 group-hover:border-[#E85A00]"
                      style={{
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                        color: "#E85A00",
                      }}
                    >
                      {blogCategoryLabels[blog.category] ?? blog.category}
                    </span>
                    <h3
                      className="mt-3 line-clamp-2 text-[#222222] transition-colors duration-200 group-hover:text-[#E85A00]"
                      style={{
                        fontSize: "clamp(22px, 2vw, 32px)",
                        fontWeight: 600,
                        lineHeight: 1.05,
                        letterSpacing: "-0.045em",
                      }}
                    >
                      {blog.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />

      <Footer />
    </div>
  );
}
