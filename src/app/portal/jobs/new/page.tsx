import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActingFirm } from "@/lib/impersonation";
import { ChevronLeft, Shield } from "lucide-react";
import JobForm from "@/components/JobForm";

type Props = {
  searchParams: Promise<{ asEmployer?: string }>;
};

export default async function NewJobPage({ searchParams }: Props) {
  const { asEmployer } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // ── "Plaats job namens dit bedrijf" (admin-flow) ───────────────────
  // Wanneer een admin via de knop op de company-detailpagina hier komt,
  // wordt `?asEmployer=<firmId>` meegegeven. We verifiëren de admin-rol én
  // het bestaan van de firm voordat we het formulier renderen.
  if (asEmployer) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      redirect("/?error=unauthorized");
    }

    const admin = createAdminClient();
    const { data: targetFirm } = await admin
      .from("firms")
      .select("id, slug, name")
      .eq("id", asEmployer)
      .maybeSingle();

    if (!targetFirm) {
      redirect("/admin");
    }

    return (
      <div className="max-w-2xl">
        <Link
          href={`/admin/companies/${targetFirm.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to company
        </Link>

        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-inset ring-red-200">
          <Shield className="h-3 w-3" />
          Super Admin · on behalf of company
        </div>

        <h1 className="text-2xl font-bold text-black">New job</h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          You are posting this job on behalf of{" "}
          <strong className="text-black">{targetFirm.name}</strong>. The job
          will be marked as <em>posted by admin</em>.
        </p>

        <JobForm
          firmId={targetFirm.id}
          firmSlug={targetFirm.slug ?? ""}
          postedByAdmin
          firmName={targetFirm.name}
          returnTo={`/admin/companies/${targetFirm.id}`}
        />
      </div>
    );
  }

  // ── Default company flow ──────────────────────────────────────────
  const { firm } = await getActingFirm<{ id: string; slug: string | null }>(
    "id, slug",
    user.id
  );

  if (!firm) redirect("/portal/profile");

  return (
    <div className="max-w-2xl">
      <Link
        href="/portal/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      <h1 className="text-2xl font-bold text-black mb-8">New job</h1>

      <JobForm firmId={firm.id} firmSlug={firm.slug ?? ""} />
    </div>
  );
}
