import Link from "next/link";
import BreadcrumbSchema, { type BreadcrumbItem } from "./BreadcrumbSchema";

/**
 * Visuele breadcrumb + JSON-LD in één component.
 *
 * Color-neutral: gebruikt Tailwind `text-current` + opacity utilities, zodat de
 * parent de basiskleur bepaalt (bv. `text-white/85` op een donkere hero, of
 * `text-gray-500` op een lichte pagina).
 *
 * Het laatste item wordt gerenderd als `<span aria-current="page">` en is dus
 * niet klikbaar — conventie + signaal voor screen readers dat dit de huidige
 * pagina is. In de JSON-LD schema heeft elk item wél een URL.
 */
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;

  return (
    <>
      <BreadcrumbSchema items={items} />
      <nav
        aria-label="Breadcrumb"
        className="text-[14px] font-medium"
      >
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${item.href}-${i}`} className="inline-flex items-center gap-x-1.5">
                {isLast ? (
                  <span aria-current="page" className="opacity-90">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="opacity-70 hover:opacity-100 transition-opacity duration-200 underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                )}
                {!isLast && (
                  <span aria-hidden className="opacity-50 select-none">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
