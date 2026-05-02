import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActingFirm } from "@/lib/impersonation";
import {
  ChevronLeft,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Calendar,
  Download,
  FileText,
  MessageSquare,
  Linkedin,
} from "lucide-react";
import { toPublicLinkedInProfileUrl } from "@/lib/linkedin-profile-url";
import { isLinkedInPlaceholderEmail } from "@/lib/applicant-email";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { firm } = await getActingFirm<{ id: string }>("id", user.id);

  if (!firm) redirect("/portal/profile");

  const admin = createAdminClient();

  // Fetch the application — security: must belong to this firm
  const { data: app } = await admin
    .from("applications")
    .select(`
      id,
      applicant_name,
      applicant_email,
      applicant_phone,
      university,
      study_field,
      motivation,
      cv_storage_path,
      linkedin_url,
      created_at,
      jobs ( id, title, slug )
    `)
    .eq("id", id)
    .eq("firm_id", firm.id)
    .maybeSingle();

  if (!app) notFound();

  const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
  const linkedInHref = toPublicLinkedInProfileUrl(app.linkedin_url);
  const hasRealEmail = !isLinkedInPlaceholderEmail(app.applicant_email);

  // Generate a signed URL for the CV (valid for 1 hour)
  let cvSignedUrl: string | null = null;
  if (app.cv_storage_path) {
    const { data: signed } = await admin.storage
      .from("cvs")
      .createSignedUrl(app.cv_storage_path, 3600);
    cvSignedUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="max-w-3xl">
      {/* Back link */}
      <Link
        href="/portal/applications"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Terug naar sollicitanten
      </Link>

      {/* Header card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-black">{app.applicant_name}</h1>
            {job && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 shrink-0" />
                Sollicitatie voor{" "}
                <span className="font-medium text-gray-700">{job.title}</span>
              </p>
            )}
          </div>
          <span className="text-xs text-gray-400 flex items-center gap-1.5 shrink-0 mt-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(app.created_at).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {/* Contact */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Contactgegevens
          </h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              {hasRealEmail ? (
                <a
                  href={`mailto:${app.applicant_email}`}
                  className="text-sm text-primary hover:underline break-all"
                >
                  {app.applicant_email}
                </a>
              ) : (
                <span className="text-sm italic text-gray-400">
                  Geen e-mailadres gedeeld (LinkedIn)
                </span>
              )}
            </li>
            {app.applicant_phone && (
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <a
                  href={`tel:${app.applicant_phone}`}
                  className="text-sm text-gray-700 hover:text-primary"
                >
                  {app.applicant_phone}
                </a>
              </li>
            )}
            {linkedInHref && (
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0077b5]/10 rounded-lg flex items-center justify-center shrink-0">
                  <Linkedin className="h-4 w-4 text-[#0077b5]" />
                </div>
                <a
                  href={linkedInHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#0077b5] hover:underline"
                >
                  LinkedIn profiel
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Opleiding */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Opleiding
          </h2>
          {app.study_field || app.university ? (
            <ul className="space-y-3">
              {app.study_field && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                    <GraduationCap className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-gray-700">{app.study_field}</span>
                </li>
              )}
              {app.university && (
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-700">{app.university}</span>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Niet opgegeven</p>
          )}
        </div>
      </div>

      {/* CV download */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          Curriculum Vitae
        </h2>
        {cvSignedUrl ? (
          <a
            href={cvSignedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Download className="h-4 w-4" />
            CV downloaden (PDF)
          </a>
        ) : (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FileText className="h-4 w-4" />
            Geen CV beschikbaar
          </div>
        )}
      </div>

      {/* Motivatie */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5" />
          Motivatie
        </h2>
        {app.motivation ? (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {app.motivation}
          </p>
        ) : (
          <p className="text-sm text-gray-400">Geen motivatie opgegeven</p>
        )}
      </div>
    </div>
  );
}
