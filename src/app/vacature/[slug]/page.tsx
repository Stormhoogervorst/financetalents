import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import ApplicationForm from "@/components/ApplicationForm";
import ApplicationStatusToast from "@/components/ApplicationStatusToast";
import LinkedInQuickApply from "@/components/LinkedInQuickApply";
import { Job, Firm, jobTypeLabels } from "@/types";
import { Metadata } from "next";
import { CITIES, cityDisplayName } from "@/lib/cities";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  buildJobPostingSchema,
  computeValidThrough,
} from "@/lib/schemas/jobPosting";

export const revalidate = 0;

/**
 * Probeert een vrije locatie-string (bv. "Amsterdam Zuid", "Den Haag")
 * te mappen naar een city-slug uit CITIES. Returnt null als geen match,
 * zodat de breadcrumb de stad-stap overslaat i.p.v. een broken link.
 */
function locationToCitySlug(location: string): string | null {
  if (!location) return null;
  const normalized = location
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  for (const slug of CITIES) {
    const display = cityDisplayName(slug).toLowerCase();
    if (normalized.includes(display) || normalized.includes(slug)) {
      return slug;
    }
  }
  return null;
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("jobs")
    .select("title, description, firms(name)")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return { title: "Vacature niet gevonden" };

  const firmName = Array.isArray(data.firms)
    ? data.firms[0]?.name
    : (data.firms as { name: string } | null)?.name;

  const plainDescription = data.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160);

  return {
    title: `${data.title}${firmName ? ` bij ${firmName}` : ""}`,
    description: plainDescription,
    alternates: {
      canonical: `/vacature/${slug}`,
    },
  };
}

