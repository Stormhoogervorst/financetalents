import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Mail,
  Globe,
  MapPin,
  Plus,
  Shield,
  UserRoundCog,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { impersonateEmployerAction } from "@/lib/impersonation-actions";
import DeleteEmployerButton from "../DeleteEmployerButton";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

type FirmDetail = {
  id: string;
  name: string;
  slug: string | null;
  notification_email: string | null;
  website_url: string | null;
  location: string | null;
  is_published: boolean | null;
  created_at: string;
};

type JobWithApps = {
  id: string;
  title: string;
  slug: string | null;
  location: string | null;
  status: "draft" | "active" | "closed" | null;
  created_at: string;
};

const statusBadge: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  draft: "bg-orange-50 text-orange-700",
  closed: "bg-gray-100 text-gray-600",
};

const statusLabel: Record<string, string> = {
  active: "Live",
  draft: "Concept",
  closed: "Gesloten",
};

export default async function AdminFirmDetailPage({ params }: Props) {
  const { id } = await params;

  // Auth + admin-rol worden afgedwongen door (secure)/layout.tsx en
  // middleware.ts. We mogen direct met de service-role client praten.
  const admin = createAdminClient();

  const { data: firm } = await admin
    .from("firms")
    .select(
      "id, name, slug, notification_email, website_url, location, is_published, created_at"
    )
    .eq("id", id)
    .maybeSingle<FirmDetail>();

  if (!firm) notFound();

  const { data: jobs } = await admin
    .from("jobs")
    .select("id, title, slug, location, status, created_at")
    .eq("firm_id", firm.id)
    .order("created_at", { ascending: false });

  const jobList = (jobs ?? []) as JobWithApps[];

  const jobIds = jobList.map((j) => j.id);
  const applicationCounts = new Map<string, number>();
  let totalApplications = 0;

  if (jobIds.length > 0) {
    const { data: apps } = await admin
      .from("applications")
      .select("id, job_id")
      .in("job_id", jobIds);

    for (const row of (apps ?? []) as { id: string; job_id: string | null }[]) {
      if (!row.job_id) continue;
      applicationCounts.set(
        row.job_id,
        (applicationCounts.get(row.job_id) ?? 0) + 1
      );
      totalApplications++;
    }
  }

  const liveCount = jobList.filter((j) => j.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar Admin
        </Link>

        {/* Firm header */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-inset ring-red-200">
                <Shield className="h-3 w-3" />
                Super Admin · Werkgever
              </div>
              <h1 className="mt-3 text-2xl font-bold text-gray-900">
                {firm.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
                {firm.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {firm.location}
                  </span>
                )}
                {firm.notification_email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {firm.notification_email}
                  </span>
                )}
                {firm.website_url && (
                  <a
                    href={firm.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-brand-600"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5">
                  Aangemaakt op{" "}
                  {new Date(firm.created_at).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {firm.is_published ? (
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  Gepubliceerd
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  Concept
                </span>
              )}
              {firm.slug && (
                <Link
                  href={`/werkgevers/${firm.slug}`}
                  target="_blank"
                  className="inline-flex items-center rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700"
                >
                  Bekijk publieke pagina
                </Link>
              )}
              <form action={impersonateEmployerAction}>
                <input type="hidden" name="employerId" value={firm.id} />
                <button
                  type="submit"
                  title="Open het werkgevers-dashboard precies zoals deze klant het ziet"
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-amber-950 ring-1 ring-inset ring-amber-600 transition hover:bg-amber-400"
                >
                  <UserRoundCog className="h-3.5 w-3.5" />
                  Log in als dit bedrijf
                </button>
              </form>
              <Link
                href={`/portal/jobs/new?asEmployer=${firm.id}`}
                title="Open het vacature-formulier met deze werkgever al ingevuld"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Plaats vacature namens dit bedrijf
              </Link>
              <DeleteEmployerButton
                employerId={firm.id}
                employerName={firm.name}
              />
            </div>
          </div>

          {/* Mini stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-5">
            <Stat
              icon={<Briefcase className="h-4 w-4" />}
              label="Live vacatures"
              value={liveCount}
            />
            <Stat
              icon={<Briefcase className="h-4 w-4" />}
              label="Totaal vacatures"
              value={jobList.length}
            />
            <Stat
              icon={<FileText className="h-4 w-4" />}
              label="Sollicitaties"
              value={totalApplications}
            />
          </div>
        </div>

        {/* Jobs table */}
        <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Vacatures</h2>
            <p className="text-xs text-gray-500">
              Alle vacatures van {firm.name} met bijbehorend aantal sollicitaties.
            </p>
          </div>

          {jobList.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              Deze werkgever heeft nog geen vacatures geplaatst.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Titel
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Locatie
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Sollicitaties
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Aangemaakt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobList.map((job) => {
                    const count = applicationCounts.get(job.id) ?? 0;
                    const status = job.status ?? "draft";
                    return (
                      <tr
                        key={job.id}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          {firm.slug && job.slug ? (
                            <Link
                              href={`/vacature/${job.slug}`}
                              target="_blank"
                              className="font-semibold text-gray-900 hover:text-brand-600"
                            >
                              {job.title}
                            </Link>
                          ) : (
                            <span className="font-semibold text-gray-900">
                              {job.title}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-500">
                          {job.location ?? "—"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              statusBadge[status] ?? statusBadge.draft
                            }`}
                          >
                            {statusLabel[status] ?? "Concept"}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-900">
                          {count}
                        </td>
                        <td className="px-4 py-4 text-gray-500">
                          {new Date(job.created_at).toLocaleDateString(
                            "nl-NL",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
