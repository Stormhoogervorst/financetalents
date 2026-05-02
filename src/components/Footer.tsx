import Link from "next/link";
import { CITIES, cityDisplayName } from "@/lib/cities";

export default function Footer() {
  return (
    <footer
      className="mt-auto bg-[#1A1D2B]"
      style={{
        paddingLeft: "clamp(24px, 5vw, 80px)",
        paddingRight: "clamp(24px, 5vw, 80px)",
      }}
    >
      <div className="max-w-[1400px] mx-auto pt-20 pb-8">
        <div className="border-t border-[#2E3247] pt-14">
          {/* Top: Email + columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.02em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "12px" }}>
                E-mail
              </p>
              <a
                href="mailto:storm@legal-talents.nl"
                className="group inline-flex items-center gap-2 transition-colors duration-200 hover:text-[#587DFE]"
                style={{ fontSize: "clamp(18px, 2vw, 24px)", fontWeight: 600, color: "#FFFFFF" }}
              >
                storm@legal-talents.nl
              </a>
              <p className="mt-6" style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
                © {new Date().getFullYear()} Legal Talents VOF
              </p>
              <Link
                href="/privacy"
                className="mt-1 inline-block transition-colors duration-200 hover:text-white"
                style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.6)" }}
              >
                Privacybeleid
              </Link>
            </div>

            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.02em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "12px" }}>
                Platform
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: "Vacatures", href: "/vacatures" },
                  { label: "Stages", href: "/stages" },
                  { label: "Werkgevers", href: "/werkgevers" },
                  { label: "Kennisbank", href: "/kennisbank" },
                  { label: "Recruitment", href: "/recruitment" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-200 hover:text-white"
                      style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.02em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "12px" }}>
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
                      className="transition-colors duration-200 hover:text-white"
                      style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.02em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: "12px" }}>
                Juridisch
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: "Privacybeleid", href: "/privacy" },
                  { label: "Algemene voorwaarden", href: "/voorwaarden" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors duration-200 hover:text-white"
                      style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Vacatures per stad */}
          <div className="mt-14 pt-10 border-t border-[#2E3247]">
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
              Juridische Vacatures
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
              {CITIES.map((slug) => (
                <Link
                  key={slug}
                  href={`/vacatures/${slug}`}
                  title={`Juridische Vacatures ${cityDisplayName(slug)}`}
                  className="text-sm text-slate-400 hover:text-[#668dff] transition-colors duration-200"
                >
                  {cityDisplayName(slug)}
                </Link>
              ))}
            </div>
          </div>

          {/* Stages per stad */}
          <div className="mt-10 pt-10 border-t border-[#2E3247]">
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
              Juridische Stages
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
              {CITIES.map((slug) => (
                <Link
                  key={slug}
                  href={`/stages/${slug}`}
                  title={`Juridische Stages ${cityDisplayName(slug)}`}
                  className="text-sm text-slate-400 hover:text-[#668dff] transition-colors duration-200"
                >
                  {cityDisplayName(slug)}
                </Link>
              ))}
            </div>
          </div>

          {/* Index link */}
          <div className="mt-10 pt-8 border-t border-[#2E3247] flex items-center justify-center">
            <Link
              href="/juridische-vacatures-index"
              title="Compleet overzicht van alle juridische vacatures per functie, rechtsgebied en stad"
              className="text-sm text-slate-400 hover:text-[#668dff] transition-colors duration-200"
            >
              Vacature Index
            </Link>
          </div>

          {/* Large brand text */}
          <div className="mt-14 pt-10 border-t border-[#2E3247]">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#587DFE] shrink-0" />
              <p
                className="leading-tight"
                style={{
                  fontSize: "clamp(48px, 8vw, 120px)",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "#FFFFFF",
                }}
              >
                Legal Talents
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
