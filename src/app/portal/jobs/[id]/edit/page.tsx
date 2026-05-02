import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActingFirm } from "@/lib/impersonation";
import { ChevronLeft } from "lucide-react";
import JobForm from "@/components/JobForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditJobPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { firm, isImpersonating } = await getActingFirm<{
    id: string;
    slug: string | null;
  }>("id, slug", user.id);

  if (!firm) redirect("/portal/profile");

  // Tijdens impersonatie leest de admin-sessie een firm die hij niet zelf
  // bezit — RLS op `jobs` staat dat lezen niet toe. Vallen we terug op de
  // service-role client (de admin-check is al gedaan in getActingFirm).
  const db = isImpersonating ? createAdminClient() : supabase;

  const { data: job } = await db
    .from("jobs")
    .select(
      "id, title, slug, location, type, practice_area, description, salary_indication, start_date, required_education, hours_per_week, expires_at, status"
    )
    .eq("id", id)
    .eq("firm_id", firm.id)
    .maybeSingle();

  if (!job) notFound();

  // HTML <input type="date"> verwacht YYYY-MM-DD. `expires_at` komt uit
  // Postgres als timestamptz ISO string ("2026-06-20T10:15:00+00:00");
  // we strippen naar de date-portion zodat het veld correct pre-fills.
  const expiresAtDate = job.expires_at
    ? new Date(job.expires_at).toISOString().slice(0, 10)
    : null;

  return (
    <div className="max-w-2xl">
      {/* Back link */}
      <Link
        href="/portal/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Terug naar vacatures
      </Link>

      <h1 className="text-2xl font-bold text-black mb-2">Vacature bewerken</h1>
      <p className="text-sm text-gray-500 mb-8">{job.title}</p>

      <JobForm
        firmId={firm.id}
        firmSlug={firm.slug ?? ""}
        job={{
          id: job.id,
          title: job.title,
          location: job.location,
          type: job.type,
          practice_area: job.practice_area,
          description: job.description,
          salary_indication: job.salary_indication,
          start_date: job.start_date,
          required_education: job.required_education,
          hours_per_week: job.hours_per_week,
          expires_at: expiresAtDate,
          status: job.status,
        }}
      />
    </div>
  );
}
