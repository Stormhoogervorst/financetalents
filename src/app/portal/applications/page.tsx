import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActingFirm } from "@/lib/impersonation";
import { Users, Mail, Phone, Building2, ChevronLeft, ChevronRight, Linkedin } from "lucide-react";
import { toPublicLinkedInProfileUrl } from "@/lib/linkedin-profile-url";
import { isLinkedInPlaceholderEmail } from "@/lib/applicant-email";
import DeleteApplicationButton from "@/components/portal/DeleteApplicationButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sollicitanten",
};

interface Props {
  searchParams: Promise<{ job?: string }>;
}

export default async function ApplicationsPage({ searchParams }: Props) {
  const { job: jobIdFilter } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { firm } = await getActingFirm<{ id: string; name: string }>(
    "id, name",
    user.id
  );

  if (!firm) redirect("/portal/profile");

  const admin = createAdminClient();

  let query = admin
    .from("applications")
    .select(`
      id,
      applicant_name,
      applicant_email,
      applicant_phone,
      linkedin_url,
      created_at,
      jobs ( id, title )
    `)
    .eq("firm_id", firm.id)
    .order("created_at", { ascending: false });

  if (jobIdFilter) {
    query = query.eq("job_id", jobIdFilter);
  }

  const { data: applications, error } = await query;

  if (error) {
    console.error("[portal/applications] Fetch error:", error.message);
  }

  // If filtering by job, fetch the job title for the heading
  let filteredJobTitle: string | null = null;
  if (jobIdFilter) {
    const { data: jobRow } = await admin
      .from("jobs")
      .select("title")
      .eq("id", jobIdFilter)
      .eq("firm_id", firm.id)
      .maybeSingle();
    filteredJobTitle = jobRow?.title ?? null;
  }

  const appList = (applications ?? []) as {
    id: string;
    applicant_name: string;
    applicant_email: string;
    applicant_phone: string | null;
    linkedin_url: string | null;
    created_at: string;
    jobs: { id: string; title: string } | { id: string; title: string }[] | null;
  }[];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        {jobIdFilter && (
          <Link
            href="/portal/applications"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-3 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Alle sollicitanten
          </Link>
        )}
        <h1 className="text-2xl font-bold text-black">
          {filteredJobTitle ? `Sollicitanten — ${filteredJobTitle}` : "Sollicitanten"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {appList.length === 0
            ? "Nog geen sollicitaties ontvangen"
            : `${appList.length} sollicitatie${appList.length !== 1 ? "s" : ""} ontvangen`}
        </p>
      </div>

      {appList.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-black mb-2">
            Nog geen sollicitaties
          </h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Zodra studenten solliciteren op je vacatures verschijnen ze hier.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3.5">
                    Naam
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    Contact
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    Vacature
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    LinkedIn
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    Datum
                  </th>
                  <th className="px-4 py-3.5 w-24 text-right">
                    <span className="sr-only">Acties</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appList.map((app) => {
                  const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
                  const linkedInHref = toPublicLinkedInProfileUrl(app.linkedin_url);
                  const hasRealEmail = !isLinkedInPlaceholderEmail(app.applicant_email);
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <Link
                          href={`/portal/applications/${app.id}`}
                          className="text-sm font-semibold text-black hover:text-primary transition-colors"
                        >
                          {app.applicant_name}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        {hasRealEmail ? (
                          <a
                            href={`mailto:${app.applicant_email}`}
                            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {app.applicant_email}
                          </a>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm italic text-gray-400">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            Geen e-mail (LinkedIn)
                          </span>
                        )}
                        {app.applicant_phone && (
                          <a
                            href={`tel:${app.applicant_phone}`}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mt-0.5"
                          >
                            <Phone className="h-3 w-3 shrink-0" />
                            {app.applicant_phone}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {job ? (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span className="text-sm text-gray-700">{job.title}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {linkedInHref ? (
                          <a
                            href={linkedInHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-1.5 text-[#0077b5] hover:text-[#005f8d] transition-colors"
                            aria-label={`LinkedIn profiel van ${app.applicant_name}`}
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(app.created_at).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-0.5">
                          <DeleteApplicationButton
                            applicationId={app.id}
                            applicantName={app.applicant_name}
                          />
                          <Link
                            href={`/portal/applications/${app.id}`}
                            className="p-1.5 rounded-md text-gray-300 group-hover:text-primary transition-colors inline-flex"
                            aria-label={`Bekijk sollicitatie van ${app.applicant_name}`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {appList.map((app) => {
              const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
              const linkedInHref = toPublicLinkedInProfileUrl(app.linkedin_url);
              const hasRealEmail = !isLinkedInPlaceholderEmail(app.applicant_email);
              return (
                <div
                  key={app.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/portal/applications/${app.id}`}
                        className="text-sm font-semibold text-black hover:text-primary transition-colors"
                      >
                        {app.applicant_name}
                      </Link>
                      {job && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {job.title}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1">
                      <DeleteApplicationButton
                        applicationId={app.id}
                        applicantName={app.applicant_name}
                      />
                      <Link
                        href={`/portal/applications/${app.id}`}
                        className="flex items-center gap-1 text-xs text-primary font-medium"
                      >
                        Bekijken
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {hasRealEmail ? (
                      <a
                        href={`mailto:${app.applicant_email}`}
                        className="flex items-center gap-1.5 text-sm text-primary"
                      >
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {app.applicant_email}
                      </a>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm italic text-gray-400">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        Geen e-mail (LinkedIn)
                      </span>
                    )}
                    {app.applicant_phone && (
                      <a
                        href={`tel:${app.applicant_phone}`}
                        className="flex items-center gap-1.5 text-xs text-gray-500"
                      >
                        <Phone className="h-3 w-3 shrink-0" />
                        {app.applicant_phone}
                      </a>
                    )}
                    {linkedInHref && (
                      <a
                        href={linkedInHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#0077b5] hover:text-[#005f8d] transition-colors"
                      >
                        <Linkedin className="h-3 w-3 shrink-0" />
                        LinkedIn profiel
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
