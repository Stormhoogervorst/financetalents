import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowUpRight } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import HeroSection from "@/components/HeroSection";
import VacatureCarousel from "@/components/VacatureCarousel";
import VacatureListMobile from "@/components/VacatureListMobile";
import OrganizationJsonLd from "@/components/OrganizationJsonLd";
import { createClient } from "@/lib/supabase/server";
import { Firm, Job } from "@/types";
import { RECHTSGEBIEDEN } from "@/lib/constants/rechtsgebieden";

interface BlogPreview {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  image_url: string | null;
  created_at: string;
  firms: { name: string; logo_url: string | null } | null;
}

const blogCategoryLabels: Record<string, string> = {
  carriere: "Carrière",
  juridisch: "Juridisch",
  kantoorleven: "Kantoorleven",
};

/**
 * Rechtsgebieden voor de interne-linking sectie onderaan de homepage.
 * Links naar /vacatures?rechtsgebied=... — bestaande filter matcht via ilike.
 * Zie `@/lib/constants/rechtsgebieden` voor de canonieke lijst.
 */

/**
 * FAQ-content en FAQPage JSON-LD worden uit dezelfde array opgebouwd,
 * zodat zichtbare DOM en structured data gegarandeerd matchen.
 */
const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Hoe vind ik een juridische stage?",
    a: "Op Legal Talents filter je het vacature-aanbod op stagetype, rechtsgebied en stad. Zoek bijvoorbeeld op student-stages in Amsterdam of zomer-stages in het arbeidsrecht. Je sollicitatie stuur je rechtstreeks naar het kantoor. Wil je een overzicht per stad? Bekijk dan de pagina's voor juridische stages in Amsterdam, Rotterdam, Utrecht of Den Haag.",
  },
  {
    q: "Wat verdient een advocaat-stagiaire?",
    a: "Het startsalaris van een advocaat-stagiaire ligt gemiddeld tussen de €3.200 en €4.500 bruto per maand, afhankelijk van het kantoor en de stad. Grote Zuidas-kantoren betalen doorgaans hoger dan middelgrote en kleinere kantoren in de regio. Bij veel vacatures op Legal Talents staat een indicatie van het salaris vermeld.",
  },
  {
    q: "Wat is het verschil tussen een stage en een student-stageplek?",
    a: "Een advocaat-stagiaire is een volwaardige functie: je hebt je master afgerond en doorloopt de driejarige beroepsopleiding tot advocaat. Een student-stageplek is bedoeld voor rechtenstudenten die nog studeren en kennis willen maken met het kantoorleven, vaak voor een paar weken tot enkele maanden. Beide vind je op Legal Talents, onder aparte categorieën.",
  },
  {
    q: "Hoe schrijf ik een goede motivatiebrief voor een advocatenkantoor?",
    a: "Een goede motivatiebrief is kort, concreet en persoonlijk. Leg uit waarom je juist voor dit kantoor kiest — verwijs naar een specifiek rechtsgebied, een recente zaak of iets dat jou aanspreekt in hun cultuur. Vermijd standaardzinnen en laat je unieke motivatie zien. Voeg ook een cijferlijst toe en eventueel je scriptieonderwerp, want beide worden bij juridische sollicitaties doorgaans gewaardeerd.",
  },
  {
    q: "Wat doet Legal Talents precies?",
    a: "Legal Talents is het carrièreplatform voor de Nederlandse juridische sector. We brengen werkgevers en talent samen: advocatenkantoren, notariskantoren en juridische afdelingen plaatsen hun vacatures en stages, en rechtenstudenten en juristen solliciteren rechtstreeks. Je gebruikt het platform gratis, je hoeft geen account aan te maken om te zoeken, en je betaalt nooit voor een sollicitatie.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org/",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};


