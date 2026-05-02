import Link from "next/link";
import { Sparkles, Infinity as InfinityIcon, Inbox, Target } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";

const STEPS = [
  {
    num: "1",
    title: "Account aanmaken",
    desc: "Binnen twee minuten gepiept. Geen creditcard of KvK-nummer vereist — maak direct een gratis account aan.",
  },
  {
    num: "2",
    title: "Vacature plaatsen",
    desc: "Vul het eenvoudige formulier in en uw vacature is direct zichtbaar voor duizenden juridische professionals.",
  },
  {
    num: "3",
    title: "Dashboard beheren",
    desc: "Beheer vacatures, sollicitaties en je werkgeversprofiel vanuit één dashboard.",
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    label: "Gratis profiel",
    desc: "Maak direct een werkgeversprofiel aan — zonder kosten, zonder verplichtingen.",
  },
  {
    icon: InfinityIcon,
    label: "Onbeperkt plaatsen",
    desc: "Publiceer zoveel vacatures en stages als u wilt, altijd gratis.",
  },
  {
    icon: Inbox,
    label: "Direct ontvangen",
    desc: "Sollicitaties recht in uw inbox. Bekijk kandidaten overzichtelijk in uw dashboard.",
  },
  {
    icon: Target,
    label: "Juridische niche",
    desc: "Bereik 100% juridische professionals — studenten én young professionals.",
  },
];

export const metadata = {
  title: "Voor Werkgevers",
  description:
    "Plaats gratis vacatures en bereik juridisch talent. Het nicheplatform voor advocatenkantoren en juridische werkgevers.",
  alternates: {
    canonical: "/voor-werkgevers",
  },
};

