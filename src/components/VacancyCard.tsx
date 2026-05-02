import Link from "next/link";
import { Vacancy } from "@/types";
import { MapPin, Clock, Wifi, DollarSign } from "lucide-react";
import { cn, employmentTypeLabels, experienceLevelLabels, formatSalary, formatDate } from "@/lib/utils";

interface Props {
  vacancy: Vacancy;
}

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
  draft: "bg-yellow-100 text-yellow-700",
};

export default function VacancyCard({ vacancy }: Props) {
  return (
    <Link href={`/vacancies/${vacancy.id}`} className="card block p-6 hover:shadow-md transition group">
      <div className="flex items-start gap-4">
        {/* Company logo or placeholder */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg uppercase overflow-hidden">
          {vacancy.company_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={vacancy.company_logo_url} alt={`${vacancy.company_name} logo`} className="w-full h-full object-cover" />
          ) : (
            vacancy.company_name[0]
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition truncate">
                {vacancy.title}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">{vacancy.company_name}</p>
            </div>
            <span className={cn("badge flex-shrink-0", statusColors[vacancy.status])}>
              {vacancy.status}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {vacancy.location}
              {vacancy.remote && " · Remote"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {employmentTypeLabels[vacancy.employment_type]}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {formatSalary(vacancy.salary_min, vacancy.salary_max, vacancy.salary_currency)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="badge bg-brand-50 text-brand-700">
                {experienceLevelLabels[vacancy.experience_level]}
              </span>
              {vacancy.remote && (
                <span className="badge bg-purple-50 text-purple-700 flex items-center gap-1">
                  <Wifi className="h-3 w-3" /> Remote
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">{formatDate(vacancy.created_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
