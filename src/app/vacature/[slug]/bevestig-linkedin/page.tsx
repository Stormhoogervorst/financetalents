import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import LinkedInConfirmForm from "@/components/LinkedInConfirmForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ job_id?: string }>;
}

export default async function ConfirmLinkedInPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { job_id: jobId } = await searchParams;

  if (!jobId) redirect(`/vacature/${slug}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/vacature/${slug}`);

  const meta = user.user_metadata ?? {};
  const fullName: string = meta.full_name ?? meta.name ?? "";
  const email: string = meta.email ?? user.email ?? "";

  const admin = createAdminClient();
  const { data: job } = await admin
    .from("jobs")
    .select("id, title, firms ( name )")
    .eq("id", jobId)
    .eq("status", "active")
    .maybeSingle();

  if (!job) redirect(`/vacature/${slug}`);

  const firm = Array.isArray(job.firms) ? job.firms[0] : job.firms;
  const firmName = (firm as { name: string } | null)?.name ?? "";

  const { data: existing } = await admin
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("applicant_email", email)
    .maybeSingle();

  if (existing) redirect(`/vacature/${slug}?error=already_applied`);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarPublic />

      <section
        className="flex-1"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(60px, 8vh, 120px)",
          paddingBottom: "clamp(80px, 10vh, 140px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <LinkedInConfirmForm
            jobId={jobId}
            jobSlug={slug}
            jobTitle={job.title}
            firmName={firmName}
            fullName={fullName}
            email={email}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
