import Link from "next/link";

export default function CtaBand() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        padding: "clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)",
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

      <div className="max-w-[1400px] mx-auto text-center relative">
        <span
          className="inline-block rounded-full"
          style={{
            padding: "6px 16px",
            fontSize: "13px",
            fontWeight: 500,
            letterSpacing: "0.02em",
            color: "#FFFFFF",
            background: "rgba(255, 255, 255, 0.14)",
            border: "1px solid rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
        >
          KLAAR OM TE STARTEN?
        </span>
        <h2
          className="mx-auto"
          style={{
            fontSize: "clamp(32px, 4.5vw, 60px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.025em",
            color: "#FFFFFF",
            marginTop: "24px",
            maxWidth: "700px",
            textShadow: "0 1px 24px rgba(20, 24, 80, 0.28)",
          }}
        >
          Start jouw juridische carrière vandaag
        </h2>
        <p
          className="mx-auto"
          style={{
            fontSize: "clamp(15px, 1.1vw, 17px)",
            lineHeight: 1.65,
            color: "#FFFFFF",
            opacity: 0.95,
            maxWidth: "500px",
            marginTop: "20px",
            textShadow: "0 1px 16px rgba(20, 24, 80, 0.25)",
          }}
        >
          Bekijk alle openstaande vacatures en vind de perfecte stage of baan
          bij een topwerkgever.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/vacatures"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium transition-transform duration-200 hover:scale-[1.03]"
            style={{ fontSize: "15px", color: "#2C337A" }}
          >
            Bekijk vacatures
          </Link>
          <Link
            href="/stages"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-all duration-200 hover:bg-white/15"
            style={{
              fontSize: "15px",
              color: "#FFFFFF",
              border: "2px solid rgba(255, 255, 255, 0.85)",
            }}
          >
            Bekijk stages
          </Link>
        </div>
      </div>
    </section>
  );
}
