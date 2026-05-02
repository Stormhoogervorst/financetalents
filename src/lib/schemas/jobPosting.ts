import { SITE_URL } from "@/lib/site";

/**
 * JobPosting JSON-LD builder volgens https://schema.org/JobPosting
 * en de Google-richtlijnen voor Rich Results.
 *
 * Gebruik:
 *   const schema = buildJobPostingSchema(job, firm);
 *   <script type="application/ld+json"
 *     dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
 *
 * Valideer na deploy via https://search.google.com/test/rich-results —
 * mikken op 0 errors en max 1-2 warnings (warnings voor optionele velden
 * als baseSalary/identifier zijn acceptabel).
 */

/** Mapping van interne job-types naar schema.org employmentType-waarden. */
const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  fulltime: "FULL_TIME",
  "full-time": "FULL_TIME",
  parttime: "PART_TIME",
  "part-time": "PART_TIME",
  stage: "INTERN",
  internship: "INTERN",
  student: "INTERN",
  "business-course": "CONTRACTOR",
  lawcourse: "CONTRACTOR",
  "summer-course": "CONTRACTOR",
};

const VALID_THROUGH_FALLBACK_DAYS = 60;

/**
 * Grove city → provincie-mapping voor `addressRegion`. Optioneel; levert
 * extra context aan Google maar breekt niets als de stad onbekend is.
 * Matcht case-insensitive op de grootste Nederlandse steden.
 */
const CITY_TO_PROVINCE: Record<string, string> = {
  amsterdam: "Noord-Holland",
  haarlem: "Noord-Holland",
  alkmaar: "Noord-Holland",
  hilversum: "Noord-Holland",
  rotterdam: "Zuid-Holland",
  "den haag": "Zuid-Holland",
  "'s-gravenhage": "Zuid-Holland",
  leiden: "Zuid-Holland",
  delft: "Zuid-Holland",
  dordrecht: "Zuid-Holland",
  gouda: "Zuid-Holland",
  utrecht: "Utrecht",
  amersfoort: "Utrecht",
  eindhoven: "Noord-Brabant",
  tilburg: "Noord-Brabant",
  breda: "Noord-Brabant",
  "den bosch": "Noord-Brabant",
  "'s-hertogenbosch": "Noord-Brabant",
  nijmegen: "Gelderland",
  arnhem: "Gelderland",
  ede: "Gelderland",
  apeldoorn: "Gelderland",
  groningen: "Groningen",
  leeuwarden: "Friesland",
  assen: "Drenthe",
  zwolle: "Overijssel",
  enschede: "Overijssel",
  deventer: "Overijssel",
  almere: "Flevoland",
  lelystad: "Flevoland",
  maastricht: "Limburg",
  heerlen: "Limburg",
  venlo: "Limburg",
  middelburg: "Zeeland",
};

/**
 * Probeert de provincie af te leiden uit een locatie-string. Geeft `null`
 * terug als er geen match is, zodat de caller de property kan weglaten.
 */
export function getProvince(location: string | null | undefined): string | null {
  if (!location) return null;
  const normalized = location
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  for (const [city, province] of Object.entries(CITY_TO_PROVINCE)) {
    if (normalized.includes(city)) return province;
  }
  return null;
}

/**
 * Berekent `validThrough`: gebruikt `expires_at` indien aanwezig, anders
 * `created_at + 60 dagen`. Altijd een echte Date (ISO-serialiseerbaar).
 */
export function computeValidThrough(
  createdAt: string,
  expiresAt: string | null | undefined,
): Date {
  if (expiresAt) return new Date(expiresAt);
  const created = new Date(createdAt).getTime();
  return new Date(created + VALID_THROUGH_FALLBACK_DAYS * 24 * 60 * 60 * 1000);
}

/** Wrap plain text in <p> zodat Google HTML-description accepteert. */
function ensureHtmlDescription(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return "";
  return /^<(p|ul|ol|div|h[1-6])[\s>]/i.test(trimmed) ? trimmed : `<p>${trimmed}</p>`;
}

