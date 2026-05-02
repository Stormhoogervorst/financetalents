import { Metadata } from "next";
import Link from "next/link";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import { CITIES, cityDisplayName } from "@/lib/cities";
import { RECHTSGEBIEDEN } from "@/lib/constants/rechtsgebieden";
import { JOB_FUNCTIONS } from "@/lib/jobFunctions";

export const metadata: Metadata = {
  title: "Index van Juridische Vacatures & Stages",
  description:
    "Compleet overzicht van alle juridische vacatures en stages per functie, rechtsgebied en stad in Nederland. Vind snel de juiste positie bij topwerkgevers in de juridische sector.",
  keywords: [
    "juridische vacatures",
    "juridische stages",
    "advocaat vacatures",
    "jurist vacatures",
    "kandidaat-notaris vacatures",
    "vacatures per stad",
    "rechtsgebied vacatures",
    "Legal Talents",
  ],
  alternates: {
    canonical: "/juridische-vacatures-index",
  },
};

const sectionPadding = {
  paddingLeft: "clamp(24px, 5vw, 80px)",
  paddingRight: "clamp(24px, 5vw, 80px)",
  paddingTop: "clamp(40px, 5vh, 56px)",
  paddingBottom: "clamp(40px, 5vh, 56px)",
} as const;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-bold tracking-[-0.02em] text-[#0A0A0A] mb-2"
      style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
    >
      {children}
    </h2>
  );
}

function SectionSubtext({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-10 max-w-[640px]"
      style={{ fontSize: "clamp(14px, 1vw, 16px)", lineHeight: 1.6, color: "#6B6B6B" }}
    >
      {children}
    </p>
  );
}

export default function JuridischeVacaturesIndexPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <NavbarPublic variant="hero" />

      {/* Hero — mesh-gradient header that fades seamlessly to white */}
      <div className="-mt-[4.25rem]">
        <section
          className="relative isolate overflow-hidden"
          style={{
            background: `linear-gradient(135deg,
              #4B3BD6 0%,
              #5668E8 22%,
              #7A8BF5 42%,
              #A8B6FF 62%,
              #C9D4FF 82%,
              #FFFFFF 100%)`,
          }}
        >
          {/* Layered radial gradients — soft "liquid" purple → blue wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(60% 55% at 50% 40%,
                  rgba(178, 140, 255, 0.65) 0%,
                  rgba(140, 120, 255, 0.30) 35%,
                  rgba(120, 150, 255, 0) 70%),
                radial-gradient(50% 60% at 50% 60%,
                  rgba(255, 255, 255, 0.45) 0%,
                  rgba(255, 255, 255, 0) 60%),
                radial-gradient(55% 70% at 96% 6%,
                  rgba(42, 20, 230, 0.80) 0%,
                  rgba(59, 44, 220, 0.35) 22%,
                  rgba(88, 125, 254, 0) 60%),
                radial-gradient(32% 38% at 2% 0%,
                  rgba(215, 168, 255, 0.85) 0%,
                  rgba(215, 168, 255, 0) 65%),
                radial-gradient(38% 45% at 10% 55%,
                  rgba(255, 255, 255, 0.55) 0%,
                  rgba(255, 255, 255, 0) 65%)
              `,
            }}
          />

          {/* Seamless fade to pure white at the bottom */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:h-56"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 55%, #FFFFFF 100%)",
            }}
          />

          <div
            className="max-w-[1400px] mx-auto relative"
            style={{
              padding:
                "calc(4.25rem + clamp(32px, 4vh, 56px)) clamp(24px, 5vw, 80px) clamp(80px, 10vh, 140px)",
            }}
          >
            {/* Breadcrumb */}
            <Link
              href="/vacatures"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-white/80 hover:text-white transition-colors duration-200"
              style={{ textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)" }}
            >
              ← Alle vacatures
            </Link>

            <h1
              className="mt-8 font-bold tracking-[-0.03em] leading-[1.05]"
              style={{
                fontSize: "clamp(40px, 5vw, 72px)",
                color: "#FFFFFF",
                textShadow: "0 1px 24px rgba(20, 24, 80, 0.25)",
              }}
            >
              Vacature Index
            </h1>
            <p
              className="mt-6 leading-relaxed max-w-[720px]"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "#FFFFFF",
                opacity: 0.95,
                textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)",
              }}
            >
              Legal Talents biedt het meest complete overzicht van juridische
              vacatures in Nederland. Zoek op functie, rechtsgebied of locatie
              en vind direct de vacatures die bij jou passen. Van advocaat in
              Amsterdam tot kandidaat-notaris in Utrecht — alle combinaties
              staan hieronder. Elke link brengt je naar een gefilterd overzicht
              met actuele vacatures bij topkantoren en juridische organisaties.
            </p>
          </div>
        </section>
      </div>

      {/* ── 1. Per Functie ──────────────────────────────────────── */}
      <section style={sectionPadding}>
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading>Vacatures per Functie</SectionHeading>
          <SectionSubtext>
            Bekijk alle juridische vacatures per functietitel. Klik op een
            functie om direct het actuele aanbod te bekijken.
          </SectionSubtext>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3">
            {JOB_FUNCTIONS.map((fn) => (
              <Link
                key={fn}
                href={`/vacatures?functie=${encodeURIComponent(fn)}`}
                title={`Bekijk alle ${fn} vacatures`}
                className="text-[15px] font-medium text-[#0A0A0A] hover:text-[#587DFE] transition-colors duration-200 py-1"
              >
                {fn} vacatures
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Per Rechtsgebied ─────────────────────────────────── */}
      <section className="border-t border-[#EEF0F6]" style={sectionPadding}>
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading>Vacatures per Rechtsgebied</SectionHeading>
          <SectionSubtext>
            Zoek vacatures binnen een specifiek rechtsgebied, ongeacht de
            locatie.
          </SectionSubtext>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-3">
            {RECHTSGEBIEDEN.map((area) => (
              <Link
                key={area}
                href={`/vacatures?rechtsgebied=${encodeURIComponent(area)}`}
                title={`Bekijk alle ${area} vacatures`}
                className="text-[15px] font-medium text-[#0A0A0A] hover:text-[#587DFE] transition-colors duration-200 py-1"
              >
                {area} vacatures
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Functie + Locatie ────────────────────────────────── */}
      <section className="border-t border-[#EEF0F6]" style={sectionPadding}>
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading>Vacatures per Functie &amp; Stad</SectionHeading>
          <SectionSubtext>
            Combineer een functietitel met een stad om gericht te zoeken. Elke
            link toont het actuele aanbod voor die combinatie.
          </SectionSubtext>

          <div className="space-y-10">
            {JOB_FUNCTIONS.map((fn) => (
              <div key={fn}>
                <h3 className="text-[15px] font-semibold tracking-wide uppercase text-[#587DFE] mb-3">
                  {fn}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-2">
                  {CITIES.map((slug) => {
                    const city = cityDisplayName(slug);
                    return (
                      <Link
                        key={slug}
                        href={`/vacatures/${slug}?functie=${encodeURIComponent(fn)}`}
                        title={`Bekijk alle ${fn} vacatures in ${city}`}
                        className="text-[14px] text-[#444] hover:text-[#587DFE] transition-colors duration-200 py-0.5"
                      >
                        {fn} vacatures in {city}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Rechtsgebied + Locatie ───────────────────────────── */}
      <section
        className="border-t border-[#EEF0F6]"
        style={{
          ...sectionPadding,
          paddingBottom: "clamp(60px, 8vh, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <SectionHeading>Vacatures per Rechtsgebied &amp; Stad</SectionHeading>
          <SectionSubtext>
            Zoek vacatures binnen een rechtsgebied in een specifieke stad.
          </SectionSubtext>

          <div className="space-y-10">
            {RECHTSGEBIEDEN.map((area) => (
              <div key={area}>
                <h3 className="text-[15px] font-semibold tracking-wide uppercase text-[#587DFE] mb-3">
                  {area}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-2">
                  {CITIES.map((slug) => {
                    const city = cityDisplayName(slug);
                    return (
                      <Link
                        key={slug}
                        href={`/vacatures/${slug}?rechtsgebied=${encodeURIComponent(area)}`}
                        title={`Bekijk alle ${area} vacatures in ${city}`}
                        className="text-[14px] text-[#444] hover:text-[#587DFE] transition-colors duration-200 py-0.5"
                      >
                        {area} vacatures in {city}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
