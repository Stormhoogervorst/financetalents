import Link from "next/link";
import { Briefcase, Shield } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { JobDeleteButton } from "./JobDeleteButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vacaturebeheer",
};

/**
 * Centraal vacature-overzicht voor de Super Admin.
 *
 * Haalt álle vacatures op (nieuwste eerst) via de service-role client en
 * joint de bijbehorende firm-naam in één query. Filters werken via
 * `?filter=...` in de URL, zodat de knoppen ook zonder client-JS werken
 * (elke filterknop is gewoon een <Link>).
 *
 * `jobs.status` (draft/active) is de enige bron van waarheid voor
 * "Live" vs "Concept".
 */

type JobStatus = "draft" | "active" | "closed";

type JobRow = {
  id: string;
  title: string;
  slug: string | null;
  status: JobStatus | null;
  created_at: string;
  firm_id: string;
  firms: { id: string; name: string; slug: string | null } | null;
};

type FilterKey = "all" | "live" | "draft";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "live", label: "Live" },
  { key: "draft", label: "Concept" },
];

const STATUS_BADGE: Record<JobStatus, string> = {
  active: "bg-green-50 text-green-700 ring-green-200",
  draft: "bg-orange-50 text-orange-700 ring-orange-200",
  closed: "bg-gray-100 text-gray-600 ring-gray-200",
};

const STATUS_LABEL: Record<JobStatus, string> = {
  active: "Live",
  draft: "Concept",
  closed: "Gesloten",
};

function normalizeFilter(raw: string | string[] | undefined): FilterKey {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "live" || v === "draft") return v;
  return "all";
}

export default async function AdminVacaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  // Auth + admin-rol worden afgedwongen door (secure)/layout.tsx en
  // middleware.ts. We mogen direct met de service-role client praten.
  const admin = createAdminClient();
  const { filter: rawFilter } = await searchParams;
  const filter = normalizeFilter(rawFilter);

  let query = admin
    .from("jobs")
    .select(
      `
        id,
        title,
        slug,
        status,
        created_at,
        firm_id,
        firms:firm_id ( id, name, slug )
      `
    )
    .order("created_at", { ascending: false });

  if (filter === "live") query = query.eq("status", "active");
  if (filter === "draft") query = query.eq("status", "draft");

  const { data, error } = await query;

  if (error) {
    console.error("[admin/vacatures] jobs fetch error:", error.message);
  }

  // Supabase typeert de `firms` relatie soms als array en soms als object,
  // afhankelijk van de FK-metadata. We normaliseren dat hier naar één shape.
  const jobs: JobRow[] = ((data ?? []) as unknown as Array<
    Omit<JobRow, "firms"> & { firms: JobRow["firms"] | JobRow["firms"][] }
  >).map((row) => ({
    ...row,
    firms: Array.isArray(row.firms) ? row.firms[0] ?? null : row.firms ?? null,
  }));

  // Counts voor de filterknoppen. Eén extra lightweight query naar alléén
  // `status`, zodat de badges altijd de juiste totalen laten zien — ook
  // wanneer er een filter actief is.
  const { data: allForCounts } = await admin.from("jobs").select("status");

  const counts: Record<FilterKey, number> = {
    all: allForCounts?.length ?? 0,
    live: 0,
    draft: 0,
  };

  for (const row of (allForCounts ?? []) as { status: JobStatus | null }[]) {
    if (row.status === "active") counts.live++;
    else if (row.status === "draft") counts.draft++;
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200">
          <Shield className="h-3.5 w-3.5" />
          Super Admin
        </div>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Vacaturebeheer</h1>
        <p className="mt-1 text-sm text-gray-500">
          Alle vacatures op het platform. Filter op status of verwijder
          ongewenste posts.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          const href =
            key === "all" ? "/admin/vacatures" : `/admin/vacatures?filter=${key}`;
          return (
            <Link
              key={key}
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ring-1 ring-inset ${
                active
                  ? "bg-gray-900 text-white ring-gray-900"
                  : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active ? "bg-white/15 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[key]}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Vacatures</h2>
            <p className="text-xs text-gray-500">
              {jobs.length} resultaat{jobs.length !== 1 ? "en" : ""}, nieuwste eerst
            </p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            <Briefcase className="mx-auto h-6 w-6 text-gray-300" />
            <p className="mt-2">Geen vacatures gevonden voor dit filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Bedrijf
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Vacature titel
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Datum
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => {
                  const status: JobStatus = job.status ?? "draft";
                  const firmName = job.firms?.name ?? "—";
                  const firmId = job.firms?.id ?? job.firm_id;
                  return (
                    <tr key={job.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/werkgevers/${firmId}`}
                          className="font-semibold text-gray-900 hover:text-brand-600"
                        >
                          {firmName}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        {job.slug ? (
                          <Link
                            href={`/vacature/${job.slug}`}
                            target="_blank"
                            className="font-medium text-gray-900 hover:text-brand-600"
                          >
                            {job.title}
                          </Link>
                        ) : (
                          <span className="font-medium text-gray-900">
                            {job.title}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {new Date(job.created_at).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_BADGE[status]}`}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <JobDeleteButton jobId={job.id} jobTitle={job.title} />
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
  );
}
