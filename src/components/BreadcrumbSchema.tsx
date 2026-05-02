import { SITE_URL } from "@/lib/site";

export type BreadcrumbItem = {
  label: string;
  /** Relatief pad startend met `/` — wordt geabsoluteerd in de schema. */
  href: string;
};

/**
 * BreadcrumbList JSON-LD voor schema.org.
 *
 * Gebruik deze component direct wanneer je alléén de structured data wilt
 * renderen; voor 99% van de use cases gebruik je de wrapper <Breadcrumbs />
 * die zowel de schema als de zichtbare breadcrumb rendert — daarmee blijven
 * beide gegarandeerd in sync.
 */
export default function BreadcrumbSchema({
  items,
}: {
  items: BreadcrumbItem[];
}) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
