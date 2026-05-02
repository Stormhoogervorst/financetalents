import Link from "next/link";
import {
  Building2,
  Briefcase,
  FileText,
  Eye,
  Shield,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  GrowthChart,
  TopJobsChart,
  type GrowthPoint,
  type TopJobPoint,
} from "./DashboardCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Super Admin",
};

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
  title: string | null;
  slug: string | null;
  status: "draft" | "active" | "closed" | null;
  views: number | null;
  created_at: string;
};

type ApplicationRow = {
  id: string;
  firm_id: string | null;
  job_id: string | null;
  created_at: string;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

const MONTHS_NL = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

function toDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildLast30Days(
  firms: FirmRow[],
  jobs: JobRow[],
): GrowthPoint[] {
  const firmCounts = new Map<string, number>();
  for (const f of firms) {
    const key = toDayKey(new Date(f.created_at));
    firmCounts.set(key, (firmCounts.get(key) ?? 0) + 1);
  }
  const jobCounts = new Map<string, number>();
  for (const j of jobs) {
    const key = toDayKey(new Date(j.created_at));
    jobCounts.set(key, (jobCounts.get(key) ?? 0) + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const points: GrowthPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toDayKey(d);
    points.push({
      date: key,
      label: `${d.getDate()} ${MONTHS_NL[d.getMonth()]}`,
      firms: firmCounts.get(key) ?? 0,
      jobs: jobCounts.get(key) ?? 0,
    });
  }
  return points;
}

function countFirmsInPeriod(
  firms: FirmRow[],
  start: Date,
  end: Date,
): number {
  return firms.filter((f) => {
    const t = new Date(f.created_at).getTime();
    return t >= start.getTime() && t < end.getTime();
  }).length;
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  // Auth + admin-rol worden afgedwongen door (secure)/layout.tsx en
  // middleware.ts. Hier mogen we direct met de service-role client praten.
  const admin = createAdminClient();

  const [firmsRes, jobsRes, applicationsRes] = await Promise.all([
    admin
      .from("firms")
      .select("id, name, slug, is_published, created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("jobs")
      .select("id, firm_id, title, slug, status, views, created_at"),
    admin.from("applications").select("id, firm_id, job_id, created_at"),
  ]);

  const firms = (firmsRes.data ?? []) as FirmRow[];
  const jobs = (jobsRes.data ?? []) as JobRow[];
  const applications = (applicationsRes.data ?? []) as ApplicationRow[];

  // ── Aggregaties per firm ──────────────────────────────────────────────────
  const liveJobsPerFirm = new Map<string, number>();
  for (const j of jobs) {
    if (j.status === "active") {
      liveJobsPerFirm.set(j.firm_id, (liveJobsPerFirm.get(j.firm_id) ?? 0) + 1);
    }
  }

  const jobIdToFirm = new Map<string, string>();
  for (const j of jobs) jobIdToFirm.set(j.id, j.firm_id);

  const applicationsPerFirm = new Map<string, number>();
  for (const a of applications) {
    const firmId =
      a.firm_id ?? (a.job_id ? jobIdToFirm.get(a.job_id) : undefined);
    if (!firmId) continue;
    applicationsPerFirm.set(firmId, (applicationsPerFirm.get(firmId) ?? 0) + 1);
  }

  // ── KPI's ─────────────────────────────────────────────────────────────────
  const totalFirms = firms.length;
  const totalLiveJobs = jobs.filter((j) => j.status === "active").length;
  const totalApplications = applications.length;
  const totalViews = jobs.reduce((sum, j) => sum + (j.views ?? 0), 0);

  // Groei t.o.v. vorige kalendermaand (werkgevers)
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const firmsThisMonth = countFirmsInPeriod(firms, startOfThisMonth, now);
  const firmsLastMonth = countFirmsInPeriod(
    firms,
    startOfLastMonth,
    startOfThisMonth,
  );
  const firmsGrowth = pctChange(firmsThisMonth, firmsLastMonth);

  // ── Grafiekdata ───────────────────────────────────────────────────────────
  const growthSeries = buildLast30Days(firms, jobs);

  const topJobs: TopJobPoint[] = [...jobs]
    .filter((j) => (j.views ?? 0) > 0 && j.title)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5)
    .map((j) => ({
      name: (j.title ?? "").length > 34
        ? `${(j.title ?? "").slice(0, 32)}…`
        : (j.title ?? ""),
      views: j.views ?? 0,
    }));

  const kpis = [
    {
      label: "Totaal werkgevers",
      value: totalFirms,
      icon: Building2,
      accent: "bg-brand-50 text-brand-700",
      growth: firmsGrowth,
      growthLabel:
        firmsGrowth === null
          ? `+${firmsThisMonth} deze maand`
          : "t.o.v. vorige maand",
    },
    {
      label: "Live vacatures",
      value: totalLiveJobs,
      icon: Briefcase,
      accent: "bg-green-50 text-green-700",
    },
    {
      label: "Totaal sollicitaties",
      value: totalApplications,
      icon: FileText,
      accent: "bg-orange-50 text-orange-700",
    },
    {
      label: "Totaal weergaven",
      value: totalViews,
      icon: Eye,
      accent: "bg-purple-50 text-purple-700",
    },
  ];

  const numberFmt = new Intl.NumberFormat("nl-NL");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200">
            <Shield className="h-3.5 w-3.5" />
            Super Admin
          </div>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            Super Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            KPI&apos;s, groei en de top best bekeken vacatures — in één oogopslag.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, accent, growth, growthLabel }) => {
          const hasGrowth = typeof growth === "number";
          const up = hasGrowth && growth! >= 0;
          return (
            <div
              key={label}
              className="rounded-2xl bg-white p-6 ring-1 ring-gray-200 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {hasGrowth ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      up
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {up ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(growth!).toFixed(0)}%
                  </span>
                ) : growthLabel ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                    {growthLabel}
                  </span>
                ) : null}
              </div>
              <div className="mt-5">
                <div className="text-3xl font-bold leading-none text-gray-900">
                  {numberFmt.format(value)}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-500">
                  {label}
                </div>
                {hasGrowth && growthLabel && (
                  <div className="mt-1 text-xs text-gray-400">{growthLabel}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Platform groei */}
        <div className="xl:col-span-2 rounded-2xl bg-white p-6 ring-1 ring-gray-200 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Platform groei
                </h2>
                <p className="text-xs text-gray-500">
                  Nieuwe werkgevers &amp; vacatures — laatste 30 dagen
                </p>
              </div>
            </div>
          </div>
          <GrowthChart data={growthSeries} />
        </div>

        {/* Top 5 vacatures */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-gray-200 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Top 5 best bekeken vacatures
                </h2>
                <p className="text-xs text-gray-500">
                  Totaal aantal weergaven
                </p>
              </div>
            </div>
          </div>
          <TopJobsChart data={topJobs} />
        </div>
      </div>

      {/* Firms table — compact, onder de grafieken */}
      <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Werkgevers</h2>
            <p className="text-xs text-gray-500">
              {firms.length} bedrijven — nieuwste eerst
            </p>
          </div>
          <Link
            href="/admin/werkgevers"
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            Alles bekijken
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {firms.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">
            Nog geen werkgevers geregistreerd.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Bedrijfsnaam
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Live
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Sollicitaties
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Aangemaakt
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {firms.slice(0, 8).map((firm) => {
                  const liveCount = liveJobsPerFirm.get(firm.id) ?? 0;
                  const applicationCount =
                    applicationsPerFirm.get(firm.id) ?? 0;
                  return (
                    <tr key={firm.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-2.5">
                        <Link
                          href={`/admin/werkgevers/${firm.id}`}
                          className="font-semibold text-gray-900 hover:text-brand-600"
                        >
                          {firm.name}
                        </Link>
                        {firm.slug && (
                          <div className="text-[11px] text-gray-400">
                            /{firm.slug}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          {liveCount}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-gray-900">
                        {applicationCount}
                      </td>
                      <td className="px-3 py-2.5">
                        {firm.is_published ? (
                          <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                            Gepubliceerd
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                            Concept
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-500">
                        {new Date(firm.created_at).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Link
                          href={`/admin/werkgevers/${firm.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-gray-700 transition"
                        >
                          Beheer
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {firms.length > 8 && (
              <div className="border-t border-gray-100 px-5 py-3 text-center">
                <Link
                  href="/admin/werkgevers"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Bekijk alle {firms.length} werkgevers
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
