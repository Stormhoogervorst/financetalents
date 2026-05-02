import Link from "next/link";
import { Firm } from "@/types";

interface Props {
  firm: Firm;
}

export default function FirmCard({ firm }: Props) {
  const initials = firm.name.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/werkgevers/${firm.slug}`}
      className="group flex items-start gap-5 py-6 border-b border-[#E5E5E5] transition-colors duration-300 last:border-b-0"
    >
      {/* Logo */}
      <div className="w-14 h-14 rounded-[4px] bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden">
        {firm.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firm.logo_url}
            alt={`${firm.name} logo`}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <span
            className="font-semibold text-sm"
            style={{ color: "#587DFE" }}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold leading-snug group-hover:opacity-70 transition-opacity duration-300"
          style={{
            fontSize: "clamp(18px, 1.5vw, 22px)",
            letterSpacing: "-0.01em",
            color: "#0A0A0A",
          }}
        >
          {firm.name}
        </h3>

        <div className="mt-1 w-full flex items-center overflow-hidden">
          <p
            className="min-w-0 w-full text-[12px] font-medium leading-tight tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ color: "#999999" }}
          >
            {firm.location && firm.team_size ? (
              <>
                {firm.location}
                <span className="mx-1">·</span>
                {firm.team_size} medewerkers
              </>
            ) : firm.location ? (
              firm.location
            ) : firm.team_size ? (
              <>{firm.team_size} medewerkers</>
            ) : null}
          </p>
        </div>

        {firm.practice_areas && firm.practice_areas.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {firm.practice_areas.map((area) => (
              <span
                key={area}
                className="bg-[#668dff] text-white text-[12px] font-semibold px-3 py-1 rounded-full"
              >
                {area}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      <span
        className="shrink-0 mt-1 text-lg transition-transform duration-200 group-hover:translate-x-1"
        style={{ color: "#999999" }}
      >
        ↗
      </span>
    </Link>
  );
}
