import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResend } from "@/lib/resend";
import {
  sanitizeLinkedInProfileUrl,
  isValidLinkedInInUrl,
} from "@/lib/linkedin-profile-url";
import { checkRateLimit, getRequestIp } from "@/lib/security/rate-limit";
import { SITE_URL } from "@/lib/site";

export async function POST(request: NextRequest) {
  console.log("[linkedin-apply/auto] POST received");
  const ip = getRequestIp(request.headers);
  const limit = await checkRateLimit(`linkedin-auto:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het later opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let body: {
    jobId?: string;
    firstName?: string;
    lastName?: string;
    linkedinUrl?: string;
    phone?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige request." }, { status: 400 });
  }

  const jobId = body.jobId?.trim();
  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const rawLinkedinUrl = body.linkedinUrl?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";

  if (!jobId) {
    return NextResponse.json(
      { error: "jobId is verplicht." },
      { status: 400 },
    );
  }
  if (!firstName || !lastName || !phone || !rawLinkedinUrl) {
    return NextResponse.json(
      { error: "Vul alle velden in." },
      { status: 400 },
    );
  }

  const cleanLinkedinUrl = sanitizeLinkedInProfileUrl(rawLinkedinUrl.split("?")[0]);
  if (!isValidLinkedInInUrl(cleanLinkedinUrl)) {
    return NextResponse.json(
      {
        error:
          "Voer een geldige LinkedIn-profiel-URL in (https://www.linkedin.com/in/…).",
      },
      { status: 400 },
    );
  }

  // applicant_email is NOT NULL in the DB, but this anonymous flow doesn't
  // collect an email. Derive a stable placeholder from the LinkedIn slug so
  // duplicate detection keeps working and the column is satisfied.
  const linkedinSlug =
    cleanLinkedinUrl.split("/in/")[1]?.replace(/\/+$/, "") ?? "";
  const placeholderEmail = `linkedin+${linkedinSlug}@legal-talents.nl`;
  const fullName = `${firstName} ${lastName}`.trim();

  const admin = createAdminClient();

  // Fetch job + firm
  const { data: job, error: jobError } = await admin
    .from("jobs")
    .select(`id, title, firm_id, firms ( name, notification_email, cc_emails )`)
    .eq("id", jobId)
    .eq("status", "active")
    .maybeSingle();

  if (jobError || !job) {
    console.log("[linkedin-apply/auto] Job not found:", jobId, jobError);
    return NextResponse.json(
      { error: "Vacature niet gevonden of niet meer actief." },
      { status: 404 },
    );
  }

  // Duplicate check by LinkedIn URL (primary) OR placeholder email.
  const { data: existing } = await admin
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .or(
      `linkedin_url.eq.${cleanLinkedinUrl},applicant_email.eq.${placeholderEmail}`,
    )
    .maybeSingle();

  if (existing) {
    console.log("[linkedin-apply/auto] Duplicate — already applied");
    return NextResponse.json(
      { error: "Je hebt al gesolliciteerd op deze vacature." },
      { status: 409 },
    );
  }

  const { error: insertError } = await admin.from("applications").insert({
    job_id: jobId,
    firm_id: job.firm_id,
    applicant_name: fullName,
    applicant_email: placeholderEmail,
    applicant_phone: phone,
    linkedin_url: cleanLinkedinUrl,
  });

  if (insertError) {
    console.error(
      "[linkedin-apply/auto] Insert error:",
      insertError.message,
      insertError.code,
    );
    return NextResponse.json(
      { error: "Opslaan mislukt. Probeer het opnieuw." },
      { status: 500 },
    );
  }

  // Notify the firm (best-effort). No student confirmation email — we don't
  // collect an email address in this flow.
  const firm = Array.isArray(job.firms) ? job.firms[0] : job.firms;
  const notificationEmail = (
    firm as { notification_email: string } | null
  )?.notification_email;
  const ccEmailsRaw = (firm as { cc_emails: string[] | null } | null)
    ?.cc_emails;
  const ccEmails = Array.isArray(ccEmailsRaw)
    ? ccEmailsRaw
        .filter((e): e is string => typeof e === "string")
        .map((e) => e.trim())
        .filter((e) => e.length > 0)
    : [];

  if (notificationEmail) {
    try {
      const resend = createResend();
      await resend.emails.send({
        from: "Legal Talents <noreply@legal-talents.nl>",
        to: notificationEmail,
        ...(ccEmails.length > 0 ? { cc: ccEmails } : {}),
        subject: `Nieuwe sollicitatie (LinkedIn): ${fullName} voor ${job.title}`,
        html: firmEmailHtml({
          fullName,
          phone,
          linkedinUrl: cleanLinkedinUrl,
          jobTitle: job.title,
        }),
      });
    } catch (err) {
      console.error("[linkedin-apply/auto] Email error (non-fatal):", err);
    }
  }

  return NextResponse.json({ success: true });
}

// ── Email templates ──────────────────────────────────────────────────────────

function firmEmailHtml(data: {
  fullName: string;
  phone: string;
  linkedinUrl: string;
  jobTitle: string;
}) {
  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; color: #0F0F0F; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #587DFE; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="color: white; font-size: 20px; font-weight: 800; font-style: italic; margin: 0;">Legal Talents.</p>
  </div>
  <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">Nieuwe sollicitatie via LinkedIn</h2>
  <p style="color: #4B5563; margin-bottom: 24px;">Voor de functie <strong>${data.jobTitle}</strong></p>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #4B5563; font-size: 14px; width: 40%;">Naam</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px; font-weight: 600;">${data.fullName}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #4B5563; font-size: 14px;">Telefoon</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px;">${data.phone}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; color: #4B5563; font-size: 14px;">LinkedIn</td>
      <td style="padding: 10px 0; font-size: 14px;"><a href="${data.linkedinUrl}" style="color: #587DFE;">${data.linkedinUrl}</a></td>
    </tr>
  </table>
  <p style="font-size: 13px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 16px;">
    Gesolliciteerd via LinkedIn · <a href="${SITE_URL}" style="color: #587DFE;">Legal Talents</a>
  </p>
</body>
</html>`;
}
