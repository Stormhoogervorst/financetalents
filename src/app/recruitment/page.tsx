"use client";

import Link from "next/link";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import { useState, FormEvent, useRef, useEffect } from "react";

const benefits = [
  {
    title: "Geen opstartkosten",
    description:
      "Wij beginnen direct met de search zonder factuur vooraf. U betaalt pas bij een succesvolle plaatsing — nooit eerder.",
  },
  {
    title: "Actieve headhunting",
    description:
      "Wij benaderen talent in ons netwerk actief. We wachten niet op reacties, maar gaan proactief op zoek naar de juiste match.",
  },
  {
    title: "Resultaatgericht",
    description:
      "De fee is pas verschuldigd op de dag dat de kandidaat bij u start. Geen plaatsing, geen kosten — zo simpel is het.",
  },
];

const steps = [
  {
    number: "01",
    title: "Intake",
    description:
      "We bespreken het gewenste profiel, de werkgeverscultuur en uw specifieke wensen.",
  },
  {
    number: "02",
    title: "Search & select",
    description:
      "Actieve search in ons netwerk en op diverse platformen naar de juiste kandidaten.",
  },
  {
    number: "03",
    title: "Screening",
    description:
      "Uitgebreid interview en screening door onze gespecialiseerde recruiters.",
  },
  {
    number: "04",
    title: "Matching",
    description:
      "Begeleiding bij gesprekken, onderhandeling en arbeidsvoorwaarden tot de start.",
  },
];

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// Shared vivid mesh gradient used for the hero and the CTA contact section.
const vividMeshStyle: React.CSSProperties = {
  background: `linear-gradient(135deg,
    #4B3BD6 0%,
    #5668E8 22%,
    #7A8BF5 42%,
    #A8B6FF 62%,
    #C9D4FF 82%,
    #FFFFFF 100%)`,
};

const vividMeshOverlay: React.CSSProperties = {
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
};

// Subtle card mesh used across cards on light sections.
const subtleCardMesh: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
  backgroundColor: "#F5F7FF",
};

