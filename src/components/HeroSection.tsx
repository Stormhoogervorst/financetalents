import { Search } from "lucide-react";

export default function HeroSection() {
  return (
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
      {/* Static layered radial gradients — soft "liquid" purple → blue → light-blue wash. */}
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
        className="max-w-[1400px] mx-auto relative"
        style={{
          // Top padding accounts for the overlapping 4.25rem (68px) navbar
          padding:
            "calc(4.25rem + clamp(60px, 8vh, 120px)) clamp(24px, 5vw, 80px) clamp(80px, 12vh, 160px)",
        }}
      >
        {/* Badge */}
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
          #1 Juridisch Carrièreplatform
        </span>

        {/* Headline */}
        <h1
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
          Vind jouw{" "}
          <span style={{ color: "#FFFFFF", whiteSpace: "nowrap" }}>
            stage of baan
          </span>
          <br />
          in de juridische wereld
        </h1>

        {/* Subheadline */}
        <p
          style={{
            fontSize: "clamp(15px, 1.1vw, 17px)",
            lineHeight: 1.65,
            color: "#FFFFFF",
            opacity: 0.95,
            maxWidth: "520px",
            marginTop: "24px",
            textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)",
          }}
        >
          Ontdek stages en vacatures bij de beste juridische werkgevers van
          Nederland. Het platform voor studenten en young professionals.
        </p>

        {/* Composite pill search bar — deep navy for strong contrast */}
        <form
          action="/vacatures"
          method="GET"
          className="mt-8"
          style={{ maxWidth: "580px" }}
        >
          <div
            className="flex items-center rounded-full"
            style={{
              padding: "6px 6px 6px 22px",
              background: "#0A0F3D",
              boxShadow:
                "0 20px 40px -18px rgba(10, 15, 61, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.10) inset",
            }}
          >
            <Search
              className="h-[18px] w-[18px] shrink-0"
              style={{ color: "rgba(255, 255, 255, 0.75)" }}
            />
            <input
              name="q"
              type="text"
              placeholder="Functie of rechtsgebied..."
              className="flex-1 min-w-0 bg-transparent border-none outline-none focus:outline-none placeholder:text-white/55"
              style={{
                padding: "10px 14px",
                fontSize: "15px",
                color: "#FFFFFF",
              }}
            />
            <button
              type="submit"
              className="shrink-0 rounded-full inline-flex items-center justify-center font-semibold text-white transition-all duration-200 hover:bg-[#4A6CE6] hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0A0F3D]"
              style={{
                padding: "12px 26px",
                fontSize: "14px",
                background: "#587DFE",
                whiteSpace: "nowrap",
              }}
            >
              Zoeken
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
