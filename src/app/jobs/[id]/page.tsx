import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CITIES, cityDisplayName, isValidCity } from "@/lib/cities";
import { getCityJobCount } from "@/lib/jobs/getCityJobCount";
import {
  getRechtsgebiedBySlug,
  getRechtsgebiedSlug,
  RECHTSGEBIED_SEO,
  RECHTSGEBIEDEN,
} from "@/lib/constants/rechtsgebieden";
import JobsListingPage, {
  JobsSearchParams,
} from "../JobsListingPage";
import JobDetailPage, { generateJobDetailMetadata } from "./JobDetailPage";

export const revalidate = 0;

type SearchParams = JobsSearchParams;

const CITY_MARKET_NOTES: Record<string, string> = {
  amsterdam:
    "Amsterdam is the largest finance jobs market in the Netherlands, with private equity funds, venture capital investors, investment banks, fintech scaleups and corporate finance boutiques concentrated around the Zuidas and wider startup ecosystem.",
  rotterdam:
    "Rotterdam combines an international port economy with finance roles in logistics, energy, infrastructure, trade finance and corporate advisory, making it a strong city for professionals who want finance work close to operating companies.",
  utrecht:
    "Utrecht has a compact but active finance market, with roles at investment teams, insurers, advisory firms, fintech companies and corporates that benefit from the city's central location.",
  "den-haag":
    "Den Haag offers finance roles connected to impact investing, public-private partnerships, international institutions, energy, infrastructure and advisory work for government-linked clients.",
  eindhoven:
    "Eindhoven's finance market is shaped by deep tech, hardware, venture capital, corporate development and the wider Brainport ecosystem.",
  groningen:
    "Groningen offers finance opportunities around regional investment funds, sustainability, startups and advisory firms serving the north of the Netherlands.",
  tilburg:
    "Tilburg has a practical finance market across corporate finance, analytics, insurance, controlling and regional investment activity.",
  breda:
    "Breda combines regional advisory work, private companies and cross-border activity with Belgium, creating finance roles in corporate finance, accounting and investment support.",
  nijmegen:
    "Nijmegen's market is smaller but relevant for finance professionals interested in healthcare, impact, sustainability and regional corporate finance assignments.",
  enschede:
    "Enschede connects finance jobs to technology, university spinouts, venture building and regional investment networks in Twente.",
  arnhem:
    "Arnhem offers finance opportunities linked to energy, infrastructure, insurance and regional business services.",
  "den-bosch":
    "Den Bosch has a regional finance market with corporate finance boutiques, private companies and investment teams active across Brabant.",
  maastricht:
    "Maastricht is a cross-border finance market where Dutch, Belgian and German business activity creates opportunities in advisory, investment and corporate roles.",
  leiden:
    "Leiden combines university talent, life sciences, venture activity and advisory firms, creating finance job opportunities near both Amsterdam and Den Haag.",
};

function normalizeCitySlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

function getCityIntro(name: string, city: string, count: number) {
  const countText =
    count === 0
      ? `There are currently no active finance jobs listed in ${name}, but the city remains relevant for candidates tracking new openings.`
      : `There ${count === 1 ? "is" : "are"} currently ${count} active finance ${
          count === 1 ? "job" : "jobs"
        } in ${name} on Finance Talents.`;
  const marketNote = CITY_MARKET_NOTES[city];

  return (
    <>
      <p>
        {marketNote} Candidates looking for finance jobs in {name} can use
        this page to compare opportunities across Private Equity, Venture
        Capital, Investment Banking, FinTech and related investment roles.
      </p>
      <p className="mt-5">
        {countText} The listings are filtered to roles in {name}, so you can
        focus on relevant firms without searching through every national
        vacancy. Use the filters for role, type and sector to narrow the page to
        jobs that match your experience, preferred finance domain and next
        career step.
      </p>
      <p className="mt-5">
        Finance jobs in {name} can offer exposure to deals, portfolio companies,
        financial modelling, investment analysis, strategy and transaction
        execution. New roles can appear throughout the year, so this city page is
        a practical starting point when you want to monitor openings and apply
        directly to the companies hiring finance talent.
      </p>
    </>
  );
}

