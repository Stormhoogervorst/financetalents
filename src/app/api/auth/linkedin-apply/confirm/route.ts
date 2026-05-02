import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResend } from "@/lib/resend";
import {
  sanitizeLinkedInProfileUrl,
  isValidLinkedInInUrl,
} from "@/lib/linkedin-profile-url";
import { verifyRecaptchaToken } from "@/lib/recaptcha/verify-server";
import { checkRateLimit, getRequestIp } from "@/lib/security/rate-limit";
import { SITE_URL } from "@/lib/site";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request.headers);
  const limit = await checkRateLimit(`linkedin-confirm:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het later opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ongeldige request." }, { status: 400 });
  }

  const jobId = (formData.get("jobId") as string | null)?.trim();
  const linkedinUrl = (formData.get("linkedinUrl") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim();
  const cvFile = formData.get("cv") as File | null;

  if (process.env.RECAPTCHA_SECRET_KEY) {
    const rawToken = formData.get("recaptchaToken");
    const token = typeof rawToken === "string" ? rawToken.trim() : "";
    const captcha = await verifyRecaptchaToken(token);
    if (!captcha.ok) {
      return NextResponse.json(
        { error: "reCAPTCHA-verificatie mislukt. Probeer opnieuw." },
        { status: 400 }
      );
    }
  }

  if (!jobId || !linkedinUrl || !phone) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }
  if (!cvFile || cvFile.size === 0) {
    return NextResponse.json({ error: "Upload je CV (PDF of Word, max 5 MB)." }, { status: 400 });
  }
  if (cvFile.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "CV is te groot. Maximum is 5 MB." }, { status: 400 });
  }

  const linkedinClean = sanitizeLinkedInProfileUrl(linkedinUrl);
  const phoneClean = phone;
  if (!isValidLinkedInInUrl(linkedinClean)) {
    return NextResponse.json(
      {
        error:
          "Voer een geldige LinkedIn-profiel-URL in (https://www.linkedin.com/in/…).",
      },
      { status: 400 }
    );
  }

  // 1. Authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const meta = user.user_metadata ?? {};
  const fullName: string = meta.full_name ?? meta.name ?? "Onbekend";
  const email: string = meta.email ?? user.email ?? "";
  const linkedinId: string | null = meta.provider_id ?? meta.sub ?? null;

  const admin = createAdminClient();

  // 2. Fetch job + firm
  const { data: job, error: jobError } = await admin
    .from("jobs")
    .select(`
      id, title, firm_id,
      firms ( name, notification_email, cc_emails )
    `)
    .eq("id", jobId)
    .eq("status", "active")
    .maybeSingle();

  if (jobError || !job) {
    return NextResponse.json(
      { error: "Vacature niet gevonden of niet meer actief." },
      { status: 404 }
    );
  }

  // 3. Duplicate check
  const { data: existing } = await admin
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("applicant_email", email)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Je hebt al gesolliciteerd op deze vacature." },
      { status: 409 }
    );
  }

  // 4. Upload CV to Supabase Storage (best-effort)
  const cvArrayBuffer = await cvFile.arrayBuffer();
  const cvBuffer = Buffer.from(cvArrayBuffer);
  const safeFileName = cvFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const cvFileName = `${job.firm_id}/${jobId}/${Date.now()}-${safeFileName}`;

  let cvStoragePath: string | null = null;
  try {
    const { data: uploadData, error: uploadError } = await admin.storage
      .from("cvs")
      .upload(cvFileName, cvBuffer, {
        contentType: cvFile.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) {
      console.error("[linkedin-apply/confirm] CV upload error:", uploadError);
    } else {
      cvStoragePath = uploadData?.path ?? null;
    }
  } catch (err) {
    console.error("[linkedin-apply/confirm] CV upload exception:", err);
  }

  // 5. Insert application with verified linkedin_url + cv path
  const { error: insertError } = await admin.from("applications").insert({
    job_id: jobId,
    firm_id: job.firm_id,
    applicant_name: fullName,
    applicant_email: email,
    applicant_phone: phoneClean,
    linkedin_id: linkedinId,
    linkedin_url: linkedinClean,
    cv_storage_path: cvStoragePath,
  });

  if (insertError) {
    console.error("[linkedin-apply/confirm] Insert error:", insertError.message);
    return NextResponse.json({ error: "Opslaan mislukt." }, { status: 500 });
  }

  // 6. Send emails (best-effort)
  const firm = Array.isArray(job.firms) ? job.firms[0] : job.firms;
  const firmName = (firm as { name: string } | null)?.name ?? "";
  const notificationEmail = (firm as { notification_email: string } | null)
    ?.notification_email;
  const ccEmailsRaw = (firm as { cc_emails: string[] | null } | null)
    ?.cc_emails;
  const ccEmails = Array.isArray(ccEmailsRaw)
    ? ccEmailsRaw
        .filter((e): e is string => typeof e === "string")
        .map((e) => e.trim())
        .filter((e) => e.length > 0)
    : [];

  const firstName = fullName.trim().split(/\s+/)[0] ?? "";

  try {
    const resend = createResend();
    const promises: Promise<unknown>[] = [];

    if (notificationEmail) {
      promises.push(
        resend.emails.send({
          from: "Legal Talents <noreply@legal-talents.nl>",
          to: notificationEmail,
          ...(ccEmails.length > 0 ? { cc: ccEmails } : {}),
          subject: `Nieuwe sollicitatie (LinkedIn): ${fullName} voor ${job.title}`,
          html: firmHtml({
            fullName,
            email,
            phone: phoneClean,
            linkedinUrl: linkedinClean,
            jobTitle: job.title,
            hasCv: cvStoragePath !== null,
          }),
          ...(cvBuffer.length > 0
            ? {
                attachments: [
                  {
                    filename: `CV-${fullName.replace(/\s+/g, "-")}.${safeFileName.split(".").pop() ?? "pdf"}`,
                    content: cvBuffer,
                  },
                ],
              }
            : {}),
        })
      );
    }

    if (email) {
      promises.push(
        resend.emails.send({
          from: "Legal Talents <noreply@legal-talents.nl>",
          to: email,
          subject: `Je sollicitatie bij ${firmName} is ontvangen`,
          html: studentHtml({ firstName, jobTitle: job.title, firmName }),
        })
      );
    }

    await Promise.allSettled(promises);
  } catch (err) {
    console.error("[linkedin-apply/confirm] Email error (non-fatal):", err);
  }

  console.log("[linkedin-apply/confirm] Saved:", fullName, "->", job.title);
  return NextResponse.json({ success: true });
}

// ── Email templates ─────────────────────────────────────────────────────────

function firmHtml(data: {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  jobTitle: string;
  hasCv: boolean;
}) {
  return `
<!DOCTYPE html>
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
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #4B5563; font-size: 14px;">E-mail</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px;"><a href="mailto:${data.email}" style="color: #587DFE;">${data.email}</a></td>
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
  ${data.hasCv ? `<p style="font-size: 13px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 16px;">
    CV is bijgevoegd als bijlage · Ontvangen via <a href="${SITE_URL}" style="color: #587DFE;">Legal Talents</a>
  </p>` : `<p style="font-size: 13px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 16px;">
    Ontvangen via <a href="${SITE_URL}" style="color: #587DFE;">Legal Talents</a>
  </p>`}
</body>
</html>`;
}

function studentHtml(data: {
  firstName: string;
  jobTitle: string;
  firmName: string;
}) {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; color: #0F0F0F; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #587DFE; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="color: white; font-size: 20px; font-weight: 800; font-style: italic; margin: 0;">Legal Talents.</p>
  </div>
  <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Je sollicitatie is ontvangen!</h2>
  <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
    Beste ${data.firstName},<br /><br />
    Je sollicitatie voor de functie <strong>${data.jobTitle}</strong> bij <strong>${data.firmName}</strong>
    is in goede orde ontvangen via LinkedIn.
  </p>
  <div style="background: #EEF1FF; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.6;">
      De werkgever neemt contact met je op als je profiel aansluit bij hun wensen.
      Houd je inbox (en spammap) in de gaten.
    </p>
  </div>
  <p style="font-size: 14px; color: #4B5563;">Succes!</p>
  <p style="font-size: 14px; font-weight: 700; color: #587DFE;">Het Legal Talents team</p>
  <p style="font-size: 13px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 16px; margin-top: 24px;">
    <a href="${SITE_URL}" style="color: #587DFE;">legal-talents.nl</a>
  </p>
</body>
</html>`;
}