/**
 * Probeert min/max-bedragen uit een vrije salarisindicatie te halen.
 *   "€ 3.000 - € 4.500 per maand"  → { min: 3000, max: 4500 }
 *   "€3500 bruto"                   → { min: 3500, max: 3500 }
 *   "Marktconform"                  → null (geen baseSalary renderen)
 *
 * Getallen < 500 negeren we (filtert "40 uur" / "2025" / etc.).
 */
function parseSalaryRange(text: string): { min: number; max: number } | null {
  // Normaliseer NL-duizendtalscheiding: "3.000" → "3000" (maar niet "3.5").
  const cleaned = text.replace(/(\d)[.](\d{3})(?!\d)/g, "$1$2");
  const nums = Array.from(cleaned.matchAll(/\d+/g))
    .map((m) => parseInt(m[0], 10))
    .filter((n) => n >= 500 && n <= 1_000_000);
  if (nums.length === 0) return null;
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

/** Telt woorden in een (mogelijk HTML-)string, stripped van tags. */
function countWords(html: string): number {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}

export interface JobForSchema {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  type: string;
  practice_area: string | null;
  created_at: string;
  expires_at?: string | null;
  salary_indication: string | null;
  required_education: string | null;
  hours_per_week: number | null;
}

export interface FirmForSchema {
  name: string;
  logo_url: string | null;
  website_url: string | null;
}

export interface BuildJobPostingOptions {
  /** Override SITE_URL wanneer gewenst (bv. in tests). */
  baseUrl?: string;
}

/**
 * Bouw het JobPosting-schema voor één vacature.
 * Caller blijft verantwoordelijk voor `notFound()` bij verlopen vacatures —
 * Google straft expired postings hard af.
 */
export function buildJobPostingSchema(
  job: JobForSchema,
  firm: FirmForSchema | null,
  options: BuildJobPostingOptions = {},
): Record<string, unknown> {
  const baseUrl = options.baseUrl ?? SITE_URL;
  const validThrough = computeValidThrough(job.created_at, job.expires_at);
  const descriptionHtml = ensureHtmlDescription(job.description);

  // Google vraagt 50+ woorden in de description. Alleen dev-warn; we gaan
  // niet stillzwijgend content bijverzinnen.
  if (process.env.NODE_ENV !== "production") {
    const words = countWords(descriptionHtml);
    if (words > 0 && words < 50) {
      console.warn(
        `[JobPosting] Description heeft ${words} woorden (Google adviseert 50+): "${job.title}" (${job.slug})`,
      );
    }
  }

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: descriptionHtml,
    identifier: {
      "@type": "PropertyValue",
      name: "Legal Talents",
      value: job.id,
    },
    datePosted: new Date(job.created_at).toISOString(),
    validThrough: validThrough.toISOString(),
    employmentType: EMPLOYMENT_TYPE_MAP[job.type] ?? "OTHER",
    directApply: true,
    industry: "Legal Services",
    url: `${baseUrl}/vacature/${job.slug}`,
  };

  if (job.practice_area) {
    jsonLd.occupationalCategory = job.practice_area;
  }

  if (job.required_education) {
    jsonLd.qualifications = job.required_education;
  }

  if (job.hours_per_week) {
    jsonLd.workHours = `${job.hours_per_week} uur per week`;
  }

  if (firm) {
    const org: Record<string, unknown> = {
      "@type": "Organization",
      name: firm.name,
    };
    if (firm.logo_url) org.logo = firm.logo_url;
    if (firm.website_url) org.sameAs = firm.website_url;
    jsonLd.hiringOrganization = org;
  }

  if (job.location) {
    const address: Record<string, unknown> = {
      "@type": "PostalAddress",
      addressLocality: job.location,
      addressCountry: "NL",
    };
    const region = getProvince(job.location);
    if (region) address.addressRegion = region;

    jsonLd.jobLocation = {
      "@type": "Place",
      address,
    };
  }

  if (job.salary_indication) {
    const range = parseSalaryRange(job.salary_indication);
    if (range) {
      jsonLd.baseSalary = {
        "@type": "MonetaryAmount",
        currency: "EUR",
        value: {
          "@type": "QuantitativeValue",
          minValue: range.min,
          maxValue: range.max,
          unitText: "MONTH",
        },
      };
    }
  }

  return jsonLd;
}
