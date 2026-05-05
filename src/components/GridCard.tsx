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
      className="group flex h-full min-h-[300px] flex-col border border-[#222222] bg-white p-6 transition-colors duration-200 hover:bg-[#0A0A0A]"
      style={{
        borderRadius: 0,
      }}
    >
      {/* Logo + top-right label */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-[#222222] bg-white p-2 transition-colors duration-200 group-hover:border-white/20">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${title} logo`}
              className="w-full h-full object-contain"
            />
          ) : (
            logoFallback ?? <Building2 className="h-5 w-5 text-[#222222]/55" />
          )}
        </div>
        {topRight && (
          <span
            className="text-[11px] font-medium text-[#222222]/50 transition-colors duration-200 group-hover:text-white/50"
          >
            {topRight}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className="mt-auto font-semibold leading-[1.05] text-[#222222] transition-colors duration-200 group-hover:text-[#E85A00]"
        style={{
          fontSize: "clamp(22px, 2vw, 32px)",
          letterSpacing: "-0.04em",
        }}
      >
        {title}
      </h3>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-3 text-[13px] text-[#222222]/55 transition-colors duration-200 group-hover:text-white/55">
          {subtitle}
        </p>
      )}

      {/* Meta row */}
      {meta && meta.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {meta.map((item, i) => (
            <span
              key={i}
            className="flex items-center gap-1 text-[12px] text-[#222222]/55 transition-colors duration-200 group-hover:text-white/55"
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
              className="rounded-full border border-[#222222] px-3 py-1 text-[12px] font-medium text-[#222222] transition-colors duration-200 group-hover:border-[#E85A00] group-hover:text-[#E85A00]"
            >
              {pill}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