export default function VoorWerkgeversPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white overflow-x-hidden">
      <NavbarPublic variant="hero" />

      {/* ── Hero ──────────────────────────────────────────────── */}
      {/* Negative margin pulls the hero gradient up behind the liquid-glass navbar */}
      <div className="-mt-[4.25rem]">
        <section
          className="relative isolate overflow-hidden w-full"
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
          {/* Layered radial gradients — soft "liquid" purple → blue → white wash */}
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
            className="pointer-events-none absolute inset-x-0 bottom-0 h-48 md:h-64"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 55%, #FFFFFF 100%)",
            }}
          />

          <div
            className="max-w-[1400px] mx-auto relative w-full"
            style={{
              padding:
                "calc(4.25rem + clamp(60px, 8vh, 120px)) clamp(24px, 5vw, 80px) clamp(80px, 12vh, 160px)",
            }}
          >
            <span
              className="inline-flex items-center gap-2 rounded-full backdrop-blur-[6px]"
              style={{
                padding: "7px 16px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: "#FFFFFF",
                background: "rgba(255, 255, 255, 0.18)",
                border: "1px solid rgba(255, 255, 255, 0.28)",
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
              VOOR WERKGEVERS
            </span>

            <h1
              className="text-left"
              style={{
                fontSize: "clamp(44px, 5.2vw, 72px)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                marginTop: "24px",
                maxWidth: "960px",
                textShadow: "0 1px 24px rgba(20, 24, 80, 0.25)",
              }}
            >
              Vind juridisch talent,
              <br className="hidden sm:block" />
              zonder opstartkosten
            </h1>

            <p
              className="text-left"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "#FFFFFF",
                opacity: 0.95,
                maxWidth: "560px",
                marginTop: "24px",
                textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)",
              }}
            >
              Het nicheplatform voor advocatenkantoren. Plaats eenvoudig uw
              vacatures, beheer uw dashboard en bereik uitsluitend juridische
              professionals.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/register" className="btn-primary">
                Gratis account aanmaken
              </Link>
              <Link
                href="#hoe-het-werkt"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium transition-all duration-200 hover:bg-white/15 hover:scale-[1.03]"
                style={{
                  fontSize: "14px",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.55)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                Hoe het werkt
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── Voordelen ──────────────────────────────────────────── */}
      <section
        className="w-full"
        style={{ padding: "clamp(60px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto w-full">
          {/* Heading block */}
          <div className="max-w-3xl">
            <h2
              className="text-left"
              style={{
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              Bereik juridisch talent gemakkelijk online
              <span style={{ color: "#587DFE" }}>.</span>
            </h2>
            <p
              className="text-left"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "#5A6094",
                maxWidth: "600px",
                marginTop: "24px",
              }}
            >
              Maak eenvoudig een werkgeversprofiel aan en plaats je vacatures
              online. Sollicitaties komen direct binnen via de mail en in het
              dashboard. Zo houd je makkelijk overzicht.
            </p>
          </div>

          {/* Feature cards: vertical list on mobile → 2-col on md → 4-col on lg */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="w-full rounded-2xl bg-white/80 shadow-sm ring-1 ring-[#E2E5F0] p-6 sm:p-8 backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(88,125,254,0.12)]"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(88,125,254,0.15) 0%, rgba(138,122,254,0.10) 100%)",
                      color: "#587DFE",
                    }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "#2C337A",
                    }}
                  >
                    {feature.label}
                  </h3>
                  <p
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.6,
                      color: "#5A6094",
                      marginTop: "8px",
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12">
            <Link href="/register" className="btn-primary">
              Gratis account aanmaken
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quote sectie ──────────────────────────────────────── */}
      <section
        className="relative isolate overflow-hidden w-full"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        {/* Pure CSS mesh gradient — overlapping radial layers in soft blue/purple tones, faded into white */}
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
        <div className="max-w-[1400px] mx-auto w-full relative">
          <div className="max-w-4xl">
            <span
              style={{
                fontSize: "clamp(72px, 8vw, 120px)",
                fontWeight: 700,
                lineHeight: 0.85,
                color: "#0A0A0A",
                display: "block",
              }}
            >
              &ldquo;
            </span>
            <blockquote
              className="mt-2"
              style={{
                fontSize: "clamp(24px, 3vw, 40px)",
                fontWeight: 600,
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
                color: "#0A0A0A",
              }}
            >
              Met Legal Talents bereiken wij precies de juridische
              professionals die we zoeken. Het platform is intuïtief,
              effectief en zonder drempels.
            </blockquote>
            <p
              className="mt-8"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "#0A0A0A",
                maxWidth: "560px",
              }}
            >
              Maak vandaag nog een gratis account aan en bereik duizenden
              juridische professionals. Geen creditcard vereist, direct actief.
            </p>
          </div>
        </div>
      </section>

      {/* ── Hoe het werkt ──────────────────────────────────────── */}
      <section
        id="hoe-het-werkt"
        className="scroll-mt-20 w-full"
        style={{
          padding: "clamp(60px, 10vh, 160px) clamp(24px, 5vw, 80px)",
          background: "#FFFFFF",
        }}
      >
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="max-w-3xl">
            <h2
              className="text-left"
              style={{
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                color: "#0A0A0A",
              }}
            >
              In drie stappen live
              <span style={{ color: "#587DFE" }}>.</span>
            </h2>
            <p
              className="text-left"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "#5A6094",
                maxWidth: "640px",
                marginTop: "20px",
              }}
            >
              Geen ingewikkelde onboarding. Binnen een paar minuten plaatst u
              uw eerste vacature.
            </p>
          </div>

          {/* Step cards: vertical on mobile → 3-col on desktop */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="w-full rounded-2xl bg-white shadow-sm ring-1 ring-[#E2E5F0] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(88,125,254,0.12)]"
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-full bg-[#587DFE] flex items-center justify-center mb-5"
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: "#FFFFFF",
                    boxShadow: "0 6px 16px -6px rgba(88,125,254,0.55)",
                  }}
                >
                  {step.num}
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "#2C337A",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.6,
                    color: "#5A6094",
                    marginTop: "8px",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link href="/register" className="btn-primary">
              Gratis account aanmaken
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA — full-width band ────────────────────────── */}
      <section
        className="relative isolate overflow-hidden"
        style={{
          padding: "clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)",
          background: `linear-gradient(135deg,
            #4B3BD6 0%,
            #4A5DE8 20%,
            #3E8BF5 45%,
            #22C6E0 75%,
            #7FE6F0 100%)`,
        }}
      >
        {/* Layered radial mesh — vibrant purple → blue → cyan wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(55% 70% at 8% 0%,
                rgba(215, 168, 255, 0.85) 0%,
                rgba(215, 168, 255, 0) 60%),
              radial-gradient(60% 80% at 95% 10%,
                rgba(42, 20, 230, 0.70) 0%,
                rgba(59, 44, 220, 0) 55%),
              radial-gradient(50% 65% at 75% 100%,
                rgba(64, 232, 255, 0.75) 0%,
                rgba(64, 232, 255, 0) 60%),
              radial-gradient(45% 55% at 0% 90%,
                rgba(178, 140, 255, 0.55) 0%,
                rgba(178, 140, 255, 0) 60%),
              radial-gradient(38% 50% at 45% 40%,
                rgba(255, 255, 255, 0.28) 0%,
                rgba(255, 255, 255, 0) 65%)
            `,
          }}
        />

        <div className="max-w-[1400px] mx-auto text-center relative">
          <h2
            className="mx-auto"
            style={{
              fontSize: "clamp(32px, 4.5vw, 60px)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              color: "#FFFFFF",
              maxWidth: "700px",
              textShadow: "0 1px 24px rgba(20, 24, 80, 0.28)",
            }}
          >
            Bereik juridisch talent vandaag nog
          </h2>
          <p
            className="mx-auto"
            style={{
              fontSize: "clamp(15px, 1.1vw, 17px)",
              lineHeight: 1.65,
              color: "#FFFFFF",
              opacity: 0.95,
              maxWidth: "520px",
              marginTop: "20px",
              textShadow: "0 1px 16px rgba(20, 24, 80, 0.25)",
            }}
          >
            Maak een gratis account aan, plaats uw eerste vacature en ontvang
            direct sollicitaties van juridische professionals.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium transition-transform duration-200 hover:scale-[1.03]"
              style={{ fontSize: "15px", color: "#2C337A" }}
            >
              Gratis account aanmaken
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-all duration-200 hover:bg-white/15"
              style={{
                fontSize: "15px",
                color: "#FFFFFF",
                border: "2px solid rgba(255, 255, 255, 0.85)",
              }}
            >
              Inloggen
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
