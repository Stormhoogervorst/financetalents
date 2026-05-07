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
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  if (weeks < 5) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

export default function JobListMobile({ jobs, limit = 5 }: Props) {
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
              href={`/jobs/${job.slug}`}
              className="group flex gap-4 border border-[#222222] bg-white p-5 transition-colors duration-200 active:scale-[0.99] active:bg-[#0A0A0A]"
            >
              {/* Logo */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-[#222222] bg-white p-2">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={firmName ? `${firmName} logo` : job.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="h-5 w-5 text-[#222222]/55" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3
                  className="line-clamp-2 break-words font-semibold leading-[1.08] text-[#222222] transition-colors duration-200 group-active:text-[#E85A00]"
                  style={{
                    fontSize: "20px",
                    letterSpacing: "-0.035em",
                  }}
                >
                  {job.title}
                </h3>

                <div
                  className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#222222]/55 transition-colors duration-200 group-active:text-white/55"
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
                    className="mt-1 flex items-center gap-1 text-[13px] text-[#222222]/55 transition-colors duration-200 group-active:text-white/55"
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
                        color: "#22222280",
                        fontWeight: 500,
                      }}
                    >
                      {relative}
                    </span>
                  )}
                  {job.practice_area && (
                    <span className="max-w-[55%] truncate rounded-full border border-[#222222] px-2.5 py-1 text-[11px] font-medium leading-none text-[#222222]">
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