export default async function HomePage() {
  const supabase = await createClient();

  const { data: allFirms } = await supabase
    .from("firms")
    .select("id, name, slug, location, practice_areas, logo_url, team_size, is_published")
    .eq("is_published", true);

  const firms = (allFirms ?? []) as Firm[];
  const featuredFirms = firms
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  const { data: topJobs } = await supabase
    .from("jobs")
    .select("*, firms ( name, logo_url, slug )")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  const allJobs = (topJobs ?? []).map((j) => ({
    ...j,
    firms: Array.isArray(j.firms) ? (j.firms[0] ?? null) : (j.firms ?? null),
  })) as Job[];

  const { data: blogData } = await supabase
    .from("blogs")
    .select(`
      id, title, slug, category, content, image_url, created_at,
      firms ( name, logo_url )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);

  const latestBlogs = ((blogData ?? []) as unknown as BlogPreview[]).map((b) => ({
    ...b,
    firms: Array.isArray(b.firms) ? b.firms[0] ?? null : b.firms,
  }));

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <OrganizationJsonLd />
      <NavbarPublic variant="hero" />

      {/* ── Hero ──────────────────────────────────────────────── */}
      {/* Negative margin pulls the hero gradient up behind the liquid-glass navbar */}
      <div className="-mt-[4.25rem]">
        <HeroSection />
      </div>

      {/* ── Top vacatures carrousel ───────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Eén H2 voor mobile én desktop. Knop alleen op desktop (mobiel staat ie onder de lijst). */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between md:gap-6 mb-10 md:mb-16">
            <h2
              className="text-left"
              style={{
                fontSize: "clamp(30px, 6vw, 56px)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              De nieuwste juridische vacatures
            </h2>
            <Link href="/vacatures" className="btn-primary shrink-0 mb-1 hidden md:inline-flex">
              Alle vacatures
            </Link>
          </div>

          {allJobs.length > 0 ? (
            <>
              {/* Mobile: compact vertical list (max 5) */}
              <div className="md:hidden">
                <VacatureListMobile jobs={allJobs} limit={5} />
                <Link
                  href="/vacatures"
                  className="btn-primary mt-6 w-full justify-center inline-flex"
                >
                  Alle vacatures
                </Link>
              </div>

              {/* Desktop / tablet: existing carousel */}
              <div className="hidden md:block">
                <VacatureCarousel jobs={allJobs} />
              </div>
            </>
          ) : (
            <p style={{ fontSize: "15px", color: "#8B91B8" }}>
              Er zijn momenteel geen vacatures beschikbaar.
            </p>
          )}
        </div>
      </section>

      {/* ── Werkgevers grid ───────────────────────────────────── */}
      <section
        className="bg-white"
        style={{
          paddingTop: "clamp(40px, 5vh, 80px)",
          paddingBottom: "clamp(80px, 10vh, 160px)",
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">

          {/* Eén H2 voor mobile én desktop. Knop alleen op desktop (mobiel staat ie onder de lijst). */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between md:gap-6 mb-8 md:mb-16">
            <h2
              className="text-left"
              style={{
                fontSize: "clamp(30px, 6vw, 56px)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              Uitgelichte juridische werkgevers
            </h2>
            <Link href="/werkgevers" className="btn-primary shrink-0 mb-1 hidden md:inline-flex">
              Alle werkgevers
            </Link>
          </div>

          {/* ── Mobile: vertical list with roomier cards ── */}
          <div className="md:hidden">
            <ul className="flex flex-col gap-3">
              {featuredFirms.map((firm) => (
                <li key={firm.id}>
                  <Link
                    href={`/werkgevers/${firm.slug}`}
                    className="flex items-center gap-4 rounded-[16px] px-4 py-5 transition-all duration-200 active:scale-[0.99]"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
                      backgroundColor: "#F5F7FF",
                    }}
                  >
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-[12px] bg-white border border-[#E2E5F0] flex items-center justify-center overflow-hidden p-2 shrink-0">
                      {firm.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firm.logo_url}
                          alt={`${firm.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#2C337A" }}>
                          {firm.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold leading-snug line-clamp-2"
                        style={{
                          fontSize: "16px",
                          letterSpacing: "-0.01em",
                          color: "#2C337A",
                        }}
                      >
                        {firm.name}
                      </h3>

                      {firm.location && (
                        <div
                          className="flex items-center gap-1 mt-1.5"
                          style={{ fontSize: "13px", color: "#8B91B8" }}
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {firm.location}
                            {firm.team_size && (
                              <><span className="mx-1">·</span>{firm.team_size} mw.</>
                            )}
                          </span>
                        </div>
                      )}

                      {firm.practice_areas && firm.practice_areas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {firm.practice_areas.slice(0, 2).map((area) => (
                            <span
                              key={area}
                              className="bg-[#2C337A] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full leading-none"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/werkgevers"
              className="btn-primary mt-6 w-full justify-center inline-flex"
            >
              Alle werkgevers
            </Link>
          </div>

          {/* ── Desktop: existing grid ── */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredFirms.map((firm) => (
              <Link
                key={firm.id}
                href={`/werkgevers/${firm.slug}`}
                className="group rounded-[16px] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(88,125,254,0.12)]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
                  backgroundColor: "#F5F7FF",
                }}
              >
                <div className="w-14 h-14 rounded-[10px] bg-white border border-[#E2E5F0] flex items-center justify-center mb-5 overflow-hidden p-2">
                  {firm.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={firm.logo_url} alt={`${firm.name} logo`} className="w-full h-full object-contain" />
                  ) : (
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#2C337A" }}>
                      {firm.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <h3
                  className="group-hover:text-[#587DFE] transition-colors duration-200"
                  style={{
                    fontSize: "clamp(17px, 1.4vw, 20px)",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                    color: "#2C337A",
                  }}
                >
                  {firm.name}
                </h3>
                {firm.location && (
                  <p
                    className="flex items-center gap-1 mt-2 w-full overflow-hidden"
                    style={{ fontSize: "12px", color: "#8B91B8", letterSpacing: "-0.01em", lineHeight: 1.3 }}
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="min-w-0 truncate">
                      {firm.location}
                      {firm.team_size && (
                        <><span className="mx-1">·</span>{firm.team_size} medewerkers</>
                      )}
                    </span>
                  </p>
                )}
                {firm.practice_areas && firm.practice_areas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {firm.practice_areas.slice(0, 2).map((area) => (
                      <span
                        key={area}
                        className="bg-[#2C337A] text-white text-[12px] font-semibold px-3 py-1 rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── Voor werkgevers ───────────────────────────────────── */}
      <section
        className="relative isolate overflow-hidden"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        {/* Pure CSS mesh gradient — overlapping radial layers in soft blue/purple tones */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            backgroundColor: "#EEF1FF",
            backgroundImage: `
              radial-gradient(55% 60% at 8% 18%,
                rgba(88, 125, 254, 0.85) 0%,
                rgba(88, 125, 254, 0.35) 35%,
                rgba(88, 125, 254, 0) 70%),
              radial-gradient(50% 55% at 92% 28%,
                rgba(178, 140, 255, 0.90) 0%,
                rgba(178, 140, 255, 0.35) 40%,
                rgba(178, 140, 255, 0) 72%),
              radial-gradient(65% 60% at 50% 55%,
                rgba(120, 150, 255, 0.75) 0%,
                rgba(120, 150, 255, 0.25) 45%,
                rgba(120, 150, 255, 0) 72%),
              radial-gradient(45% 55% at 14% 88%,
                rgba(215, 168, 255, 0.85) 0%,
                rgba(215, 168, 255, 0.30) 40%,
                rgba(215, 168, 255, 0) 70%),
              radial-gradient(55% 55% at 90% 92%,
                rgba(75, 59, 214, 0.70) 0%,
                rgba(75, 59, 214, 0.25) 40%,
                rgba(75, 59, 214, 0) 72%)
            `,
            WebkitMaskImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,1) 82%, rgba(0,0,0,0) 100%)",
          }}
        />
        <div className="max-w-[1400px] mx-auto relative">
          <div
            className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-20"
          >
            {/* Left column */}
            <div className="flex flex-col">
              <h2
                style={{
                  fontSize: "clamp(36px, 4vw, 52px)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                  color: "#0A0A0A",
                }}
              >
                Bereik juridisch talent gemakkelijk online
                <span style={{ color: "#587DFE" }}>.</span>
              </h2>

              <p
                style={{
                  fontSize: "16px",
                  lineHeight: 1.65,
                  color: "#5A6094",
                  maxWidth: "480px",
                  marginTop: "28px",
                }}
              >
                Maak eenvoudig een werkgeversprofiel aan en plaats je vacatures
                online. Sollicitaties komen direct binnen via de mail en in het
                dashboard. Zo houd je makkelijk overzicht.
              </p>

              <div className="flex flex-col gap-5 mt-10">
                {[
                  { label: "Gratis profiel", desc: "Maak direct een werkgeversprofiel aan." },
                  { label: "Onbeperkt plaatsen", desc: "Publiceer zoveel vacatures als u wilt." },
                  { label: "Direct ontvangen", desc: "Sollicitaties recht in uw inbox." },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3.5">
                    <div className="w-7 h-7 rounded-full bg-[#587DFE] flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p style={{ fontSize: "15px", lineHeight: 1.5, color: "#5A6094" }}>
                      <span style={{ fontWeight: 600, color: "#2C337A" }}>{item.label}</span>
                      {" – "}
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/voor-werkgevers" className="btn-secondary sm:w-auto w-full">
                  Meer info
                </Link>
                <Link href="/register" className="btn-primary sm:w-auto w-full">
                  Upload vacature
                </Link>
              </div>
            </div>

            {/* Right column — image with floating pills (hidden on mobile) */}
            <div className="hidden md:block relative lg:overflow-visible overflow-hidden h-full">
              <div className="relative rounded-[16px] overflow-hidden h-full min-h-[400px]">
                <Image
                  src="/foto 4.jpg"
                  alt="Juridisch team in vergadering"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Floating pills */}
              <div
                className="absolute hidden sm:block rounded-full"
                style={{
                  top: "20%",
                  right: "-20px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  color: "#FFFFFF",
                  background: "#587DFE",
                  transform: "rotate(3deg)",
                  whiteSpace: "nowrap",
                }}
              >
                JURIDISCH TALENT
              </div>
              <div
                className="absolute hidden sm:block rounded-full"
                style={{
                  top: "38%",
                  right: "-30px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  color: "#FFFFFF",
                  background: "#3B4CA7",
                  transform: "rotate(-2deg)",
                  whiteSpace: "nowrap",
                }}
              >
                YOUNG PROFESSIONALS
              </div>
              <div
                className="absolute hidden sm:block rounded-full"
                style={{
                  top: "56%",
                  right: "-15px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  color: "#FFFFFF",
                  background: "#8CA6FE",
                  transform: "rotate(4deg)",
                  whiteSpace: "nowrap",
                }}
              >
                RECHTENSTUDENTEN
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Waarom Legal Talents ──────────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <h2
            style={{
              fontSize: "clamp(30px, 4vw, 52px)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "#0A0A0A",
            }}
          >
            Waarom Legal Talents
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mt-12 md:mt-16">
            {[
              {
                title: "Het meest complete aanbod",
                body: "Op Legal Talents vind je vacatures en stages van de grootste advocatenkantoren tot kleinere nichekantoren. Je ziet alles op één plek, zonder dat je tien verschillende carrièresites hoeft af te struinen.",
              },
              {
                title: "Gemaakt voor juridisch Nederland",
                body: "Geen generieke banenbank. Alle vacatures zijn gericht op juridische functies — van student-stagiaire tot senior advocaat. Je filtert direct op rechtsgebied, type functie en stad, zodat je snel vindt wat bij jou past.",
              },
              {
                title: "Direct contact met de werkgever",
                body: "Je solliciteert rechtstreeks bij het kantoor. Geen tussenpersonen, geen recruiters die je CV doorverkopen. Dat scheelt jou tijd en betekent dat werkgevers hun volledige aandacht aan jouw sollicitatie geven.",
              },
            ].map((usp) => (
              <div key={usp.title}>
                <h3
                  style={{
                    fontSize: "clamp(18px, 1.5vw, 22px)",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    letterSpacing: "-0.015em",
                    color: "#2C337A",
                  }}
                >
                  {usp.title}
                </h3>
                <p
                  className="mt-3"
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.65,
                    color: "#5A6094",
                  }}
                >
                  {usp.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ─────────────────────────────────────── */}
      <section
        style={{
          padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)",
          backgroundColor: "#FAFBFF",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-[720px]">
            <h2
              style={{
                fontSize: "clamp(30px, 4vw, 52px)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              Hoe het werkt
            </h2>
            <p
              className="mt-5"
              style={{
                fontSize: "16px",
                lineHeight: 1.65,
                color: "#5A6094",
              }}
            >
              Van rechtenstudie naar eerste juridische ervaring in drie stappen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mt-12 md:mt-16">
            {[
              {
                n: "01",
                title: "Zoek",
                body: "Filter op stad, rechtsgebied en type stage. Of blader door het volledige aanbod en laat je inspireren door kantoren die je nog niet kent.",
              },
              {
                n: "02",
                title: "Solliciteer",
                body: "Klik op een vacature en stuur je motivatiebrief en CV direct naar het kantoor. Geen account, geen tussenstappen.",
              },
              {
                n: "03",
                title: "Start",
                body: "De werkgever neemt contact met je op. Is het een match? Dan begin je aan je eerste juridische ervaring.",
              },
            ].map((step) => (
              <div key={step.n}>
                <span
                  style={{
                    fontSize: "clamp(40px, 4.5vw, 56px)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "#587DFE",
                    lineHeight: 1,
                  }}
                >
                  {step.n}
                </span>
                <h3
                  className="mt-5"
                  style={{
                    fontSize: "clamp(18px, 1.5vw, 22px)",
                    fontWeight: 600,
                    lineHeight: 1.3,
                    letterSpacing: "-0.015em",
                    color: "#2C337A",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-3"
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.65,
                    color: "#5A6094",
                  }}
                >
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rechtsgebieden ────────────────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="max-w-[720px]">
            <h2
              style={{
                fontSize: "clamp(30px, 4vw, 52px)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              Vind vacatures per rechtsgebied
            </h2>
            <p
              className="mt-5"
              style={{
                fontSize: "16px",
                lineHeight: 1.65,
                color: "#5A6094",
              }}
            >
              Specialiseer je in het gebied dat bij je past — van arbeidsrecht
              tot Europees recht.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-12 md:mt-16">
            {RECHTSGEBIEDEN.map((area) => (
              <Link
                key={area}
                href={{ pathname: "/vacatures", query: { rechtsgebied: area } }}
                className="group flex items-center justify-between rounded-[14px] px-5 py-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(88,125,254,0.10)]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
                  backgroundColor: "#F5F7FF",
                }}
              >
                <span
                  className="group-hover:text-[#587DFE] transition-colors duration-200"
                  style={{
                    fontSize: "clamp(14px, 1.1vw, 16px)",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "#2C337A",
                    lineHeight: 1.3,
                  }}
                >
                  {area}
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-[#8B91B8] group-hover:text-[#587DFE] transition-colors duration-200"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Veelgestelde vragen ──────────────────────────────── */}
      <section
        style={{
          padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)",
          backgroundColor: "#FAFBFF",
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <div className="max-w-[880px] mx-auto">
          <h2
            style={{
              fontSize: "clamp(30px, 4vw, 52px)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
              color: "#0A0A0A",
            }}
          >
            Veelgestelde vragen
          </h2>

          <div className="mt-10 md:mt-14 flex flex-col gap-3">
            {FAQS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-[14px] bg-white border border-[#E2E5F0] transition-colors duration-200 hover:border-[#C7CFE8] open:border-[#C7CFE8]"
              >
                <summary
                  className="flex items-start justify-between gap-4 cursor-pointer list-none px-5 md:px-6 py-5"
                  style={{
                    fontSize: "clamp(16px, 1.25vw, 18px)",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "#2C337A",
                    lineHeight: 1.4,
                  }}
                >
                  <span>{q}</span>
                  <span
                    aria-hidden
                    className="shrink-0 mt-0.5 text-[#587DFE] text-[20px] font-normal leading-none transition-transform duration-200 group-open:rotate-45 select-none"
                  >
                    +
                  </span>
                </summary>
                <div
                  className="px-5 md:px-6 pb-5"
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.65,
                    color: "#5A6094",
                  }}
                >
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kennisbank ────────────────────────────────────────── */}
      {latestBlogs.length > 0 && (
        <section
          style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-row items-end justify-between gap-6 mb-12 sm:mb-16">
              <h2
                className="leading-none m-0 p-0"
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: "-0.025em",
                  color: "#0A0A0A",
                  margin: 0,
                  padding: 0,
                }}
              >
                Artikelen en inzichten
              </h2>
              <Link
                href="/kennisbank"
                className="btn-primary shrink-0 -translate-y-[8px]"
              >
                Alle artikelen
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestBlogs.slice(0, 3).map((blog) => (
                <Link
                  key={blog.id}
                  href={`/kennisbank/${blog.slug}`}
                  className="group block"
                >
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                    {blog.image_url ? (
                      <Image
                        src={blog.image_url}
                        alt={blog.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#EEF1FF]" />
                    )}
                  </div>
                  <div className="mt-5">
                    <span
                      className="inline-block rounded-full bg-[#E9EEFF]"
                      style={{
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                        color: "#587DFE",
                      }}
                    >
                      {blogCategoryLabels[blog.category] ?? blog.category}
                    </span>
                    <h3
                      className="mt-3 line-clamp-2 group-hover:text-[#587DFE] transition-colors duration-200"
                      style={{
                        fontSize: "clamp(16px, 1.4vw, 20px)",
                        fontWeight: 600,
                        lineHeight: 1.25,
                        letterSpacing: "-0.015em",
                        color: "#2C337A",
                      }}
                    >
                      {blog.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />

      <Footer />
    </div>
  );
}
