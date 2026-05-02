import Link from "next/link";
import { Job, jobTypeLabels } from "@/types";

interface Props {
  job: Job;
}

export default function JobCard({ job }: Props) {
  const firmName = job.firms?.name ?? "";
  const logoUrl = job.firms?.logo_url ?? null;
  const initials = firmName.slice(0, 2).toUpperCase();
  const typeLabel = jobTypeLabels[job.type] ?? job.type;

  const postedDate = new Date(job.created_at).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
  });

  return (
    <Link
      href={`/vacature/${job.slug}`}
      className="group flex items-center gap-5 sm:gap-8 py-6 border-b border-[#E5E5E5] transition-colors duration-300 hover:bg-[#FAFAFA] -mx-2 px-2"
    >
      {/* Firm logo */}
      <div className="w-14 h-14 rounded-[4px] bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`${firmName} logo`}
            className="w-10 h-10 object-contain"
          />
        ) : (
          <span
            className="text-[13px] font-semibold tracking-wide"
            style={{ color: "#999999" }}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold leading-snug tracking-[-0.01em] text-[#0A0A0A] group-hover:text-[#587DFE] transition-colors duration-200"
          style={{ fontSize: "clamp(18px, 1.5vw, 22px)" }}
        >
          {job.title}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[#6B6B6B]">
          {firmName && <span>{firmName}</span>}
          {job.location && (
            <span className="flex items-center gap-1">
              {job.location}
            </span>
          )}
          <span>{typeLabel}</span>
        </div>
      </div>

      {/* Right side: meta + arrow */}
      <div className="hidden sm:flex items-center gap-6 shrink-0">
        {job.practice_area && (
          <span className="text-[13px] font-medium tracking-[0.02em] text-[#999999]">
            {job.practice_area}
          </span>
        )}
        <span className="text-[13px] text-[#999999] whitespace-nowrap">
          {postedDate}
        </span>
        <span className="text-[#587DFE] text-sm opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
          ↗
        </span>
      </div>
    </Link>
  );
}
