import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import VacancyForm from "@/components/VacancyForm";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Application } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import ApplicationStatusSelect from "./ApplicationStatusSelect";

const appStatusColors: Record<string, string> = {
  pending:   "bg-yellow-50 text-yellow-700",
  reviewing: "bg-primary-light text-primary-dark",
  interview: "bg-purple-50 text-purple-700",
  rejected:  "bg-red-50 text-red-700",
  accepted:  "bg-green-50 text-green-700",
};

export default async function ManageVacancyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "employer" && profile?.role !== "admin") redirect("/");

  const { data: vacancy } = await supabase.from("vacancies").select("*").eq("id", id).single();
  if (!vacancy) notFound();
  if (vacancy.employer_id !== user.id && profile?.role !== "admin") redirect("/dashboard");

  const { data: applications } = await supabase
    .from("applications")
    .select("*, applicant:profiles(*)")
    .eq("vacancy_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit vacancy</h1>
          <VacancyForm employerId={user.id} companyName={vacancy.company_name} vacancy={vacancy} />
        </div>

        {/* Applications */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900">
              Applications ({applications?.length ?? 0})
            </h2>
          </div>

          {applications && applications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {applications.map((app: Application & { applicant: { full_name: string; email: string } }) => (
                <div key={app.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {app.applicant?.full_name ?? app.applicant?.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(app.created_at)}</p>
                      {app.cover_letter && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{app.cover_letter}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn("badge", appStatusColors[app.status])}>{app.status}</span>
                      <ApplicationStatusSelect applicationId={app.id} currentStatus={app.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-sm">No applications yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
