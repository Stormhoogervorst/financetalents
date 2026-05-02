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
    name: "Legal Talents",
    url: SITE_URL,
    logo: `${SITE_URL}/legal-talents-logo.png`,
    description:
      "Hét carrièreplatform voor juridische vacatures en stages in Nederland.",
    sameAs: ["https://www.linkedin.com/company/legal-talents-recruitment"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "storm@legal-talents.nl",
      contactType: "customer support",
      availableLanguage: ["Dutch", "English"],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
    />
  );
}
