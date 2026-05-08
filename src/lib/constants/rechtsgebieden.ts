/**
 * Central list of finance sectors / categories.
 *
 * Single source of truth for homepage cards, filters, job-submit form,
 * employer profile, and Zod validation in the API. Do NOT copy these values
 * elsewhere — everything imports from this file.
 *
 * Values are stored as plain strings in Supabase
 * (`jobs.practice_area` / `firms.practice_areas`). There is no Postgres enum.
 */

export const RECHTSGEBIEDEN = [
  "Private Equity",
  "Venture Capital",
  "Investment Banking",
  "FinTech",
  "Asset Management",
  "Corporate Finance",
  "Mergers & Acquisitions",
  "Debt Capital Markets",
  "Equity Capital Markets",
  "Restructuring",
  "Financial Consultancy",
  "Real Assets",
  "Infrastructure",
  "Hedge Funds",
  "Family Office",
  "Risk & Compliance",
  "Quantitative Finance",
] as const;

export type Rechtsgebied = (typeof RECHTSGEBIEDEN)[number];

export const RECHTSGEBIED_SLUGS: Record<Rechtsgebied, string> = {
  "Private Equity": "private-equity",
  "Venture Capital": "venture-capital",
  "Investment Banking": "investment-banking",
  FinTech: "fintech",
  "Asset Management": "asset-management",
  "Corporate Finance": "corporate-finance",
  "Mergers & Acquisitions": "mergers-acquisitions",
  "Debt Capital Markets": "debt-capital-markets",
  "Equity Capital Markets": "equity-capital-markets",
  Restructuring: "restructuring",
  "Financial Consultancy": "financial-consultancy",
  "Real Assets": "real-assets",
  Infrastructure: "infrastructure",
  "Hedge Funds": "hedge-funds",
  "Family Office": "family-office",
  "Risk & Compliance": "risk-compliance",
  "Quantitative Finance": "quantitative-finance",
};

export const RECHTSGEBIED_BY_SLUG = Object.fromEntries(
  RECHTSGEBIEDEN.map((area) => [RECHTSGEBIED_SLUGS[area], area])
) as Record<string, Rechtsgebied>;

export function getRechtsgebiedSlug(area: Rechtsgebied | string): string {
  return (
    RECHTSGEBIED_SLUGS[area as Rechtsgebied] ??
    area
      .toLowerCase()
      .replace(/&/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

export function getRechtsgebiedBySlug(slug: string): Rechtsgebied | null {
  return RECHTSGEBIED_BY_SLUG[slug] ?? null;
}

export const RECHTSGEBIED_SEO: Record<
  Rechtsgebied,
  { title: string; description: string }
> = {
  "Private Equity": {
    title: "Private Equity Jobs",
    description:
      "Explore current Private Equity jobs at funds and investment firms. Find analyst, associate and internship roles on Finance Talents.",
  },
  "Venture Capital": {
    title: "Venture Capital Jobs",
    description:
      "Browse Venture Capital jobs at leading funds backing ambitious companies. Discover VC analyst, investment and internship roles.",
  },
  "Investment Banking": {
    title: "Investment Banking Jobs",
    description:
      "Find Investment Banking jobs across M&A, capital markets and advisory teams. Apply directly to finance firms on Finance Talents.",
  },
  FinTech: {
    title: "FinTech Jobs",
    description:
      "Discover FinTech jobs at fast-growing finance companies, platforms and investors. Browse active roles and apply directly.",
  },
  "Asset Management": {
    title: "Asset Management Jobs",
    description:
      "Search Asset Management jobs across portfolio management, research and investment teams at leading finance firms.",
  },
  "Corporate Finance": {
    title: "Corporate Finance Jobs",
    description:
      "Browse Corporate Finance jobs in advisory, valuation, transactions and strategic finance. Find your next role on Finance Talents.",
  },
  "Mergers & Acquisitions": {
    title: "Mergers & Acquisitions Jobs",
    description:
      "Explore Mergers & Acquisitions jobs at banks, boutiques and advisory firms. Find M&A analyst, associate and internship roles.",
  },
  "Debt Capital Markets": {
    title: "Debt Capital Markets Jobs",
    description:
      "Find Debt Capital Markets jobs across origination, structuring and execution teams at finance firms and banks.",
  },
  "Equity Capital Markets": {
    title: "Equity Capital Markets Jobs",
    description:
      "Browse Equity Capital Markets jobs in IPOs, listings, placements and advisory. Apply directly through Finance Talents.",
  },
  Restructuring: {
    title: "Restructuring Jobs",
    description:
      "Discover Restructuring jobs in advisory, turnaround, distressed debt and special situations at leading finance firms.",
  },
  "Financial Consultancy": {
    title: "Financial Consultancy Jobs",
    description:
      "Browse Financial Consultancy jobs at advisory firms, Big Four practices and boutique consultancies serving finance clients. Find consultant, analyst and internship roles on Finance Talents.",
  },
  "Real Assets": {
    title: "Real Assets Jobs",
    description:
      "Search Real Assets jobs across infrastructure, real estate, natural resources and long-term investment platforms.",
  },
  Infrastructure: {
    title: "Infrastructure Jobs",
    description:
      "Explore Infrastructure jobs at funds, banks and advisory firms investing in essential assets and project finance.",
  },
  "Hedge Funds": {
    title: "Hedge Fund Jobs",
    description:
      "Find Hedge Fund jobs in investment analysis, trading, research and operations at specialist finance firms.",
  },
  "Family Office": {
    title: "Family Office Jobs",
    description:
      "Browse Family Office jobs across investing, portfolio management and private wealth teams on Finance Talents.",
  },
  "Risk & Compliance": {
    title: "Risk & Compliance Jobs",
    description:
      "Discover Risk & Compliance jobs at finance firms, funds and FinTech companies. Find roles across control, regulation and governance.",
  },
  "Quantitative Finance": {
    title: "Quantitative Finance Jobs",
    description:
      "Search Quantitative Finance jobs in modelling, trading, research and analytics at funds, banks and finance platforms.",
  },
};

/**
 * For the job-submit form and employer profile: same list + "Other" as fallback.
 */
export const RECHTSGEBIEDEN_MET_OVERIG = [
  ...RECHTSGEBIEDEN,
  "Other",
] as const;

export type RechtsgebiedMetOverig = (typeof RECHTSGEBIEDEN_MET_OVERIG)[number];
