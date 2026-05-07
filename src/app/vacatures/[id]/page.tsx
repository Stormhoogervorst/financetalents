import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CITIES, cityDisplayName, isValidCity } from "@/lib/cities";
import { getCityJobCount } from "@/lib/jobs/getCityJobCount";
import {
  getRechtsgebiedBySlug,
  getRechtsgebiedSlug,
  RECHTSGEBIED_SEO,
  RECHTSGEBIEDEN,
} from "@/lib/constants/rechtsgebieden";
import VacaturesListingPage, {
  VacaturesSearchParams,
} from "../VacaturesListingPage";

export const revalidate = 0;

type SearchParams = VacaturesSearchParams;

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
  const { id } = await params;
  const sector = getRechtsgebiedBySlug(id);

  if (sector) {
    const seo = RECHTSGEBIED_SEO[sector];

    return {
      title: seo.title,
      description: seo.description,
      alternates: {
        canonical: `/vacatures/${id}`,
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
        url: `/vacatures/${id}`,
      },
    };
  }

  const city = id;
  const name = cityDisplayName(city);
  const count = await getCityJobCount(city);

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

  if (count === 0) {
    return {
      title: `Finance Jobs ${name} — no current openings`,
      description: `No finance jobs in ${name} at the moment. Check back soon for new finance opportunities in this city.`,
      robots: { index: false, follow: true },
      keywords: baseKeywords,
      alternates: {
        canonical: `/vacatures/${city}`,
      },
    };
  }

  return {
    title: `Finance Jobs ${name} — ${count} open positions`,
    description: `${count} current finance jobs in ${name}. Discover internships and roles at PE funds, investment banks and FinTechs. Apply directly.`,
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
  const { id } = await params;
  const sp = await searchParams;

  const sector = getRechtsgebiedBySlug(id);
  if (sector) {
    const seo = RECHTSGEBIED_SEO[sector];

    return (
      <VacaturesListingPage
        params={sp}
        fixedPracticeArea={sector}
        basePath={`/vacatures/${id}`}
        headingText={`${sector} jobs`}
        subtitleText={seo.description}
        heroHeadingClassName="max-w-[14ch] text-[clamp(42px,8vw,128px)] leading-[0.88] tracking-[-0.07em]"
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Vacatures", href: "/vacatures" },
          { label: sector, href: `/vacatures/${id}` },
        ]}
      />
    );
  }

  const city = id;
  if (!isValidCity(city)) notFound();

  const name = cityDisplayName(city);

  return (
    <VacaturesListingPage
      params={sp}
      basePath={`/vacatures/${city}`}
      fixedLocation={name}
      headingText={`Vacatures in ${name}`}
      subtitleText={`Ontdek actuele finance vacatures bij toonaangevende bedrijven in ${name}.`}
      heroHeadingClassName="max-w-[14ch] text-[clamp(42px,8vw,128px)] leading-[0.88] tracking-[-0.07em]"
      filterHelperText={`Filter vacatures in ${name} op rol, type en sector. Solliciteer direct bij het bedrijf wanneer je een passende rol vindt.`}
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
        { label: "Vacatures", href: "/vacatures" },
        { label: name, href: `/vacatures/${city}` },
      ]}
    />
  );
}
