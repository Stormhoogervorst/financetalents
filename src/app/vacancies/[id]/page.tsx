import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import ApplyButton from "./ApplyButton";
import { notFound } from "next/navigation";
import { MapPin, Clock, Wifi, DollarSign, Calendar, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { employmentTypeLabels, experienceLevelLabels, formatDate, formatSalary } from "@/lib/utils";
import { EmploymentType, ExperienceLevel } from "@/types";

export default async function VacancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: vacancy } = await supabase
    .from("vacancies")
    .select("*")
    .eq("id", id)
    .single();

  if (!vacancy || vacancy.status === "draft") notFound();

  const { data: { user } } = await supabase.auth.getUser();

  let existingApplication = null;
  if (user) {
    const { data } = await supabase
      .from("applications")
      .select("id, status")
      .eq("vacancy_id", id)
      .eq("applicant_id", user.id)
      .single();
    existingApplication = data;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Link href="/vacancies" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft className="h-4 w-4" /> Back to vacancies
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl uppercase flex-shrink-0 overflow-hidden">
                  {vacancy.company_logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={vacancy.company_logo_url} alt={`${vacancy.company_name} logo`} className="w-full h-full object-cover" />
                  ) : (
                    vacancy.company_name[0]
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{vacancy.title}</h1>
                  <p className="text-gray-500 flex items-center gap-1.5 mt-1">
                    <Building2 className="h-4 w-4" /> {vacancy.company_name}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {vacancy.location}{vacancy.remote && " · Remote"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                  {employmentTypeLabels[vacancy.employment_type as EmploymentType]}
                </span>
                <span className="flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  {formatSalary(vacancy.salary_min, vacancy.salary_max, vacancy.salary_currency)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Posted {formatDate(vacancy.created_at)}
                </span>
                {vacancy.remote && (
                  <span className="flex items-center gap-1.5 text-purple-600">
                    <Wifi className="h-4 w-4" /> Remote
                  </span>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {vacancy.description}
              </div>
            </div>

            {vacancy.requirements && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {vacancy.requirements}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-24">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="badge bg-brand-50 text-brand-700 px-3 py-1 text-sm">
                  {experienceLevelLabels[vacancy.experience_level as ExperienceLevel]}
                </span>
                {vacancy.remote && (
                  <span className="badge bg-purple-50 text-purple-700 px-3 py-1 text-sm flex items-center gap-1">
                    <Wifi className="h-3.5 w-3.5" /> Remote
                  </span>
                )}
              </div>

              <ApplyButton
                vacancyId={vacancy.id}
                vacancyStatus={vacancy.status}
                userId={user?.id ?? null}
                existingApplication={existingApplication}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
