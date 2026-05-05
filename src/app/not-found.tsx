import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  description:
    "De pagina die je zoekt bestaat niet of is verplaatst. Ga terug naar de homepage of bezoek de kennisbank.",
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
    description: "Back to the start of Finance Talents.",
  },
  {
    label: "Insights",
    href: "/kennisbank",
    description: "Read articles and guides on finance careers.",
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
            meer actueel. Ga rechtstreeks naar een van de hoofdsecties.
          </p>

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
