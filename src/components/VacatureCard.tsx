import { Briefcase, MapPin } from "lucide-react";
import GridCard from "@/components/GridCard";
import { Job, jobTypeLabels } from "@/types";

interface Props {
  job: Job;
  /** Show stage-specific details (salary, hours) instead of generic job type. */
  stageMode?: boolean;
}

export default function VacatureCard({ job, stageMode }: Props) {
  const firmName = job.firms?.name ?? "";
  const logoUrl = job.firms?.logo_url ?? null;
  const date = job.created_at
    ? new Date(job.created_at).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "short",
      })
    : null;

  const meta: { icon: React.ReactNode; text: string }[] = [];

  if (job.location) {
    meta.push({
      icon: <MapPin className="h-3 w-3 shrink-0" />,
      text: job.location,
    });
  }

  if (stageMode) {
    if (job.salary_indication) {
      meta.push({
        icon: <Briefcase className="h-3 w-3 shrink-0" />,
        text: job.salary_indication,
      });
    }
    if (job.hours_per_week) {
      meta.push({
        icon: <Briefcase className="h-3 w-3 shrink-0" />,
        text: `${job.hours_per_week} uur/week`,
      });
    }
  } else if (job.type) {
    meta.push({
      icon: <Briefcase className="h-3 w-3 shrink-0" />,
      text: jobTypeLabels[job.type] ?? job.type,
    });
  }

  const pills = job.practice_area ? [job.practice_area] : [];

  return (
    <GridCard
      href={`/vacature/${job.slug}`}
      logoUrl={logoUrl}
      topRight={date ?? undefined}
      title={job.title}
      subtitle={firmName || undefined}
      meta={meta}
      pills={pills}
    />
  );
}
