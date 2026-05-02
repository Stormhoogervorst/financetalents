import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActingFirm } from "@/lib/impersonation";
import { Plus, Briefcase } from "lucide-react";
import JobActions from "./JobActions";
import JobStatusToggle from "./JobStatusToggle";

// Always fetch fresh data — no caching for authenticated portal pages
export const dynamic = "force-dynamic";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function JobsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Step 1: fetch firm for this user (inclusief impersonatie-overlay).
  const { firm } = await getActingFirm<{ id: string; slug: string | null }>(
    "id, slug",
    user.id
  );

  if (!firm) redirect("/portal/profile");

  // Step 2: fetch jobs via admin client so RLS on the applications
  // sub-table never blocks the count. Auth is already verified above.
  const admin = createAdminClient();

  const { data: jobs, error: jobsError } = await admin
    .from("jobs")
    .select(`
      id,
      title,
      slug,
      location,
      type,
      practice_area,
      description,
      salary_indication,
      start_date,
      required_education,
      hours_per_week,
      status,
      created_at,
      firm_id
    `)
    .eq("firm_id", firm.id)
    .order("created_at", { ascending: false });

  if (jobsError) {
    console.error("[portal/jobs] Jobs fetch error (firm_id:", firm.id, "):", jobsError);
  }
  console.log("[portal/jobs] Jobs found:", jobs?.length ?? 0);

  // Step 3: fetch application counts per job separately
  const jobIds = (jobs ?? []).map((j) => j.id);
  const countMap: Record<string, number> = {};

  if (jobIds.length > 0) {
    const { data: counts, error: countsError } = await admin
      .from("applications")
      .select("job_id")
      .in("job_id", jobIds);

    if (countsError) {
      // Non-fatal: job_id column may not exist yet in the DB schema.
      // Run: ALTER TABLE applications ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES jobs(id) ON DELETE CASCADE;
      console.error("[portal/jobs] Application counts error (schema fix needed):", countsError.message);
    }

    for (const row of (counts ?? []) as { job_id: string }[]) {
      if (row.job_id) countMap[row.job_id] = (countMap[row.job_id] ?? 0) + 1;
    }
  }

  const jobList = (jobs ?? []).map((j) => ({
    ...j,
    firm_slug: firm.slug,
    applicationCount: countMap[j.id] ?? 0,
  }));

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black">Vacatures</h1>
          <p className="text-sm text-gray-500 mt-1">
            {jobList.length === 0
              ? "Nog geen vacatures aangemaakt"
              : `${jobList.length} vacature${jobList.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/portal/jobs/new"
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nieuwe vacature
        </Link>
      </div>

      {/* Empty state */}
      {jobList.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
            <Briefcase className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-black mb-2">
            Nog geen vacatures
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Maak je eerste vacature aan en bereik studenten rechtstreeks via Legal Talents.
          </p>
          <Link
            href="/portal/jobs/new"
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Nieuwe vacature
          </Link>
        </div>
      ) : (
        /* Table */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3.5">
                    Titel
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    Aangemaakt op
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    Sollicitaties
                  </th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobList.map((job) => (
                  <tr
                    key={job.id}
                    className={`transition-colors ${
                      job.status === "draft" ? "bg-orange-50/50 hover:bg-orange-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          href={`/portal/jobs/${job.id}/edit`}
                          className="text-sm font-semibold text-black hover:text-primary hover:underline transition-colors"
                        >
                          {job.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">{job.location}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <JobStatusToggle jobId={job.id} initialStatus={job.status} />
                        {job.status === "draft" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            Concept
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-black">
                        {job.applicationCount}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <JobActions job={job} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-gray-100">
            {jobList.map((job) => (
              <div
                key={job.id}
                className={`px-4 py-4 flex items-start justify-between gap-3 ${
                  job.status === "draft" ? "bg-orange-50/50" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/portal/jobs/${job.id}/edit`}
                    className="text-sm font-semibold text-black hover:text-primary hover:underline transition-colors truncate block"
                  >
                    {job.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{job.location}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <JobStatusToggle jobId={job.id} initialStatus={job.status} />
                    {job.status === "draft" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                        Concept
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {job.applicationCount} sollicitatie{job.applicationCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <JobActions job={job} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
