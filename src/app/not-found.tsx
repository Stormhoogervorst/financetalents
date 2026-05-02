import type { Metadata } from "next";
import Link from "next/link";
import { Search, ArrowUpRight } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  description:
    "De pagina die je zoekt bestaat niet of is verplaatst. Doorzoek vacatures, stages of de kennisbank.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const QUICK_LINKS: Array<{ label: string; href: string; description: string }> = [
  {
    label: "Homepage",
    href: "/",
    description: "Terug naar het beginpunt van Legal Talents.",
  },
  {
    label: "Vacatures",
    href: "/vacatures",
    description: "Bekijk het volledige aanbod aan juridische vacatures.",
  },
  {
    label: "Stages",
    href: "/stages",
    description: "Vind student-stages en advocaat-stagiaire plekken.",
  },
  {
    label: "Kennisbank",
    href: "/kennisbank",
    description: "Lees artikelen en inzichten uit de juridische sector.",
  },
];

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      <main
        className="flex-1"
        style={{ padding: "clamp(80px, 12vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[880px] mx-auto">
          <p
            style={{
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "#587DFE",
              textTransform: "uppercase",
            }}
          >
            Foutcode 404
          </p>

          <h1
            className="mt-4"
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "#0A0A0A",
            }}
          >
            Deze pagina konden we niet vinden
            <span style={{ color: "#587DFE" }}>.</span>
          </h1>

          <p
            className="mt-6 max-w-[620px]"
            style={{
              fontSize: "17px",
              lineHeight: 1.6,
              color: "#5A6094",
            }}
          >
            De pagina is mogelijk verplaatst, verwijderd of de link is niet
            meer actueel. Doorzoek hieronder de vacatures of ga rechtstreeks
            naar een van de hoofdsecties.
          </p>

          {/* Search */}
          <form
            action="/vacatures"
            method="get"
            role="search"
            aria-label="Zoek in vacatures"
            className="mt-10 flex w-full max-w-[560px] items-stretch gap-2 rounded-full border border-[#E2E5F0] bg-white p-1.5 shadow-[0_4px_20px_rgba(15,23,75,0.06)] focus-within:border-[#587DFE] focus-within:shadow-[0_6px_24px_rgba(88,125,254,0.18)] transition-all"
          >
            <label htmlFor="not-found-search" className="sr-only">
              Zoek vacatures, kantoren of rechtsgebied
            </label>
            <div className="flex items-center pl-4 pr-1 text-[#8B91B8]">
              <Search className="h-4 w-4" aria-hidden />
            </div>
            <input
              id="not-found-search"
              type="search"
              name="q"
              placeholder="Zoek op functie, kantoor of rechtsgebied"
              autoComplete="off"
              className="flex-1 bg-transparent border-0 outline-none text-[15px] text-[#0A0A0A] placeholder:text-[#8B91B8]"
            />
            <button
              type="submit"
              className="btn-primary shrink-0"
              style={{ borderRadius: "9999px" }}
            >
              Zoeken
            </button>
          </form>

          {/* Quick links */}
          <div className="mt-14">
            <h2
              style={{
                fontSize: "clamp(20px, 2vw, 24px)",
                fontWeight: 600,
                letterSpacing: "-0.015em",
                color: "#2C337A",
              }}
            >
              Of ga direct naar
            </h2>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-start justify-between gap-4 rounded-[14px] px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(88,125,254,0.10)]"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
                      backgroundColor: "#F5F7FF",
                    }}
                  >
                    <div>
                      <p
                        className="group-hover:text-[#587DFE] transition-colors"
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                          color: "#2C337A",
                        }}
                      >
                        {link.label}
                      </p>
                      <p
                        className="mt-1"
                        style={{
                          fontSize: "13px",
                          lineHeight: 1.5,
                          color: "#5A6094",
                        }}
                      >
                        {link.description}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 mt-1 shrink-0 text-[#8B91B8] group-hover:text-[#587DFE] transition-colors"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
