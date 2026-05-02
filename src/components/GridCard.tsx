import Link from "next/link";
import { Building2 } from "lucide-react";
import { type ReactNode } from "react";

export interface GridCardProps {
  href: string;
  logoUrl: string | null;
  logoFallback?: ReactNode;
  /** Small label rendered top-right (e.g. a date). */
  topRight?: string;
  title: string;
  subtitle?: string;
  /** Icon + text pairs shown below the subtitle. */
  meta?: { icon: ReactNode; text: string }[];
  /** Blue pill labels pushed to the bottom of the card. */
  pills?: string[];
}

export default function GridCard({
  href,
  logoUrl,
  logoFallback,
  topRight,
  title,
  subtitle,
  meta,
  pills,
}: GridCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col h-full rounded-[16px] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(88,125,254,0.12)]"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
        backgroundColor: "#F5F7FF",
      }}
    >
      {/* Logo + top-right label */}
      <div className="flex items-start justify-between mb-5">
        <div className="w-14 h-14 rounded-[10px] bg-white border border-[#E2E5F0] flex items-center justify-center overflow-hidden p-2 shrink-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${title} logo`}
              className="w-full h-full object-contain"
            />
          ) : (
            logoFallback ?? <Building2 className="h-5 w-5 text-[#8B91B8]" />
          )}
        </div>
        {topRight && (
          <span
            className="text-[11px] font-medium"
            style={{ color: "#B0B8D8" }}
          >
            {topRight}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className="font-semibold leading-snug group-hover:text-[#587DFE] transition-colors duration-200"
        style={{
          fontSize: "clamp(15px, 1.2vw, 18px)",
          letterSpacing: "-0.01em",
          color: "#2C337A",
        }}
      >
        {title}
      </h3>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-1 text-[13px]" style={{ color: "#8B91B8" }}>
          {subtitle}
        </p>
      )}

      {/* Meta row */}
      {meta && meta.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {meta.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-1 text-[12px]"
              style={{ color: "#8B91B8" }}
            >
              {item.icon}
              {item.text}
            </span>
          ))}
        </div>
      )}

      {/* Pills — pushed to bottom */}
      {pills && pills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-auto pt-4">
          {pills.map((pill) => (
            <span
              key={pill}
              className="bg-[#2C337A] text-white text-[12px] font-semibold px-3 py-1 rounded-full"
            >
              {pill}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
