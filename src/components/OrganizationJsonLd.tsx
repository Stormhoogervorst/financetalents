import { SITE_URL } from "@/lib/site";

/**
 * Organization JSON-LD voor schema.org.
 *
 * Alleen renderen op de homepage — niet globaal in layout.tsx — zodat Google
 * dit signaal koppelt aan één canonical URL (de root) voor het Knowledge Panel.
 */
export default function OrganizationJsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org/",
    "@type": "Organization",
    name: "Finance Talents",
    url: SITE_URL,
    logo: `${SITE_URL}/logo FT.png`,
    description:
      "The curated career platform for elite finance jobs in Private Equity, Venture Capital, Investment Banking and FinTech.",
    sameAs: ["https://www.linkedin.com/company/finance-talents"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "joris@finance-talents.nl",
      contactType: "customer support",
      availableLanguage: ["English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}
