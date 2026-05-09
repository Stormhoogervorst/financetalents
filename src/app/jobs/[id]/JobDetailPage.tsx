import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import ApplicationForm from "@/components/ApplicationForm";
import ApplicationStatusToast from "@/components/ApplicationStatusToast";
import LinkedInQuickApply from "@/components/LinkedInQuickApply";
import JobGridCard from "@/components/JobGridCard";
import { Job, Firm, JobFirmPreview, jobTypeLabels } from "@/types";
import { Metadata } from "next";
import { CITIES, cityDisplayName } from "@/lib/cities";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getRechtsgebiedSlug } from "@/lib/constants/rechtsgebieden";
import {
  buildJobPostingSchema,
  computeValidThrough,
} from "@/lib/schemas/jobPosting";

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
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
}

export async function generateJobDetailMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("jobs")
    .select("title, description, location, firms(name)")
    .eq("slug", id)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return { title: "Job not found" };

  const firmName = Array.isArray(data.firms)
    ? data.firms[0]?.name
    : (data.firms as { name: string } | null)?.name;

  const plainDescription = data.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const metaTitle = `${data.title}${firmName ? ` at ${firmName}` : ""}${
    data.location ? ` in ${data.location}` : ""
  }`;
  const roleContext = `${firmName ? `${data.title} at ${firmName}` : data.title}${
    data.location ? ` in ${data.location}` : ""
  }`;
  const metaDescription = `${roleContext}. ${plainDescription}`.substring(0, 160);

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: `/jobs/${id}`,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `/jobs/${id}`,
    },
  };
}