export async function generateStaticParams() {
  return [
    ...CITIES.map((city) => ({ id: city })),
    ...RECHTSGEBIEDEN.map((area) => ({ id: getRechtsgebiedSlug(area) })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: rawId } = await params;
  const sector = getRechtsgebiedBySlug(rawId);

  if (sector) {
    const seo = RECHTSGEBIED_SEO[sector];

    return {
      title: seo.title,
      description: seo.description,
      alternates: {
        canonical: `/jobs/${rawId}`,
      },
      keywords: [
        `${sector} jobs`,
        `${sector} vacancies`,
        "finance jobs",
        "Finance Talents",
      ],
      openGraph: {
        title: seo.title,
        description: seo.description,
        url: `/jobs/${rawId}`,
      },
    };
  }

  const city = normalizeCitySlug(rawId);
  if (!isValidCity(city)) {
    return generateJobDetailMetadata({
      params,
      searchParams: Promise.resolve({}),
    });
  }

  const name = cityDisplayName(city);
  const count = await getCityJobCount(city);
  const countText =
    count === 0
      ? `Discover finance jobs in ${name} at Private Equity, Venture Capital, Investment Banking and FinTech companies.`
      : `Browse ${count} finance ${count === 1 ? "job" : "jobs"} in ${name} at Private Equity, Venture Capital, Investment Banking and FinTech companies.`;

  const baseKeywords = [
    "finance jobs",
    "jobs",
    name,
    `finance jobs ${name}`,
    `jobs ${name}`,
    "private equity",
    `private equity ${name}`,
    "Finance Talents",
  ];

  return {
    title: `Jobs in ${name} | Finance Talents`,
    description: `${countText} Apply directly through Finance Talents.`,
    robots: { index: true, follow: true },
    keywords: baseKeywords,
    alternates: {
      canonical: `/jobs/${city}`,
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
  const { id: rawId } = await params;
  const sp = await searchParams;

  const sector = getRechtsgebiedBySlug(rawId);
  if (sector) {
    const seo = RECHTSGEBIED_SEO[sector];

    return (
      <JobsListingPage
        params={sp}
        fixedPracticeArea={sector}
        basePath={`/jobs/${rawId}`}
        headingText={`${sector} jobs`}
        subtitleText={seo.description}
        heroHeadingClassName="max-w-[14ch] text-[clamp(42px,8vw,128px)] leading-[0.88] tracking-[-0.07em]"
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Jobs", href: "/jobs" },
          { label: sector, href: `/jobs/${rawId}` },
        ]}
      />
    );
  }

  const city = normalizeCitySlug(rawId);
  if (city !== rawId && isValidCity(city)) permanentRedirect(`/jobs/${city}`);
  if (!isValidCity(city)) {
    return (
      <JobDetailPage
        params={params}
        searchParams={searchParams as Promise<{ error?: string; status?: string }>}
      />
    );
  }

  const name = cityDisplayName(city);
  const count = await getCityJobCount(city);
  const subtitleText =
    count === 0
      ? `No active finance jobs in ${name} right now, but this page tracks roles at Private Equity, Venture Capital, Investment Banking and FinTech companies.`
      : `${count} finance ${count === 1 ? "job" : "jobs"} in ${name} at Private Equity, Venture Capital, Investment Banking and FinTech companies.`;
  const otherCityLinks = CITIES.filter((otherCity) => otherCity !== city).map(
    (otherCity) => ({
      label: `Jobs in ${cityDisplayName(otherCity)}`,
      href: `/jobs/${otherCity}`,
    })
  );

  return (
    <JobsListingPage
      params={sp}
      basePath={`/jobs/${city}`}
      fixedLocation={name}
      headingText={`Jobs in ${name}`}
      subtitleText={subtitleText}
      heroHeadingClassName="max-w-[14ch] text-[clamp(42px,8vw,128px)] leading-[0.88] tracking-[-0.07em]"
      filterHelperText={`Filter jobs in ${name} by role, type and sector. Apply directly to the company when you find a fit.`}
      resultsHeadingText={`Open roles in ${name}.`}
      emptyState={{
        filteredTitle: "No jobs found.",
        defaultTitle: `Coming soon in ${name}.`,
        filteredText:
          "Try another role, type or sector to uncover more openings.",
        defaultText: `No active jobs in ${name} at the moment. Check back soon for new opportunities.`,
        viewAllText: "View all city jobs",
      }}
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "Jobs", href: "/jobs" },
        { label: name, href: `/jobs/${city}` },
      ]}
      itemListSchemaName={`Jobs in ${name}`}
      seoIntroContent={getCityIntro(name, city, count)}
      internalLinksSection={{
        heading: "Jobs in other cities",
        links: otherCityLinks,
      }}
    />
  );
}