export default async function JobDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { error: errorParam, status: statusParam } = await searchParams;
  const alreadyApplied = errorParam === "already_applied";
  const linkedInSuccess = statusParam === "success";
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select(`
      id, title, slug, location, type, practice_area, description,
      salary_indication, start_date, required_education, hours_per_week,
      status, created_at, expires_at, firm_id,
      firms (
        id, name, slug, logo_url, location, practice_areas,
        description, why_work_with_us, team_size, website_url,
        notification_email, cc_emails
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!job) notFound();

  const typedJob = job as unknown as Job;

  // SEO/JobPosting: verlopen vacatures moeten uit de index. Google's
  // JobPosting-richtlijnen accepteren zowel 404 als 410 voor verwijderde
  // postings; Next.js' App Router biedt geen ingebouwde 410-helper, dus
  // we vallen terug op notFound() (404) wat dezelfde indexerings­actie
  // triggert. Zie ook prompt 5 in de SEO-roadmap.
  const validThrough = computeValidThrough(typedJob.created_at, typedJob.expires_at);
  const isJobExpired = validThrough.getTime() < Date.now();
  if (isJobExpired) notFound();

  // View-tracking: verhoog de teller server-side bij elke pageload.
  // We gebruiken een RPC met SECURITY DEFINER zodat dit ook werkt zonder
  // publieke update-rechten op `jobs`. Loskoppelen van de render d.m.v.
  // fire-and-forget zodat een trage DB-call nooit de pagina vertraagt.
  const adminDb = createAdminClient();
  void adminDb.rpc("increment_job_views", { job_id: (job as { id: string }).id });

  const firm = (
    Array.isArray(job.firms) ? job.firms[0] : job.firms
  ) as Firm & { notification_email: string; cc_emails: string[] };

  const postedDate = new Date(typedJob.created_at).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const jobPostingJsonLd = buildJobPostingSchema(
    {
      id: typedJob.id,
      title: typedJob.title,
      slug: typedJob.slug,
      description: typedJob.description,
      location: typedJob.location,
      type: typedJob.type,
      practice_area: typedJob.practice_area,
      created_at: typedJob.created_at,
      expires_at: typedJob.expires_at,
      salary_indication: typedJob.salary_indication,
      required_education: typedJob.required_education,
      hours_per_week: typedJob.hours_per_week,
    },
    firm
      ? {
          name: firm.name,
          logo_url: firm.logo_url,
          website_url: firm.website_url,
        }
      : null,
  );

  const citySlug = locationToCitySlug(typedJob.location ?? "");
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Vacatures", href: "/vacatures" },
    ...(citySlug
      ? [{ label: cityDisplayName(citySlug), href: `/vacatures/${citySlug}` }]
      : []),
    { label: typedJob.title, href: `/vacature/${typedJob.slug}` },
  ];

  const metaItems: { label: string; value: string }[] = [];
  if (typedJob.location) metaItems.push({ label: "Locatie", value: typedJob.location });
  metaItems.push({ label: "Type", value: jobTypeLabels[typedJob.type] ?? typedJob.type });
  if (typedJob.practice_area) metaItems.push({ label: "Rechtsgebied", value: typedJob.practice_area });
  if (typedJob.start_date) {
    metaItems.push({
      label: "Startdatum",
      value: new Date(typedJob.start_date).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });
  }
  if (typedJob.required_education) metaItems.push({ label: "Opleiding", value: typedJob.required_education });
  if (typedJob.salary_indication) metaItems.push({ label: "Salaris", value: typedJob.salary_indication });
  if (typedJob.hours_per_week) metaItems.push({ label: "Uren per week", value: `${typedJob.hours_per_week}` });

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      {jobPostingJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
        />
      )}
      <NavbarPublic variant="hero" />

      <ApplicationStatusToast
        alreadyApplied={alreadyApplied}
        success={linkedInSuccess}
      />

      {/* Hero — mesh-gradient header that fades seamlessly to white.
          IMPORTANT: padding + max-w structure MUST mirror the body section
          below exactly, so the hero content aligns on the same vertical
          axis as the CTA + `Over de functie` column. */}
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
            paddingLeft: "clamp(24px, 5vw, 80px)",
            paddingRight: "clamp(24px, 5vw, 80px)",
            paddingTop: "calc(4.25rem + clamp(32px, 4vh, 56px))",
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
            className="pointer-events-none absolute inset-x-0 bottom-0 h-48 md:h-64"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 55%, #FFFFFF 100%)",
            }}
          />

          <div
            className="max-w-[1400px] mx-auto relative pb-[clamp(40px,6vh,80px)] md:pb-[clamp(80px,12vh,160px)]"
          >
            {/* Grid mirrors the body layout below so hero content aligns
                exactly with the `Over de functie` column (lg:col-span-8). */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16">
              <div className="lg:col-span-8 flex flex-col items-start text-left">
                <div
                  className="text-white"
                  style={{ textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)" }}
                >
                  <Breadcrumbs items={breadcrumbItems} />
                </div>

                {/* Firm logo — directly above title, left edge matches title */}
                {firm && (
                  <Link
                    href={firm.slug ? `/werkgevers/${firm.slug}` : "#"}
                    className="mt-8 w-16 h-16 md:w-20 md:h-20 rounded-[4px] flex items-center justify-center shrink-0 overflow-hidden transition-opacity duration-200 hover:opacity-90"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(6px)",
                      WebkitBackdropFilter: "blur(6px)",
                      boxShadow:
                        "0 8px 24px -12px rgba(20, 24, 80, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.4) inset",
                    }}
                  >
                    {firm.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={firm.logo_url}
                        alt={`${firm.name} logo`}
                        className="w-12 h-12 md:w-14 md:h-14 object-contain"
                      />
                    ) : (
                      <span className="text-[15px] font-semibold text-[#2C337A]">
                        {firm.name?.slice(0, 2).toUpperCase() ?? "??"}
                      </span>
                    )}
                  </Link>
                )}

                {/* Title */}
                <h1
                  className="mt-6 font-bold tracking-[-0.03em] leading-[1.05] text-left"
                  style={{
                    fontSize: "clamp(36px, 4.8vw, 68px)",
                    color: "#FFFFFF",
                    textShadow: "0 1px 24px rgba(20, 24, 80, 0.25)",
                  }}
                >
                  {typedJob.title}
                </h1>

                {/* Firm name + date — dark text for contrast on lighter gradient */}
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                  {firm?.name && (
                    <Link
                      href={firm.slug ? `/werkgevers/${firm.slug}` : "#"}
                      className="text-[15px] font-semibold text-[#0A0A0A] border-b border-[#0A0A0A]/30 hover:border-[#587DFE] hover:text-[#587DFE] transition-colors duration-200 pb-0.5"
                    >
                      {firm.name}
                    </Link>
                  )}
                  <span className="text-[14px] text-[#6B6B6B]">
                    Geplaatst {postedDate}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Main content: asymmetric split */}
      <section
        className="bg-white"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingBottom: "clamp(80px, 10vh, 160px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-16">
            {/* Left column: details (8/12 ~ 65%) */}
            <div className="lg:col-span-8">
              {/* Meta information */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6 mb-12">
                {metaItems.map((item) => (
                  <div key={item.label}>
                    <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999] uppercase mb-1.5">
                      {item.label}
                    </p>
                    <p className="text-[15px] font-medium text-[#0A0A0A]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* LinkedIn quick-apply CTA */}
              <div
                className="relative isolate overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between flex-wrap gap-6 p-8 md:p-10 rounded-2xl mb-12"
                style={{
                  background: `linear-gradient(135deg,
                    #4B3BD6 0%,
                    #4A5DE8 20%,
                    #3E8BF5 45%,
                    #22C6E0 75%,
                    #7FE6F0 100%)`,
                  boxShadow:
                    "0 24px 48px -20px rgba(20, 24, 80, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.12) inset",
                }}
              >
                {/* Layered radial mesh — vibrant purple → blue → cyan wash */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(55% 70% at 8% 0%,
                        rgba(215, 168, 255, 0.85) 0%,
                        rgba(215, 168, 255, 0) 60%),
                      radial-gradient(60% 80% at 95% 10%,
                        rgba(42, 20, 230, 0.70) 0%,
                        rgba(59, 44, 220, 0) 55%),
                      radial-gradient(50% 65% at 75% 100%,
                        rgba(64, 232, 255, 0.75) 0%,
                        rgba(64, 232, 255, 0) 60%),
                      radial-gradient(45% 55% at 0% 90%,
                        rgba(178, 140, 255, 0.55) 0%,
                        rgba(178, 140, 255, 0) 60%),
                      radial-gradient(38% 50% at 45% 40%,
                        rgba(255, 255, 255, 0.28) 0%,
                        rgba(255, 255, 255, 0) 65%)
                    `,
                  }}
                />

                <div className="relative flex-1 min-w-0">
                  <h3
                    className="text-white font-bold tracking-[-0.02em] leading-[1.1]"
                    style={{
                      fontSize: "clamp(22px, 2.2vw, 30px)",
                      textShadow: "0 1px 20px rgba(20, 24, 80, 0.28)",
                    }}
                  >
                    Solliciteer nu
                  </h3>
                  <p
                    className="mt-2 text-white/95 font-medium"
                    style={{
                      fontSize: "clamp(14px, 1vw, 15px)",
                      textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)",
                    }}
                  >
                    Geen zin in gedoe? Solliciteer binnen 1 minuut met je LinkedIn-profiel — geen CV nodig.
                  </p>
                </div>
                <LinkedInQuickApply
                  jobId={typedJob.id}
                  jobSlug={typedJob.slug}
                  alreadyApplied={alreadyApplied}
                />
              </div>

              {/* Description */}
              {typedJob.description && (
                <div className="mb-16">
                  <h2
                    className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A] mb-8"
                    style={{ fontSize: "clamp(24px, 2.5vw, 36px)" }}
                  >
                    Over de functie
                  </h2>
                  <div
                    className="w-full text-[#6B6B6B] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-[#0A0A0A] [&_h3]:font-bold [&_h3]:text-[#0A0A0A] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-lg [&_h2]:font-bold [&_h2]:text-[#0A0A0A] [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_a]:text-[#587DFE] [&_a]:border-b [&_a]:border-[#587DFE] [&_a]:hover:opacity-80"
                    style={{
                      fontSize: "clamp(15px, 1.1vw, 17px)",
                      lineHeight: 1.65,
                    }}
                    dangerouslySetInnerHTML={{ __html: typedJob.description }}
                  />
                </div>
              )}

              {/* Application form */}
              <section id="solliciteren">
                <div className="border-t border-[#E5E5E5] pt-12">
                  <h2
                    className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A] mb-8"
                    style={{ fontSize: "clamp(24px, 2.5vw, 36px)" }}
                  >
                    Solliciteer direct
                  </h2>
                  <ApplicationForm
                    jobId={typedJob.id}
                    jobTitle={typedJob.title}
                    firmName={firm?.name ?? ""}
                  />
                </div>
              </section>
            </div>

            {/* Right column: firm sidebar (4/12 ~ 35%) */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                {firm && (
                  <div className="relative isolate overflow-hidden bg-slate-50 rounded-2xl p-6 md:bg-transparent md:rounded-none md:p-0 md:overflow-visible">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -z-10 md:hidden"
                      style={{
                        background: `
                          radial-gradient(60% 55% at 15% 10%,
                            rgba(168, 198, 255, 0.45) 0%,
                            rgba(168, 198, 255, 0) 70%),
                          radial-gradient(55% 60% at 95% 20%,
                            rgba(200, 218, 255, 0.55) 0%,
                            rgba(200, 218, 255, 0) 65%),
                          radial-gradient(60% 65% at 80% 100%,
                            rgba(180, 210, 255, 0.40) 0%,
                            rgba(180, 210, 255, 0) 70%),
                          radial-gradient(45% 55% at 10% 90%,
                            rgba(215, 228, 255, 0.50) 0%,
                            rgba(215, 228, 255, 0) 70%)
                        `,
                      }}
                    />
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-[4px] bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden">
                        {firm.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firm.logo_url}
                            alt={`${firm.name} logo`}
                            className="w-9 h-9 object-contain"
                          />
                        ) : (
                          <span className="text-[12px] font-semibold text-[#999999]">
                            {firm.name?.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-[#0A0A0A]">
                          {firm.name}
                        </p>
                        {firm.location && (
                          <p className="text-[13px] text-[#999999] mt-0.5">
                            {firm.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {firm.description && (
                      <p
                        className="text-[#6B6B6B] mb-6"
                        style={{
                          fontSize: "clamp(14px, 1vw, 15px)",
                          lineHeight: 1.65,
                        }}
                      >
                        {firm.description.length > 200
                          ? `${firm.description.substring(0, 200)}…`
                          : firm.description}
                      </p>
                    )}

                    {firm.practice_areas && firm.practice_areas.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999] uppercase mb-2">
                          Rechtsgebieden
                        </p>
                        <p className="text-[14px] text-[#6B6B6B] leading-relaxed">
                          {firm.practice_areas.join(" · ")}
                        </p>
                      </div>
                    )}

                    {firm.team_size && (
                      <div className="mb-6">
                        <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999] uppercase mb-2">
                          Teamgrootte
                        </p>
                        <p className="text-[14px] text-[#6B6B6B]">{firm.team_size}</p>
                      </div>
                    )}

                    <div className="border-t border-[#E5E5E5] pt-5 mt-2 flex flex-col gap-3">
                      {firm.slug && (
                        <Link
                          href={`/werkgevers/${firm.slug}`}
                          className="btn-primary w-full"
                        >
                          Bekijk werkgeversprofiel
                        </Link>
                      )}
                      {firm.website_url && (
                        <a
                          href={firm.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary w-full"
                        >
                          Website
                          <ExternalLink className="ml-2 w-4 h-4 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