export default function RecruitmentPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const form = e.currentTarget;
    const data = {
      firstName: (form.elements.namedItem("firstName") as HTMLInputElement)
        .value,
      lastName: (form.elements.namedItem("lastName") as HTMLInputElement).value,
      firmName: (form.elements.namedItem("firmName") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/recruitment-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => ({} as { success?: boolean; error?: string }));
      if (!res.ok || !json.success) {
        setSubmitError(json.error ?? "Versturen is mislukt. Probeer het opnieuw.");
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitError("Geen verbinding. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <NavbarPublic variant="hero" />

      {/* ── Hero — vivid mesh gradient, white text, no images ──── */}
      {/* Negative margin pulls the hero gradient up behind the liquid-glass navbar */}
      <section
        className="relative isolate overflow-hidden -mt-[4.25rem]"
        style={vividMeshStyle}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={vividMeshOverlay}
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
          className="max-w-[1400px] mx-auto relative"
          style={{
            padding:
              "calc(4.25rem + clamp(60px, 8vh, 120px)) clamp(24px, 5vw, 80px) clamp(80px, 12vh, 160px)",
          }}
        >
          <FadeIn delay={0.1}>
            <h1
              style={{
                fontSize: "clamp(44px, 5.5vw, 76px)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                maxWidth: "880px",
                textShadow: "0 1px 24px rgba(20, 24, 80, 0.25)",
              }}
            >
              Vind juridisch talent, zonder financieel risico
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p
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
              Wij searchen actief naar de perfecte match voor uw organisatie.
              Geen opstartkosten, geen verborgen fees — u betaalt pas bij een
              succesvolle plaatsing.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a href="#contact" className="btn-primary">
                Vrijblijvend kennismaken
              </a>
              <a
                href="#proces"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-medium transition-all duration-200 hover:bg-white/15 hover:scale-[1.03]"
                style={{
                  fontSize: "14px",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255, 255, 255, 0.55)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                }}
              >
                Bekijk ons proces
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Voordelen ────────────────────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            <div className="lg:col-span-4">
              <FadeIn delay={0.1}>
                <h2
                  style={{
                    fontSize: "clamp(32px, 4vw, 56px)",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                    color: "#0A0A0A",
                  }}
                >
                  Waarom kiezen voor Legal Talents
                  <span style={{ color: "#587DFE" }}>.</span>
                </h2>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p
                  style={{
                    fontSize: "clamp(15px, 1.1vw, 17px)",
                    lineHeight: 1.65,
                    color: "#5A6094",
                    maxWidth: "640px",
                    marginTop: "20px",
                  }}
                >
                  Wij nemen het volledige wervingsproces uit handen — zonder
                  financieel risico voor u.
                </p>
              </FadeIn>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-5">
              {benefits.map((b, idx) => (
                <FadeIn key={b.title} delay={0.1 + idx * 0.08}>
                  <div
                    className="rounded-[16px] p-6 sm:p-8 flex gap-5 items-start transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(88,125,254,0.12)]"
                    style={subtleCardMesh}
                  >
                    <span
                      className="shrink-0 inline-flex items-center justify-center rounded-full"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "#2C337A",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 600,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#2C337A" }}>
                        {b.title}
                      </h3>
                      <p style={{ fontSize: "15px", lineHeight: 1.6, color: "#5A6094", marginTop: "6px" }}>
                        {b.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Quote ────────────────────────────────────────────── */}
      <section
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-1 flex items-start pt-2">
            <FadeIn>
              <div
                className="w-12 h-12 rounded-full bg-[#587DFE] flex items-center justify-center"
                aria-hidden="true"
              />
            </FadeIn>
          </div>
          <div className="lg:col-span-10">
            <FadeIn delay={0.15}>
              <blockquote
                style={{
                  fontSize: "clamp(24px, 3vw, 40px)",
                  fontWeight: 600,
                  lineHeight: 1.3,
                  letterSpacing: "-0.02em",
                  color: "#0A0A0A",
                }}
              >
                Van collegezaal tot kantoor, ons netwerk in het studentenleven
                geeft ons toegang tot juridisch talent dat anderen nog niet
                kennen.
              </blockquote>
            </FadeIn>
            <FadeIn delay={0.25}>
              <p
                className="mt-8"
                style={{ fontSize: "15px", fontWeight: 600, color: "#2C337A" }}
              >
                Storm Hoogervorst
              </p>
              <p
                className="mt-1"
                style={{ fontSize: "14px", color: "#8B91B8" }}
              >
                Mede-eigenaar Legal Talents
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Proces ───────────────────────────────────────────── */}
      <section
        id="proces"
        className="scroll-mt-20"
        style={{ padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)" }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div>
            <FadeIn delay={0.1}>
              <h2
                className="lg:whitespace-nowrap"
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  color: "#0A0A0A",
                }}
              >
                Van intake tot de eerste werkdag
                <span style={{ color: "#587DFE" }}>.</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p
                className="lg:whitespace-nowrap"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#5A6094",
                  marginTop: "12px",
                }}
              >
                Wij begeleiden het volledige traject. Transparant, efficiënt en
                altijd met oog voor de juiste match.
              </p>
            </FadeIn>
          </div>

          <div className="mt-5 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((step, idx) => (
                <FadeIn key={step.number} delay={0.1 + idx * 0.08}>
                  <div
                    className="h-full rounded-[16px] p-6 sm:p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(88,125,254,0.12)]"
                    style={subtleCardMesh}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        color: "rgba(44, 51, 122, 0.35)",
                        marginBottom: "12px",
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3
                      style={{
                        fontSize: "clamp(18px, 1.5vw, 22px)",
                        fontWeight: 600,
                        lineHeight: 1.3,
                        letterSpacing: "-0.01em",
                        color: "#2C337A",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="mt-2"
                      style={{
                        fontSize: "clamp(14px, 1vw, 15px)",
                        lineHeight: 1.6,
                        color: "#5A6094",
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / Contact — vivid mesh (matches homepage CtaBand) ──── */}
      <section
        id="contact"
        className="relative isolate overflow-hidden scroll-mt-20"
        style={{
          padding: "clamp(100px, 12vh, 180px) clamp(24px, 5vw, 80px)",
          background: `linear-gradient(135deg,
            #3A2BC9 0%,
            #4B5BE0 22%,
            #5E8CF5 45%,
            #3FC6E8 70%,
            #7A8BF5 100%)`,
        }}
      >
        {/* Vivid mesh gradient — overlapping radial layers in bright blue, cyan & soft purple */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(55% 65% at 12% 18%,
                rgba(178, 140, 255, 0.85) 0%,
                rgba(140, 120, 255, 0.35) 38%,
                rgba(120, 150, 255, 0) 72%),
              radial-gradient(60% 60% at 88% 12%,
                rgba(52, 30, 220, 0.90) 0%,
                rgba(59, 44, 220, 0.40) 30%,
                rgba(88, 125, 254, 0) 68%),
              radial-gradient(55% 60% at 92% 88%,
                rgba(80, 220, 255, 0.80) 0%,
                rgba(80, 200, 255, 0.35) 38%,
                rgba(80, 200, 255, 0) 72%),
              radial-gradient(50% 55% at 8% 92%,
                rgba(215, 168, 255, 0.85) 0%,
                rgba(215, 168, 255, 0.35) 40%,
                rgba(215, 168, 255, 0) 72%),
              radial-gradient(60% 55% at 50% 55%,
                rgba(120, 170, 255, 0.55) 0%,
                rgba(120, 170, 255, 0.20) 45%,
                rgba(120, 170, 255, 0) 72%),
              radial-gradient(35% 45% at 72% 48%,
                rgba(255, 255, 255, 0.25) 0%,
                rgba(255, 255, 255, 0) 65%)
            `,
          }}
        />

        <div className="max-w-[1400px] mx-auto relative grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4">
            <FadeIn delay={0.1}>
              <h2
                style={{
                  fontSize: "clamp(32px, 4vw, 56px)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  color: "#FFFFFF",
                  textShadow: "0 1px 24px rgba(20, 24, 80, 0.25)",
                }}
              >
                Laten we kennismaken
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#FFFFFF",
                  opacity: 0.92,
                  maxWidth: "420px",
                  marginTop: "20px",
                  textShadow: "0 1px 16px rgba(20, 24, 80, 0.2)",
                }}
              >
                Heeft u een vacature of wilt u de mogelijkheden bespreken? Laat
                uw gegevens achter en wij nemen binnen 24 uur contact met u op.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-12 space-y-6">
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.7)",
                      marginBottom: "6px",
                    }}
                  >
                    E-mail
                  </p>
                  <a
                    href="mailto:storm@legal-talents.nl"
                    className="text-[15px] font-medium border-b border-white/40 pb-0.5 hover:border-white transition-colors duration-200"
                    style={{ color: "#FFFFFF" }}
                  >
                    storm@legal-talents.nl
                  </a>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "rgba(255, 255, 255, 0.7)",
                      marginBottom: "6px",
                    }}
                  >
                    Telefoon
                  </p>
                  <a
                    href="tel:+31685680998"
                    className="text-[15px] font-medium"
                    style={{ color: "#FFFFFF" }}
                  >
                    +31 6 85 68 09 98
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            {submitted ? (
              <FadeIn>
                <div
                  className="rounded-[20px] p-10 sm:p-12 backdrop-blur-[10px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "clamp(24px, 3vw, 36px)",
                      fontWeight: 700,
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                      color: "#FFFFFF",
                      marginBottom: "16px",
                    }}
                  >
                    Bedankt voor uw aanvraag
                  </h3>
                  <p
                    style={{
                      fontSize: "clamp(15px, 1.1vw, 17px)",
                      lineHeight: 1.65,
                      color: "rgba(255, 255, 255, 0.92)",
                      maxWidth: "480px",
                    }}
                  >
                    Wij nemen binnen 24 uur contact met u op om de mogelijkheden
                    te bespreken.
                  </p>
                </div>
              </FadeIn>
            ) : (
              <FadeIn delay={0.15}>
                <form
                  onSubmit={handleSubmit}
                  className="rounded-[20px] p-6 sm:p-10 backdrop-blur-[10px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.10)",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <div className="py-4 border-b border-white/35 focus-within:border-white transition-colors duration-300">
                      <label htmlFor="firstName" className="sr-only">
                        Voornaam
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        placeholder="Voornaam"
                        className="w-full bg-transparent text-[15px] text-white placeholder-white/65 focus:outline-none"
                        style={{ padding: "4px 0" }}
                      />
                    </div>
                    <div className="py-4 border-b border-white/35 focus-within:border-white transition-colors duration-300">
                      <label htmlFor="lastName" className="sr-only">
                        Achternaam
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        placeholder="Achternaam"
                        className="w-full bg-transparent text-[15px] text-white placeholder-white/65 focus:outline-none"
                        style={{ padding: "4px 0" }}
                      />
                    </div>
                  </div>

                  <div className="py-4 border-b border-white/35 focus-within:border-white transition-colors duration-300">
                    <label htmlFor="firmName" className="sr-only">
                      Werkgeversnaam
                    </label>
                    <input
                      id="firmName"
                      name="firmName"
                      type="text"
                      required
                      placeholder="Werkgeversnaam"
                      className="w-full bg-transparent text-[15px] text-white placeholder-white/65 focus:outline-none"
                      style={{ padding: "4px 0" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    <div className="py-4 border-b border-white/35 focus-within:border-white transition-colors duration-300">
                      <label htmlFor="email" className="sr-only">
                        E-mailadres
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="E-mailadres"
                        className="w-full bg-transparent text-[15px] text-white placeholder-white/65 focus:outline-none"
                        style={{ padding: "4px 0" }}
                      />
                    </div>
                    <div className="py-4 border-b border-white/35 focus-within:border-white transition-colors duration-300">
                      <label htmlFor="phone" className="sr-only">
                        Telefoonnummer
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="Telefoonnummer"
                        className="w-full bg-transparent text-[15px] text-white placeholder-white/65 focus:outline-none"
                        style={{ padding: "4px 0" }}
                      />
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.75)",
                      marginTop: "2.5rem",
                    }}
                  >
                    Door dit formulier in te dienen gaat u akkoord met ons{" "}
                    <Link
                      href="/privacy"
                      className="border-b border-white/40 hover:border-white transition-colors duration-200"
                      style={{ color: "#FFFFFF" }}
                    >
                      privacybeleid
                    </Link>
                    .
                  </p>

                  {submitError && (
                    <p className="mt-3 text-[13px] text-red-100 bg-red-500/30 border border-red-200/40 rounded-lg px-3 py-2">
                      {submitError}
                    </p>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary"
                    >
                      {submitting
                        ? "Verzenden…"
                        : "Terugbelverzoek indienen"}
                    </button>
                  </div>
                </form>
              </FadeIn>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
