import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, PlusCircle, Users, Eye, TrendingUp } from "lucide-react";
import { Vacancy } from "@/types";
import { cn, formatDate } from "@/lib/utils";

const statusColors = {
  open:   "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
  draft:  "bg-yellow-100 text-yellow-700",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "employer" && profile?.role !== "admin") {
    redirect("/");
  }

  const { data: vacancies } = await supabase
    .from("vacancies")
    .select("*")
    .eq("employer_id", user.id)
    .order("created_at", { ascending: false });

  const openCount = vacancies?.filter((v) => v.status === "open").length ?? 0;
  const draftCount = vacancies?.filter((v) => v.status === "draft").length ?? 0;
  const closedCount = vacancies?.filter((v) => v.status === "closed").length ?? 0;

  const { data: applicationStats } = await supabase
    .from("applications")
    .select("id, vacancy_id")
    .in("vacancy_id", vacancies?.map((v) => v.id) ?? []);

  const totalApplications = applicationStats?.length ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">{profile?.company_name}</p>
          </div>
          <Link href="/dashboard/vacancies/new" className="btn-primary">
            <PlusCircle className="h-4 w-4" /> Post vacancy
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Open vacancies", value: openCount, icon: Briefcase, color: "text-green-600 bg-green-50" },
            { label: "Draft vacancies", value: draftCount, icon: Eye, color: "text-yellow-600 bg-yellow-50" },
            { label: "Closed vacancies", value: closedCount, icon: TrendingUp, color: "text-gray-500 bg-gray-100" },
            { label: "Total applications", value: totalApplications, icon: Users, color: "text-brand-600 bg-brand-50" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Vacancy list */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Your Vacancies</h2>
          </div>

          {vacancies && vacancies.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {vacancies.map((v: Vacancy) => (
                <div key={v.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/vacancies/${v.id}`}
                      className="font-medium text-gray-900 hover:text-brand-600 truncate block"
                    >
                      {v.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">Posted {formatDate(v.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <ApplicationCount vacancyId={v.id} applications={applicationStats} />
                    <span className={cn("badge", statusColors[v.status])}>{v.status}</span>
                    <Link href={`/dashboard/vacancies/${v.id}`} className="btn-secondary text-xs py-1.5 px-3">
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="h-10 w-10 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No vacancies yet</p>
              <Link href="/dashboard/vacancies/new" className="btn-primary mt-4 text-sm">
                <PlusCircle className="h-4 w-4" /> Post your first vacancy
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationCount({
  vacancyId,
  applications,
}: {
  vacancyId: string;
  applications: { id: string; vacancy_id: string }[] | null;
}) {
  const count = applications?.filter((a) => a.vacancy_id === vacancyId).length ?? 0;
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <Users className="h-3.5 w-3.5" /> {count}
    </span>
  );
}
