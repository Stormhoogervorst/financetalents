import Link from "next/link";
import { Building2, CheckCircle2, ChevronRight, Shield } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import DeleteEmployerButton from "./DeleteEmployerButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Werkgevers",
};

/**
 * Werkgeverslijst voor de Super Admin.
 *
 * De dashboard-pagina (/admin) toont ook een werkgevers-tabel, maar die
 * is daar de "kijker" naar de state van het platform als geheel. Deze
 * pagina is de dedicated lijst die vanuit de sidebar wordt geopend en
 * waar je vanaf doorklikt naar het detailscherm per werkgever.
 *
 * Houdt dezelfde datastroom aan als /admin: één fetch voor firms, één
 * voor jobs (voor live-counts per firm) en één voor applications (voor
 * sollicitatie-counts). Bij honderden werkgevers is dat nog ruim snel
 * genoeg; als dat groeit maken we er een RPC of materialized view van.
 */

type FirmRow = {
  id: string;
  name: string;
  slug: string | null;
  is_published: boolean | null;
  created_at: string;
};

type JobRow = {
  id: string;
  firm_id: string;
  status: "draft" | "active" | "closed" | null;
};

type ApplicationRow = {
  id: string;
  firm_id: string | null;
  job_id: string | null;
};

type PageProps = {
  searchParams?: Promise<{ deleted?: string }>;
};

export default async function AdminWerkgeversPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const deletedName = typeof sp.deleted === "string" ? sp.deleted : null;
  // Auth + admin-rol worden afgedwongen door (secure)/layout.tsx en
  // middleware.ts. We mogen direct met de service-role client praten.
  const admin = createAdminClient();

  const [firmsRes, jobsRes, applicationsRes] = await Promise.all([
    admin
      .from("firms")
      .select("id, name, slug, is_published, created_at")
      .order("created_at", { ascending: false }),
    admin.from("jobs").select("id, firm_id, status"),
    admin.from("applications").select("id, firm_id, job_id"),
  ]);

  const firms = (firmsRes.data ?? []) as FirmRow[];
  const jobs = (jobsRes.data ?? []) as JobRow[];
  const applications = (applicationsRes.data ?? []) as ApplicationRow[];

  // Live-jobs per firm.
  const liveJobsPerFirm = new Map<string, number>();
  for (const j of jobs) {
    if (j.status === "active") {
      liveJobsPerFirm.set(j.firm_id, (liveJobsPerFirm.get(j.firm_id) ?? 0) + 1);
    }
  }

  // Applications per firm: bij voorkeur via firm_id; legacy-rijen zonder
  // firm_id vallen terug op een lookup via job_id → firm_id.
  const jobIdToFirm = new Map<string, string>();
  for (const j of jobs) jobIdToFirm.set(j.id, j.firm_id);

  const applicationsPerFirm = new Map<string, number>();
  for (const a of applications) {
    const firmId = a.firm_id ?? (a.job_id ? jobIdToFirm.get(a.job_id) : undefined);
    if (!firmId) continue;
    applicationsPerFirm.set(firmId, (applicationsPerFirm.get(firmId) ?? 0) + 1);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200">
          <Shield className="h-3.5 w-3.5" />
          Super Admin
        </div>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Werkgevers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Alle geregistreerde werkgevers op het platform, nieuwste eerst.
        </p>
      </div>

      {deletedName && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>
            Werkgever{" "}
            <span className="font-semibold">{deletedName}</span> en alle
            gekoppelde data zijn verwijderd.
          </span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              {firms.length} werkgever{firms.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-xs text-gray-500">
              Klik op een werkgever om te beheren.
            </p>
          </div>
        </div>

        {firms.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            <Building2 className="mx-auto h-6 w-6 text-gray-300" />
            <p className="mt-2">Nog geen werkgevers geregistreerd.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Bedrijfsnaam
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Live vacatures
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Sollicitaties
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Aangemaakt
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {firms.map((firm) => {
                  const liveCount = liveJobsPerFirm.get(firm.id) ?? 0;
                  const applicationCount =
                    applicationsPerFirm.get(firm.id) ?? 0;
                  return (
                    <tr key={firm.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/werkgevers/${firm.id}`}
                          className="font-semibold text-gray-900 hover:text-brand-600"
                        >
                          {firm.name}
                        </Link>
                        {firm.slug && (
                          <div className="text-xs text-gray-400">
                            /{firm.slug}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          {liveCount}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        {applicationCount}
                      </td>
                      <td className="px-4 py-4">
                        {firm.is_published ? (
                          <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                            Gepubliceerd
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            Concept
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {new Date(firm.created_at).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <DeleteEmployerButton
                            employerId={firm.id}
                            employerName={firm.name}
                            variant="icon"
                          />
                          <Link
                            href={`/admin/werkgevers/${firm.id}`}
                            className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition"
                          >
                            Beheer
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
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
