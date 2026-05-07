import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Building2,
  Globe2,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import JobGridCard from "@/components/JobGridCard";
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

  if (!firm) return { title: "Company not found" };

  return {
    title: `${firm.name}`,
    description:
      firm.description?.substring(0, 160) ??
      `View the profile of ${firm.name} on Finance Talents.`,
    alternates: {
      canonical: `/companies/${slug}`,
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
  const primaryPracticeArea = firmData.practice_areas?.[0] ?? "Finance company";
  const hasContactDetails = !!(
    firmData.contact_person ||
    firmData.notification_email ||
    firmData.phone ||
    firmData.website_url ||
    firmData.linkedin_url
  );

  const hasHeroPracticeTags =
    !!(firmData.practice_areas && firmData.practice_areas.length > 0);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#EBEBEB] text-[#222222]">
      <NavbarPublic variant="hero" />

      <div className="-mt-[4.25rem]">
        <section className="relative isolate overflow-hidden bg-[#EBEBEB]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[22vw] top-[9vh] h-[58vw] max-h-[760px] min-h-[340px] w-[58vw] min-w-[340px] max-w-[760px] overflow-hidden rounded-full border border-[#222222]/10"
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
            aria-hidden="true"
            className="pointer-events-none absolute -left-[16vw] bottom-[-26vw] h-[46vw] max-h-[620px] min-h-[300px] w-[46vw] min-w-[300px] max-w-[620px] overflow-hidden rounded-full bg-white"
          >
            <Image
              src="/icon FT.png"
              alt=""
              fill
              className="object-contain opacity-[0.12]"
              sizes="46vw"
            />
          </div>

          <div
            className="max-w-[1600px] mx-auto relative"
            style={{
              padding:
                "calc(4.25rem + clamp(40px, 7vh, 96px)) clamp(24px, 5vw, 80px) clamp(56px, 8vh, 120px)",
            }}
          >
            <div className="text-[#222222]">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Companies", href: "/companies" },
                  { label: firmData.name, href: `/companies/${firmData.slug}` },
                ]}
              />
            </div>

            <div className="mt-10 grid min-h-[calc(72vh-4.25rem)] grid-cols-1 content-between gap-12">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-9">
                  <p className="ft-display text-[15px] font-normal tracking-[-0.02em] text-[#222222]/70 md:text-[18px]">
                    {primaryPracticeArea}
                  </p>
                  <h1 className="ft-display mt-7 max-w-[11ch] text-[clamp(62px,13vw,210px)] font-extrabold leading-[0.82] tracking-[-0.08em] text-[#222222]">
                    {firmData.name}
                  </h1>
                </div>

                <div className="lg:col-span-3 lg:flex lg:justify-end">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden border border-[#222222] bg-white p-4 md:h-32 md:w-32">
                    {firmData.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={firmData.logo_url}
                        alt={`${firmData.name} logo`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="ft-display text-[24px] font-bold tracking-[-0.05em] text-[#222222]">
                        {initials}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-5 lg:col-start-8">
                  <p className="max-w-[560px] text-[clamp(18px,2vw,28px)] leading-[1.15] tracking-[-0.03em] text-[#222222]">
                    Explore the company profile, active finance roles and key
                    contact details.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {firmData.location && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#222222] px-3 py-1 text-[13px] font-medium text-[#222222]">
                        <MapPin className="h-3.5 w-3.5" />
                        {firmData.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#222222] px-3 py-1 text-[13px] font-medium text-[#222222]">
                      <Building2 className="h-3.5 w-3.5" />
                      {jobList.length} open role{jobList.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        className="bg-white"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(70px, 9vh, 140px)",
          paddingBottom: "clamp(80px, 10vh, 150px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <p className="ft-display text-[15px] text-[#222222]/55">
                Company profile
              </p>
              <h2 className="ft-display mt-4 max-w-[760px] text-[clamp(48px,7vw,112px)] font-extrabold leading-[0.88] tracking-[-0.075em] text-[#222222]">
                What to know.
              </h2>
            </div>

            <div className="lg:col-span-5">
              {firmData.description && (
                <div>
                  <h3 className="ft-display text-[clamp(28px,3vw,48px)] font-bold leading-[0.95] tracking-[-0.06em] text-[#222222]">
                    About {firmData.name}
                  </h3>
                  <p className="mt-5 max-w-[640px] whitespace-pre-line text-[16px] leading-[1.7] text-[#222222]/65">
                    {firmData.description}
                  </p>
                </div>
              )}

              {firmData.why_work_with_us && (
                <div className={firmData.description ? "mt-12" : ""}>
                  <h3 className="ft-display text-[clamp(28px,3vw,48px)] font-bold leading-[0.95] tracking-[-0.06em] text-[#222222]">
                    Why work here
                  </h3>
                  <p className="mt-5 max-w-[640px] whitespace-pre-line text-[16px] leading-[1.7] text-[#222222]/65">
                    {firmData.why_work_with_us}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 border border-[#222222] bg-white lg:grid-cols-4">
            {firmData.location && (
              <div className="border-b border-[#222222] p-6 lg:border-b-0 lg:border-r">
                <MapPin className="mb-8 h-5 w-5 text-[#E85A00]" />
                <p className="text-[13px] text-[#222222]/55">Location</p>
                <p className="mt-2 text-[18px] leading-[1.25] tracking-[-0.03em] text-[#222222]">
                  {firmData.location}
                </p>
              </div>
            )}

            {firmData.team_size && (
              <div className="border-b border-[#222222] p-6 lg:border-b-0 lg:border-r">
                <Users className="mb-8 h-5 w-5 text-[#E85A00]" />
                <p className="text-[13px] text-[#222222]/55">Team size</p>
                <p className="mt-2 text-[18px] leading-[1.25] tracking-[-0.03em] text-[#222222]">
                  {firmData.team_size} employees
                </p>
              </div>
            )}

            {firmData.salary_indication && (
              <div className="border-b border-[#222222] p-6 lg:border-b-0 lg:border-r">
                <Building2 className="mb-8 h-5 w-5 text-[#E85A00]" />
                <p className="text-[13px] text-[#222222]/55">
                  Salary indication
                </p>
                <p className="mt-2 text-[18px] leading-[1.25] tracking-[-0.03em] text-[#222222]">
                  {firmData.salary_indication}
                </p>
              </div>
            )}

            <div className="p-6">
              <ArrowUpRight className="mb-8 h-5 w-5 text-[#E85A00]" />
              <p className="text-[13px] text-[#222222]/55">Active roles</p>
              <p className="mt-2 text-[18px] leading-[1.25] tracking-[-0.03em] text-[#222222]">
                {jobList.length} open position{jobList.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative isolate overflow-hidden"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(70px, 9vh, 140px)",
          paddingBottom: "clamp(80px, 10vh, 150px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-10 grid grid-cols-1 gap-8 md:mb-16 lg:grid-cols-12 lg:items-end">
            <h2 className="ft-display lg:col-span-8 text-[clamp(54px,9vw,132px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
              Open roles.
            </h2>
            <div className="lg:col-span-4">
              <p className="max-w-[430px] text-[17px] leading-[1.45] tracking-[-0.02em] text-[#222222]/65">
                {jobList.length === 0
                  ? `No active roles at ${firmData.name} right now.`
                  : `Showing ${jobList.length} active role${
                      jobList.length === 1 ? "" : "s"
                    } at ${firmData.name}.`}
              </p>
            </div>
          </div>

          {jobList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {jobList.map((job) => (
                <JobGridCard
                  key={job.id}
                  job={{ ...job, firms: firmPreview }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 border border-[#222222] bg-white lg:grid-cols-12">
              <div className="p-6 md:p-8 lg:col-span-7">
                <h3 className="ft-display max-w-[720px] text-[clamp(42px,7vw,104px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
                  Check back soon.
                </h3>
              </div>
              <div className="border-t border-[#222222] p-6 md:p-8 lg:col-span-5 lg:border-l lg:border-t-0">
                <p className="max-w-[460px] text-[16px] leading-[1.65] text-[#222222]/65">
                  No open positions at {firmData.name} at the moment. Browse
                  other companies or check back later.
                </p>
                <Link href="/companies" className="btn-primary mt-8">
                  View all companies
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {(hasHeroPracticeTags || hasContactDetails) && (
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

          <div className="max-w-[1400px] mx-auto grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="ft-display max-w-[780px] text-[clamp(54px,9vw,142px)] font-extrabold leading-[0.88] tracking-[-0.075em] text-white">
                Details and contact.
              </h2>
            </div>

            <div className="lg:col-span-5">
              {hasHeroPracticeTags && (
                <div>
                  <p className="text-[13px] text-white/45">Sectors</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {firmData.practice_areas?.map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-white/25 px-3 py-1 text-[13px] font-medium text-white transition-colors duration-200 hover:border-[#E85A00] hover:text-[#E85A00]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasContactDetails && (
                <div className={hasHeroPracticeTags ? "mt-10" : ""}>
                  <p className="text-[13px] text-white/45">Contact</p>
                  <div className="mt-4 divide-y divide-white/15 border-y border-white/15">
                    {firmData.contact_person && (
                      <div className="flex items-center justify-between gap-4 py-4 text-white">
                        <span className="text-[15px] text-white/60">
                          Contact person
                        </span>
                        <span className="text-right text-[15px]">
                          {firmData.contact_person}
                        </span>
                      </div>
                    )}
                    {firmData.notification_email && (
                      <a
                        href={`mailto:${firmData.notification_email}`}
                        className="flex items-center justify-between gap-4 py-4 text-white transition-colors duration-200 hover:text-[#E85A00]"
                      >
                        <span className="inline-flex items-center gap-2 text-[15px] text-white/60">
                          <Mail className="h-4 w-4" />
                          E-mail
                        </span>
                        <span className="text-right text-[15px]">
                          {firmData.notification_email}
                        </span>
                      </a>
                    )}
                    {firmData.phone && (
                      <a
                        href={`tel:${firmData.phone}`}
                        className="flex items-center justify-between gap-4 py-4 text-white transition-colors duration-200 hover:text-[#E85A00]"
                      >
                        <span className="inline-flex items-center gap-2 text-[15px] text-white/60">
                          <Phone className="h-4 w-4" />
                          Phone
                        </span>
                        <span className="text-right text-[15px]">
                          {firmData.phone}
                        </span>
                      </a>
                    )}
                    {firmData.website_url && (
                      <a
                        href={firmData.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 py-4 text-white transition-colors duration-200 hover:text-[#E85A00]"
                      >
                        <span className="inline-flex items-center gap-2 text-[15px] text-white/60">
                          <Globe2 className="h-4 w-4" />
                          Website
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0" />
                      </a>
                    )}
                    {firmData.linkedin_url && (
                      <a
                        href={firmData.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 py-4 text-white transition-colors duration-200 hover:text-[#E85A00]"
                      >
                        <span className="inline-flex items-center gap-2 text-[15px] text-white/60">
                          <Linkedin className="h-4 w-4" />
                          LinkedIn
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <CtaBand />

      <Footer />
    </div>
  );
}
