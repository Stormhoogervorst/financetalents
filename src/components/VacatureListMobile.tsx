import Link from "next/link";
import { Briefcase, Building2, MapPin } from "lucide-react";
import { Job, jobTypeLabels } from "@/types";

interface Props {
  jobs: Job[];
  /** Max items to render (default: 5). */
  limit?: number;
}

function formatRelativeDate(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const diffMs = Date.now() - then;
  const day = 24 * 60 * 60 * 1000;
  const days = Math.floor(diffMs / day);
  if (days <= 0) return "vandaag";
  if (days === 1) return "1 dag geleden";
  if (days < 7) return `${days} dagen geleden`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week geleden";
  if (weeks < 5) return `${weeks} weken geleden`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 maand geleden";
  return `${months} maanden geleden`;
}

export default function VacatureListMobile({ jobs, limit = 5 }: Props) {
  const items = jobs.slice(0, limit);
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-col gap-4">
      {items.map((job) => {
        const firmName = job.firms?.name ?? "";
        const logoUrl = job.firms?.logo_url ?? null;
        const relative = formatRelativeDate(job.created_at);
        const typeLabel = job.type ? jobTypeLabels[job.type] ?? job.type : null;

        return (
          <li key={job.id}>
            <Link
              href={`/vacature/${job.slug}`}
              className="flex gap-4 rounded-[16px] p-5 transition-all duration-200 active:scale-[0.99]"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
                backgroundColor: "#F5F7FF",
              }}
            >
              {/* Logo */}
              <div className="w-14 h-14 rounded-[12px] bg-white border border-[#E2E5F0] flex items-center justify-center overflow-hidden p-2 shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={firmName ? `${firmName} logo` : job.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-[#8B91B8]" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold leading-snug line-clamp-2 break-words"
                  style={{
                    fontSize: "16px",
                    letterSpacing: "-0.01em",
                    color: "#2C337A",
                  }}
                >
                  {job.title}
                </h3>

                <div
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2"
                  style={{ fontSize: "13px", color: "#8B91B8" }}
                >
                  {firmName && (
                    <span className="flex items-center gap-1 min-w-0">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{firmName}</span>
                    </span>
                  )}
                  {typeLabel && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 shrink-0" />
                      <span>{typeLabel}</span>
                    </span>
                  )}
                </div>

                {job.location && (
                  <div
                    className="flex items-center gap-1 mt-1"
                    style={{ fontSize: "13px", color: "#8B91B8" }}
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mt-3">
                  {relative && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#B0B8D8",
                        fontWeight: 500,
                      }}
                    >
                      {relative}
                    </span>
                  )}
                  {job.practice_area && (
                    <span className="bg-[#2C337A] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full leading-none truncate max-w-[55%]">
                      {job.practice_area}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
