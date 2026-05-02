import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActingFirm } from "@/lib/impersonation";
import { Briefcase, Users, Plus, AlertCircle, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

export default async function PortalDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { firm } = await getActingFirm<{
    id: string;
    name: string;
    is_published: boolean | null;
  }>("id, name, is_published", user.id);

  if (!firm) redirect("/portal/profile");

  // Use admin client for all data queries — applications has no SELECT RLS policy
  const admin = createAdminClient();

  // Active jobs count
  const { count: activeJobsCount } = await admin
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("firm_id", firm.id)
    .eq("status", "active");

  // Applications this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: applicationsCount } = await admin
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("firm_id", firm.id)
    .gte("created_at", startOfMonth.toISOString());

  // Recent applications — jobs(title) join requires job_id column to exist
  const { data: recentApplications, error: recentError } = await admin
    .from("applications")
    .select(`
      id,
      applicant_name,
      created_at,
      jobs ( title )
    `)
    .eq("firm_id", firm.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (recentError) {
    console.error("[portal/dashboard] Recent applications error (schema fix needed):", recentError.message);
  }

  const profileComplete = firm.is_published;

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black">
            Welkom terug{firm.name ? `, ${firm.name}` : ""}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Hier is een overzicht van je activiteit
          </p>
        </div>
        <Link
          href="/portal/jobs/new"
          className="hidden sm:flex btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nieuwe vacature
        </Link>
      </div>

      {/* Profile incomplete banner */}
      {!profileComplete && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">
              Je profiel is nog niet gepubliceerd
            </p>
            <p className="text-sm text-yellow-700 mt-0.5">
              Vul je werkgeversprofiel volledig in zodat studenten je kunnen vinden.
            </p>
          </div>
          <Link
            href="/portal/profile"
            className="shrink-0 text-sm font-semibold text-yellow-700 hover:text-yellow-900 flex items-center gap-1"
          >
            Profiel aanvullen
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-500">Actieve vacatures</p>
          </div>
          <p className="text-3xl font-bold text-black">{activeJobsCount ?? 0}</p>
          <Link
            href="/portal/jobs"
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            Beheer vacatures <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-gray-500">Sollicitaties deze maand</p>
          </div>
          <p className="text-3xl font-bold text-black">{applicationsCount ?? 0}</p>
          <Link
            href="/portal/applications"
            className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            Bekijk sollicitaties <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent applications */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-black">Recente sollicitaties</h2>
        </div>

        {recentApplications && recentApplications.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {recentApplications.map((app) => {
              const jobTitle = Array.isArray(app.jobs)
                ? app.jobs[0]?.title
                : (app.jobs as { title: string } | null)?.title;
              return (
                <li key={app.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-black">{app.applicant_name}</p>
                    {jobTitle && (
                      <p className="text-xs text-gray-400 mt-0.5">{jobTitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(app.created_at).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">Nog geen sollicitaties ontvangen.</p>
            {(activeJobsCount ?? 0) === 0 && (
              <Link
                href="/portal/jobs/new"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                <Plus className="h-4 w-4" />
                Maak je eerste vacature aan
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Mobile CTA */}
      <div className="mt-6 sm:hidden">
        <Link
          href="/portal/jobs/new"
          className="btn-primary w-full"
        >
          <Plus className="h-4 w-4" />
          Nieuwe vacature plaatsen
        </Link>
      </div>
    </div>
  );
}
