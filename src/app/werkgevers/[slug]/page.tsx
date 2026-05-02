import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import JobCard from "@/components/JobCard";
import { Firm, Job, JobFirmPreview } from "@/types";
import { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: firm } = await supabase
    .from("firms")
    .select("name, location, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!firm) return { title: "Werkgever niet gevonden" };

  return {
    title: `${firm.name}`,
    description:
      firm.description?.substring(0, 160) ??
      `Bekijk het profiel van ${firm.name} op Legal Talents.`,
    alternates: {
      canonical: `/werkgevers/${slug}`,
    },
  };
}

export default async function FirmPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: firm } = await supabase
    .from("firms")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!firm) notFound();

  const firmData = firm as Firm;

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("firm_id", firmData.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const firmPreview: JobFirmPreview = {
    name: firmData.name,
    logo_url: firmData.logo_url,
    slug: firmData.slug,
  };

  const jobList = (jobs ?? []) as Job[];
  const initials = firmData.name.slice(0, 2).toUpperCase();

  const hasHeroPracticeTags =
    !!(firmData.practice_areas && firmData.practice_areas.length > 0);

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
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
            paddingLeft: "clamp(24px, 5vw, 80px)",
            paddingRight: "clamp(24px, 5vw, 80px)",
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
            className="max-w-[1400px] mx-auto relative"
            style={{
              paddingTop: "calc(4.25rem + clamp(32px, 4vh, 56px))",
              paddingBottom: "clamp(80px, 12vh, 160px)",
            }}
          >
            <div
              className="text-white"
              style={{ textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)" }}
            >
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Werkgevers", href: "/werkgevers" },
                  { label: firmData.name, href: `/werkgevers/${firmData.slug}` },
                ]}
              />
            </div>

            <div className="mt-6 flex flex-col md:flex-row items-start gap-6">
              {/* Firm logo — liquid glass, no extra margin so left edge aligns with breadcrumb */}
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-[4px] shrink-0 flex items-center justify-center overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  boxShadow:
                    "0 8px 24px -12px rgba(20, 24, 80, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.4) inset",
                }}
              >
                {firmData.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={firmData.logo_url}
                    alt={`${firmData.name} logo`}
                    className="w-12 h-12 md:w-14 md:h-14 object-contain"
                  />
                ) : (
                  <span className="text-[15px] font-semibold text-[#2C337A]">
                    {initials}
                  </span>
                )}
              </div>

              {/* Firm name + practice area tags */}
              <div className="flex flex-col gap-3">
                <h1
                  className="font-bold tracking-[-0.03em] leading-[1.05]"
                  style={{
                    fontSize: "clamp(36px, 4.8vw, 68px)",
                    color: "#FFFFFF",
                    textShadow: "0 1px 24px rgba(20, 24, 80, 0.25)",
                  }}
                >
                  {firmData.name}
                </h1>

                {hasHeroPracticeTags && (
                  <div className="flex flex-wrap gap-2">
                    {firmData.practice_areas?.map((area) => (
                      <span
                        key={area}
                        className="rounded-full bg-[#2C337A] px-3 py-1 text-xs font-semibold text-white"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Main content: description + meta sidebar on clean white */}
      <section
        className="bg-white"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingBottom: "clamp(60px, 8vh, 100px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-16 gap-y-16">
            {/* Left column — description */}
            <div className="lg:col-span-8">
              {firmData.description && (
                <div className="mb-16">
                  <h2
                    className="font-bold mb-6"
                    style={{
                      fontSize: "clamp(24px, 2.5vw, 36px)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                      color: "#0A0A0A",
                    }}
                  >
                    Over {firmData.name}
                  </h2>
                  <p
                    className="leading-relaxed whitespace-pre-line"
                    style={{
                      fontSize: "clamp(15px, 1.1vw, 17px)",
                      lineHeight: 1.65,
                      color: "#6B6B6B",
                      maxWidth: "640px",
                    }}
                  >
                    {firmData.description}
                  </p>
                </div>
              )}

              {firmData.why_work_with_us && (
                <div>
                  <h2
                    className="font-bold mb-6"
                    style={{
                      fontSize: "clamp(24px, 2.5vw, 36px)",
                      lineHeight: 1.15,
                      letterSpacing: "-0.02em",
                      color: "#0A0A0A",
                    }}
                  >
                    Waarom hier werken
                  </h2>
                  <p
                    className="leading-relaxed whitespace-pre-line"
                    style={{
                      fontSize: "clamp(15px, 1.1vw, 17px)",
                      lineHeight: 1.65,
                      color: "#6B6B6B",
                      maxWidth: "640px",
                    }}
                  >
                    {firmData.why_work_with_us}
                  </p>
                </div>
              )}
            </div>

            {/* Right column — meta sidebar */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-4">
                {firmData.location && (
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <p
                      className="text-[13px] font-medium uppercase tracking-[0.02em] mb-1"
                      style={{ color: "#999999" }}
                    >
                      Locatie
                    </p>
                    <p className="text-[15px]" style={{ color: "#0A0A0A" }}>
                      {firmData.location}
                    </p>
                  </div>
                )}

                {firmData.team_size && (
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <p
                      className="text-[13px] font-medium uppercase tracking-[0.02em] mb-1"
                      style={{ color: "#999999" }}
                    >
                      Teamgrootte
                    </p>
                    <p className="text-[15px]" style={{ color: "#0A0A0A" }}>
                      {firmData.team_size} medewerkers
                    </p>
                  </div>
                )}

                {firmData.salary_indication && (
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <p
                      className="text-[13px] font-medium uppercase tracking-[0.02em] mb-1"
                      style={{ color: "#999999" }}
                    >
                      Salarisindicatie
                    </p>
                    <p className="text-[15px]" style={{ color: "#0A0A0A" }}>
                      {firmData.salary_indication}
                    </p>
                  </div>
                )}

                {firmData.practice_areas && firmData.practice_areas.length > 0 && (
                  <div className="border-b border-[#E5E5E5] pb-4">
                    <p
                      className="text-[13px] font-medium uppercase tracking-[0.02em] mb-2"
                      style={{ color: "#999999" }}
                    >
                      Rechtsgebieden
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {firmData.practice_areas.map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(firmData.website_url || firmData.linkedin_url) && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {firmData.website_url && (
                      <a
                        href={firmData.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        Website
                      </a>
                    )}
                    {firmData.linkedin_url && (
                      <a
                        href={firmData.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Vacancies section */}
      <section
        style={{
          paddingTop: "clamp(40px, 6vh, 80px)",
          paddingBottom: "clamp(100px, 12vh, 180px)",
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <h2
            className="font-bold"
            style={{
              fontSize: "clamp(36px, 4.5vw, 64px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#0A0A0A",
            }}
          >
            Openstaande vacatures
            {jobList.length > 0 && (
              <span
                className="ml-3 font-normal"
                style={{
                  fontSize: "clamp(18px, 1.5vw, 22px)",
                  color: "#999999",
                }}
              >
                ({jobList.length})
              </span>
            )}
          </h2>

          {jobList.length > 0 ? (
            <div className="mt-10 space-y-4">
              {jobList.map((job) => (
                <JobCard
                  key={job.id}
                  job={{ ...job, firms: firmPreview }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <p
                className="leading-relaxed"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#6B6B6B",
                  maxWidth: "640px",
                }}
              >
                Momenteel geen openstaande vacatures bij {firmData.name}.
                Bekijk onze andere werkgevers of kom later terug.
              </p>
              <Link href="/werkgevers" className="btn-primary mt-8">
                Alle werkgevers bekijken
              </Link>
            </div>
          )}
        </div>
      </section>

      <CtaBand />

      <Footer />
    </div>
  );
}
