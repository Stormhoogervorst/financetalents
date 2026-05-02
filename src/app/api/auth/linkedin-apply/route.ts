import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const jobId = searchParams.get("job_id");
  const slug = searchParams.get("slug");

  const base = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const jobPage = `${base}/vacature/${slug || ""}`;

  if (!code || !jobId || !slug) {
    return NextResponse.redirect(`${jobPage}?error=missing_params`);
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error("[linkedin-apply] Code exchange failed:", exchangeError.message);
    return NextResponse.redirect(`${jobPage}?error=auth_failed`);
  }

  return NextResponse.redirect(
    `${base}/vacature/${slug}/bevestig-linkedin?job_id=${encodeURIComponent(jobId)}`
  );
}
