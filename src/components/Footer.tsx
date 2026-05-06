import Link from "next/link";
import Image from "next/image";
import { CITIES, cityDisplayName } from "@/lib/cities";

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#0A0A0A] px-6 sm:px-10 lg:px-20">
      <div className="max-w-[1400px] mx-auto pt-20 pb-8">
        <div className="border-t border-white/15 pt-14">
          {/* Top: Email + columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <div>
              <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.02em] text-white/45">
                E-mail
              </p>
              <a
                href="mailto:storm@finance-talents.com"
                className="group inline-flex items-center gap-2 text-[clamp(18px,2vw,24px)] font-semibold text-white transition-colors duration-200 hover:text-[#E85A00]"
              >
                storm@finance-talents.com
              </a>
              <p className="mt-6 text-[13px] text-white/45">
                © {new Date().getFullYear()} Finance Talents
              </p>
              <Link
                href="/privacy"
                className="mt-1 inline-block text-[13px] font-medium text-white/60 transition-colors duration-200 hover:text-white"
              >
                Privacybeleid
              </Link>
            </div>

            <div>
              <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.02em] text-white/45">
                Platform
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: "Jobs", href: "/vacatures" },
                  { label: "Internships", href: "/internships" },
                  { label: "Werkgevers", href: "/werkgevers" },
                  { label: "Kennisbank", href: "/kennisbank" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.02em] text-white/45">
                Voor werkgevers
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: "Werkgever aanmelden", href: "/register" },
                  { label: "Voor werkgevers", href: "/voor-werkgevers" },
                  { label: "Inloggen", href: "/login" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-3 text-[13px] font-medium uppercase tracking-[0.02em] text-white/45">
                Legal
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacybeleid", href: "/privacy" },
                  { label: "Algemene voorwaarden", href: "/voorwaarden" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Vacatures per stad */}
          <div className="mt-14 pt-10 border-t border-white/15">
            <p className="mb-4 text-xs font-medium tracking-[-0.01em] text-white/55">
              Finance Jobs
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
              {CITIES.map((slug) => (
                <Link
                  key={slug}
                  href={`/vacatures/${slug}`}
                  title={`Finance Jobs ${cityDisplayName(slug)}`}
                  className="text-sm text-white/45 transition-colors duration-200 hover:text-[#E85A00]"
                >
                  {cityDisplayName(slug)}
                </Link>
              ))}
            </div>
          </div>

          {/* Stages per stad */}
          <div className="mt-10 pt-10 border-t border-white/15">
            <p className="mb-4 text-xs font-medium tracking-[-0.01em] text-white/55">
              Finance Internships
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
              {CITIES.map((slug) => (
                <Link
                  key={slug}
                  href={`/stages/${slug}`}
                  title={`Finance Internships ${cityDisplayName(slug)}`}
                  className="text-sm text-white/45 transition-colors duration-200 hover:text-[#E85A00]"
                >
                  {cityDisplayName(slug)}
                </Link>
              ))}
            </div>
          </div>

          {/* Large brand text */}
          <div className="mt-14 pt-10 border-t border-white/15">
            <div className="flex items-center gap-6">
              <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
                <Image
                  src="/icon FT.png"
                  alt=""
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
              <Image
                src="/logo FT.png"
                alt="Finance Talents"
                width={455}
                height={95}
                className="h-auto w-[min(78vw,720px)] invert"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