export default async function JobDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
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
    .eq("slug", id)
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

  const postedDate = new Date(typedJob.created_at).toLocaleDateString("en-US", {
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
  const cityName = citySlug ? cityDisplayName(citySlug) : null;
  const sectorSlug = typedJob.practice_area
    ? getRechtsgebiedSlug(typedJob.practice_area)
    : null;
  const pageTitle = `${typedJob.title}${firm?.name ? ` at ${firm.name}` : ""}${
    typedJob.location ? ` in ${typedJob.location}` : ""
  }`;
  const typeLabel = jobTypeLabels[typedJob.type] ?? typedJob.type;
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Jobs", href: "/jobs" },
    ...(citySlug
      ? [{ label: cityName ?? typedJob.location, href: `/jobs/${citySlug}` }]
      : []),
    { label: pageTitle, href: `/jobs/${typedJob.slug}` },
  ];

  const metaItems: { label: string; value: string }[] = [];
  if (typedJob.location) metaItems.push({ label: "Location", value: typedJob.location });
  metaItems.push({ label: "Type", value: typeLabel });
  if (typedJob.practice_area) metaItems.push({ label: "Sector", value: typedJob.practice_area });
  if (typedJob.start_date) {
    metaItems.push({
      label: "Start date",
      value: new Date(typedJob.start_date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    });
  }
  if (typedJob.required_education) metaItems.push({ label: "Education", value: typedJob.required_education });
  if (typedJob.salary_indication) metaItems.push({ label: "Salary", value: typedJob.salary_indication });
  if (typedJob.hours_per_week) metaItems.push({ label: "Hours per week", value: `${typedJob.hours_per_week}` });

  let relatedQuery = supabase
    .from("jobs")
    .select("*, firms ( name, logo_url, slug )")
    .eq("status", "active")
    .neq("id", typedJob.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (typedJob.practice_area) {
    relatedQuery = relatedQuery.ilike(
      "practice_area",
      `%${typedJob.practice_area}%`,
    );
  } else if (typedJob.location) {
    relatedQuery = relatedQuery.ilike("location", `%${typedJob.location}%`);
  }

  const { data: relatedJobs } = await relatedQuery;
  type JobWithFirm = Omit<Job, "firms"> & { firms: JobFirmPreview | null };
  const similarJobs = (relatedJobs ?? []).map((relatedJob) => ({
    ...relatedJob,
    firms: Array.isArray(relatedJob.firms)
      ? (relatedJob.firms[0] ?? null)
      : (relatedJob.firms ?? null),
  })) as JobWithFirm[];

  const quickApplyCard = (
    <div className="relative isolate overflow-hidden bg-[#0A0A0A] p-6 text-white md:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-20 -z-10 h-64 w-64 overflow-hidden rounded-full border border-white/15 opacity-45"
      >
        <Image
          src="/icon FT.png"
          alt=""
          fill
          className="object-contain"
          sizes="256px"
        />
      </div>
      <p className="ft-display text-[15px] tracking-[-0.02em] text-white/55">
        Quick apply
      </p>
      <h2 className="ft-display mt-4 text-[clamp(36px,4vw,64px)] font-extrabold leading-[0.9] tracking-[-0.07em] text-white">
        Start in one minute.
      </h2>
      <p className="mt-5 text-[15px] leading-[1.65] text-white/65">
        Apply with your LinkedIn profile. No CV needed for the quick route.
      </p>
      <div className="mt-8">
        <LinkedInQuickApply
          jobId={typedJob.id}
          jobSlug={typedJob.slug}
          alreadyApplied={alreadyApplied}
        />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-[#EBEBEB] text-[#222222]">
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

      <div className="-mt-[4.25rem]">
        <section className="relative isolate overflow-hidden bg-[#EBEBEB]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-0 h-36 w-36 overflow-hidden rounded-full border border-[#222222]/10 md:-right-[22vw] md:top-[8vh] md:h-[58vw] md:max-h-[780px] md:min-h-[340px] md:w-[58vw] md:min-w-[340px] md:max-w-[780px]"
          >
            <Image
              src="/icon FT.png"
              alt=""
              fill
              className="object-contain opacity-[0.08] md:opacity-[0.16]"
              sizes="(min-width: 768px) 58vw, 144px"
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
            <div className="grid grid-cols-1 gap-8 md:min-h-[calc(76vh-4.25rem)] md:content-between md:gap-14">
              <div>
                <div className="text-[#222222]/70">
                  <Breadcrumbs
                    items={breadcrumbItems}
                    mobileMaxItems={3}
                    truncateLastAfter={60}
                  />
                </div>

                <h1 className="ft-display mt-6 max-w-[16ch] text-[clamp(42px,8vw,128px)] font-extrabold leading-[0.88] tracking-[-0.07em] text-[#222222] md:mt-8">
                  {typedJob.title}
                </h1>
                <div className="mt-3 text-[clamp(15px,1.3vw,18px)] leading-[1.4] tracking-[-0.02em] text-[#222222]/60">
                  {firm?.name && firm.slug && (
                    <Link
                      href={`/companies/${firm.slug}`}
                      className="font-medium text-[#222222]/70 transition-colors duration-200 hover:text-[#E85A00]"
                    >
                      {firm.name}
                    </Link>
                  )}
                  {firm?.name && !firm.slug && (
                    <span className="font-medium text-[#222222]/70">
                      {firm.name}
                    </span>
                  )}
                  {(typedJob.location || typeLabel) && (
                    <p className="mt-1 text-[#222222]/45">
                      {[typedJob.location, typeLabel].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
                <div className="flex items-center gap-4 lg:col-span-5">
                  {firm && (
                    <Link
                      href={firm.slug ? `/companies/${firm.slug}` : "#"}
                      className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-[#222222] bg-white transition-colors duration-200 hover:border-[#E85A00]"
                    >
                      {firm.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firm.logo_url}
                          alt={`${firm.name} logo`}
                          className="h-11 w-11 object-contain"
                        />
                      ) : (
                        <span className="text-[14px] font-semibold text-[#222222]/55">
                          {firm.name?.slice(0, 2).toUpperCase() ?? "??"}
                        </span>
                      )}
                    </Link>
                  )}
                  <div>
                    <p className="text-[14px] text-[#222222]/55">
                      Posted {postedDate}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-5 lg:col-start-8">
                  <div className="flex flex-wrap gap-3">
                    <a href="#apply" className="btn-primary">
                      Apply now
                    </a>
                    <Link href="/jobs" className="btn-secondary">
                      Back to jobs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        className="bg-[#EBEBEB] pb-0 md:pb-[clamp(32px,5vh,64px)]"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(32px, 5vh, 64px)",
        }}
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
            {metaItems.map((item) => (
              <div
                key={item.label}
                className="min-h-[132px] border border-[#222222] bg-white p-5"
              >
                <p className="text-[14px] text-[#222222]/55">{item.label}</p>
                <p className="ft-display mt-8 text-[clamp(22px,2vw,32px)] font-extrabold leading-[0.95] tracking-[-0.055em] text-[#222222]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="pt-12 md:pt-[clamp(70px,9vh,140px)]"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingBottom: "clamp(80px, 10vh, 150px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="order-2 lg:order-1 lg:col-span-8">
              {typedJob.description && (
                <div>
                  <p className="ft-display text-[15px] tracking-[-0.02em] text-[#222222]/60">
                    About this role
                  </p>
                  <h2 className="ft-display mt-5 max-w-[760px] text-[clamp(48px,7vw,112px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
                    The opportunity.
                  </h2>
                  <div
                    className="mt-10 max-w-[760px] text-[#222222]/70 [&_a]:text-[#E85A00] [&_a]:underline [&_a]:decoration-[#E85A00]/30 [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-[clamp(28px,3vw,44px)] [&_h2]:font-extrabold [&_h2]:leading-[0.95] [&_h2]:tracking-[-0.055em] [&_h2]:text-[#222222] [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-[24px] [&_h3]:font-extrabold [&_h3]:tracking-[-0.04em] [&_h3]:text-[#222222] [&_li]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-5 [&_strong]:font-semibold [&_strong]:text-[#222222] [&_ul]:list-disc [&_ul]:pl-5"
                    style={{
                      fontSize: "clamp(16px, 1.15vw, 18px)",
                      lineHeight: 1.65,
                    }}
                    dangerouslySetInnerHTML={{ __html: typedJob.description }}
                  />
                </div>
              )}

              <section id="apply" className="mt-20">
                <div className="border border-[#222222] bg-white">
                  <div className="border-b border-[#222222] p-6 md:p-8">
                    <p className="ft-display text-[15px] tracking-[-0.02em] text-[#222222]/60">
                      Application
                    </p>
                    <h2 className="ft-display mt-4 max-w-[720px] text-[clamp(44px,7vw,104px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
                      Apply directly.
                    </h2>
                  </div>
                  <div className="p-6 md:p-8">
                    <ApplicationForm
                      jobId={typedJob.id}
                      jobTitle={typedJob.title}
                      firmName={firm?.name ?? ""}
                    />
                  </div>
                </div>
              </section>
            </div>

            <aside className="contents lg:order-2 lg:col-span-4 lg:block">
              <div className="contents lg:sticky lg:top-24 lg:block lg:space-y-6">
                <div className="order-1 lg:order-none">{quickApplyCard}</div>

                <div className="order-3 space-y-6 lg:order-none">
                  {firm && (
                    <div className="border border-[#222222] bg-white">
                      <div className="flex items-center gap-4 border-b border-[#222222] p-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-[#222222] bg-white">
                          {firm.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={firm.logo_url}
                              alt={`${firm.name} logo`}
                              className="h-10 w-10 object-contain"
                            />
                          ) : (
                            <span className="text-[13px] font-semibold text-[#222222]/55">
                              {firm.name?.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-[17px] font-medium tracking-[-0.02em] text-[#222222]">
                            {firm.name}
                          </p>
                          {firm.location && (
                            <p className="mt-1 text-[14px] text-[#222222]/55">
                              {firm.location}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-5">
                        {firm.description && (
                          <p
                            className="text-[#222222]/65"
                            style={{
                              fontSize: "clamp(14px, 1vw, 15px)",
                              lineHeight: 1.65,
                            }}
                          >
                            {firm.description.length > 220
                              ? `${firm.description.substring(0, 220)}...`
                              : firm.description}
                          </p>
                        )}

                        {firm.practice_areas && firm.practice_areas.length > 0 && (
                          <div className="mt-6 border-t border-[#222222]/15 pt-5">
                            <p className="text-[14px] text-[#222222]/55">
                              Sectors
                            </p>
                            <p className="mt-2 text-[15px] leading-relaxed text-[#222222]">
                              {firm.practice_areas.join(" / ")}
                            </p>
                          </div>
                        )}

                        {firm.team_size && (
                          <div className="mt-6 border-t border-[#222222]/15 pt-5">
                            <p className="text-[14px] text-[#222222]/55">
                              Team size
                            </p>
                            <p className="mt-2 text-[15px] text-[#222222]">
                              {firm.team_size}
                            </p>
                          </div>
                        )}

                        <div className="mt-6 flex flex-col gap-3 border-t border-[#222222]/15 pt-5">
                          {firm.slug && (
                            <Link
                              href={`/companies/${firm.slug}`}
                              className="btn-primary w-full"
                            >
                              More about this company
                            </Link>
                          )}
                          {firm.website_url && (
                            <a
                              href={firm.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary w-full"
                            >
                              Website
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border border-[#222222] bg-[#EBEBEB] p-5">
                    <p className="ft-display text-[15px] tracking-[-0.02em] text-[#222222]/60">
                      Job details
                    </p>
                    <div className="mt-5 space-y-4">
                      {metaItems.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-start justify-between gap-5 border-t border-[#222222]/15 pt-4"
                        >
                          <p className="text-[14px] text-[#222222]/55">
                            {item.label}
                          </p>
                          <p className="max-w-[55%] text-right text-[14px] font-medium text-[#222222]">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(citySlug || sectorSlug) && (
                    <div className="border border-[#222222] bg-white p-5">
                      <p className="ft-display text-[15px] tracking-[-0.02em] text-[#222222]/60">
                        Explore more
                      </p>
                      <div className="mt-5 flex flex-col gap-3">
                        {citySlug && cityName && (
                          <Link
                            href={`/jobs/${citySlug}`}
                            className="inline-flex items-center justify-between border-t border-[#222222]/15 pt-4 text-[14px] font-medium text-[#222222] transition-colors duration-200 hover:text-[#E85A00]"
                          >
                            Jobs in {cityName}
                            <span aria-hidden>↗</span>
                          </Link>
                        )}
                        {sectorSlug && typedJob.practice_area && (
                          <Link
                            href={`/jobs/${sectorSlug}`}
                            className="inline-flex items-center justify-between border-t border-[#222222]/15 pt-4 text-[14px] font-medium text-[#222222] transition-colors duration-200 hover:text-[#E85A00]"
                          >
                            {typedJob.practice_area} jobs
                            <span aria-hidden>↗</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {similarJobs.length > 0 && (
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
              <h2 className="ft-display lg:col-span-8 text-[clamp(54px,9vw,132px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
                Similar roles.
              </h2>
              <div className="lg:col-span-4">
                <p className="max-w-[390px] text-[17px] leading-[1.45] tracking-[-0.02em] text-[#222222]/65">
                  Keep exploring roles that match this opportunity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {similarJobs.map((relatedJob) => (
                <JobGridCard key={relatedJob.id} job={relatedJob} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
