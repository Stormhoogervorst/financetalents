import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CITIES, cityDisplayName, isValidCity } from "@/lib/cities";
import { getCityJobCount } from "@/lib/jobs/getCityJobCount";
import JobsListingPage, {
  JobsSearchParams,
} from "@/app/jobs/JobsListingPage";

export const revalidate = 0;

const STAGE_TYPE_VALUES = ["stage", "internship", "student", "Studentbaan"];

type SearchParams = JobsSearchParams;

const CITY_MARKET_NOTES: Record<string, string> = {
  amsterdam:
    "Amsterdam is the largest finance internship market in the Netherlands, with private equity funds, venture capital investors, fintech scaleups and corporate finance boutiques clustered around the Zuidas, canal belt and startup ecosystem.",
  rotterdam:
    "Rotterdam combines an international port economy with deal activity in logistics, energy, infrastructure and trade finance, making it a strong market for students who want finance experience close to the real economy.",
  utrecht:
    "Utrecht has a compact but active finance market, with investment teams, advisory firms, insurers and fintech companies drawing talent from a large student population and central transport hub.",
  "den-haag":
    "Den Haag offers finance internships around impact investing, public-private partnerships, international institutions and advisory firms that serve government, energy and infrastructure clients.",
  eindhoven:
    "Eindhoven's finance internship market is shaped by deep tech, hardware, venture capital and corporate development opportunities connected to the Brainport region.",
  groningen:
    "Groningen offers a growing internship market around startups, regional investment funds, sustainability finance and advisory firms serving the north of the Netherlands.",
  tilburg:
    "Tilburg has a strong student base and a practical finance market across corporate finance, analytics, insurance and regional investment activity.",
  breda:
    "Breda combines regional advisory work, private companies and cross-border activity with Belgium, creating internship opportunities in corporate finance, accounting and investment support.",
  nijmegen:
    "Nijmegen's market is smaller but relevant for students interested in healthcare, impact, sustainability and regional corporate finance assignments.",
  enschede:
    "Enschede connects finance internships to technology, university spinouts, venture building and regional investment networks in Twente.",
  arnhem:
    "Arnhem offers finance internship opportunities linked to energy, infrastructure, insurance and regional business services.",
  "den-bosch":
    "Den Bosch has a regional finance market with corporate finance boutiques, private companies and investment teams active across Brabant.",
  maastricht:
    "Maastricht is a cross-border market where finance internships often connect Dutch, Belgian and German business activity with advisory, investment and corporate roles.",
  leiden:
    "Leiden combines university talent, life sciences, venture activity and advisory firms, creating finance internship opportunities near both Amsterdam and Den Haag.",
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
      ? `There are currently no active finance internships listed in ${name}, but the city remains relevant for students tracking new openings.`
      : `There ${count === 1 ? "is" : "are"} currently ${count} active finance ${
          count === 1 ? "internship" : "internships"
        } in ${name} on Finance Talents.`;
  const marketNote = CITY_MARKET_NOTES[city];

  return (
    <>
      <p>
        {marketNote} Students looking for a finance internship in {name} can use this
        page to compare opportunities across Private Equity, Venture Capital,
        Investment Banking, FinTech and related investment roles.
      </p>
      <p className="mt-5">
        {countText} The listings are filtered to roles in {name}, so you can
        focus on relevant firms without searching through every national
        vacancy. Use the filters for role, type and sector to narrow the page to
        internships that match your study background, availability and preferred
        finance domain.
      </p>
      <p className="mt-5">
        Finance internships in {name} are especially useful for building deal
        exposure, modelling skills, investment judgement and a network inside
        professional finance teams. New roles can appear throughout the year, so
        this city page is a practical starting point when you want to monitor
        openings and apply directly to the companies hiring interns.
      </p>
    </>
  );
}

export async function generateStaticParams() {
  return CITIES.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: rawCity } = await params;
  const city = normalizeCitySlug(rawCity);

  if (!isValidCity(city)) {
    return {
      title: "Internships not found | Finance Talents",
      description:
        "This internship city page does not exist. Browse all finance internships on Finance Talents.",
      robots: { index: false, follow: true },
    };
  }

  const name = cityDisplayName(city);
  const count = await getCityJobCount(city, { stagesOnly: true });
  const countText =
    count === 0
      ? `Discover finance internships in ${name} at Private Equity, Venture Capital, Investment Banking and FinTech companies.`
      : `Browse ${count} finance ${count === 1 ? "internship" : "internships"} in ${name} at Private Equity, Venture Capital, Investment Banking and FinTech companies.`;
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

  return {
    title: `Internships in ${name} | Finance Talents`,
    description: `${countText} Apply directly through Finance Talents.`,
    robots: { index: true, follow: true },
    keywords: baseKeywords,
    alternates: {
      canonical: `/internships/${city}`,
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
  const { city: rawCity } = await params;
  const city = normalizeCitySlug(rawCity);
  if (city !== rawCity) permanentRedirect(`/internships/${city}`);
  if (!isValidCity(city)) notFound();

  const name = cityDisplayName(city);
  const sp = await searchParams;
  const count = await getCityJobCount(city, { stagesOnly: true });
  const selectedSector = sp.sector ?? sp.rechtsgebied;
  const headingText = selectedSector
    ? `${selectedSector} internships in ${name}`
    : `Internships in ${name}`;
  const subtitleText =
    count === 0
      ? `No active internships in ${name} right now, but this page tracks finance internships at Private Equity, Venture Capital, Investment Banking and FinTech companies.`
      : `${count} ${count === 1 ? "internship" : "internships"} in ${name} at Private Equity, Venture Capital, Investment Banking and FinTech companies.`;
  const otherCityLinks = CITIES.filter((otherCity) => otherCity !== city).map(
    (otherCity) => ({
      label: `Internships in ${cityDisplayName(otherCity)}`,
      href: `/internships/${otherCity}`,
    })
  );

  return (
    <JobsListingPage
      params={sp}
      basePath={`/internships/${city}`}
      fixedLocation={name}
      headingText={headingText}
      subtitleText={subtitleText}
      typeValues={STAGE_TYPE_VALUES}
      typeOptions={[{ value: "stage", label: "Internship" }]}
      eyebrowText="Elite finance internships. One platform."
      filterHelperText={`Filter internships in ${name} by role, type and sector. Apply directly to the company when you find a fit.`}
      resultsHeadingText={`Open internships in ${name}.`}
      heroHeadingClassName="max-w-[14ch] text-[clamp(42px,8vw,128px)] leading-[0.88] tracking-[-0.07em]"
      resultLabel={{
        singular: "active internship",
        plural: "active internships",
      }}
      emptyState={{
        filteredTitle: "No internships found.",
        defaultTitle: `Coming soon in ${name}.`,
        filteredText:
          "Try another role, type or sector to uncover more internships.",
        defaultText: `No active internships in ${name} at the moment. View all internships or explore nearby cities while new roles are added.`,
        viewAllText: "View all internships",
      }}
      cardStageMode
      breadcrumbItems={[
        { label: "Home", href: "/" },
        { label: "Internships", href: "/internships" },
        { label: name, href: `/internships/${city}` },
      ]}
      itemListSchemaName={headingText}
      seoIntroContent={getCityIntro(name, city, count)}
      internalLinksSection={{
        heading: "Internships in other cities",
        links: otherCityLinks,
      }}
    />
  );
}
