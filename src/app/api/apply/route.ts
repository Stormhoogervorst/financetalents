import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createResend } from "@/lib/resend";
import {
  sanitizeLinkedInProfileUrl,
  isValidLinkedInInUrl,
} from "@/lib/linkedin-profile-url";
import { verifyRecaptchaToken } from "@/lib/recaptcha/verify-server";
import { checkRateLimit, getRequestIp } from "@/lib/security/rate-limit";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

// ── Email templates ────────────────────────────────────────────────────────

function firmEmailHtml(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  studyField: string;
  motivation: string;
  jobTitle: string;
  firmName: string;
  linkedInUrl: string | null;
}) {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; color: #0F0F0F; max-width: 600px; margin: 0 auto; padding: 24px;">
  <div style="background: #587DFE; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <p style="color: white; font-size: 20px; font-weight: 800; font-style: italic; margin: 0;">Legal Talents.</p>
  </div>

  <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">
    Nieuwe sollicitatie ontvangen
  </h2>
  <p style="color: #4B5563; margin-bottom: 24px;">
    Voor de functie <strong>${data.jobTitle}</strong>
  </p>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #4B5563; font-size: 14px; width: 40%;">Naam</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px; font-weight: 600;">${data.firstName} ${data.lastName}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #4B5563; font-size: 14px;">E-mail</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px;">
        <a href="mailto:${data.email}" style="color: #587DFE;">${data.email}</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #4B5563; font-size: 14px;">Telefoon</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px;">${data.phone || "—"}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; color: #4B5563; font-size: 14px;">Universiteit</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F3F4F6; font-size: 14px;">${data.university || "—"}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; ${data.linkedInUrl ? "border-bottom: 1px solid #F3F4F6; " : ""}color: #4B5563; font-size: 14px;">Studierichting</td>
      <td style="padding: 10px 0; ${data.linkedInUrl ? "border-bottom: 1px solid #F3F4F6; " : ""}font-size: 14px;">${data.studyField || "—"}</td>
    </tr>${data.linkedInUrl ? `
    <tr>
      <td style="padding: 10px 0; color: #4B5563; font-size: 14px;">LinkedIn</td>
      <td style="padding: 10px 0; font-size: 14px;">
        <a href="${data.linkedInUrl}" style="color: #587DFE;">${data.linkedInUrl}</a>
      </td>
    </tr>` : ""}
  </table>

  <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px;">Motivatie</h3>
  <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-bottom: 24px;">${data.motivation}</div>

  <p style="font-size: 13px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 16px;">
    CV is bijgevoegd als bijlage · Ontvangen via <a href="${SITE_URL}" style="color: #587DFE;">Legal Talents</a>
  </p>
</body>
</html>`;
}

function studentEmailHtml(data: {
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

  <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">
    Je sollicitatie is ontvangen! ✓
  </h2>

  <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
    Beste ${data.firstName},<br /><br />
    Je sollicitatie voor de functie <strong>${data.jobTitle}</strong> bij <strong>${data.firmName}</strong>
    is in goede orde ontvangen.
  </p>

  <div style="background: #EEF1FF; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 14px; color: #4B5563; line-height: 1.6;">
      De werkgever neemt contact met je op als je profiel aansluit bij hun wensen.
      Houd je inbox (en spammap) in de gaten.
    </p>
  </div>

  <p style="font-size: 14px; color: #4B5563;">Succes! 🎓</p>
  <p style="font-size: 14px; font-weight: 700; color: #587DFE;">Het Legal Talents team</p>

  <p style="font-size: 13px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 16px; margin-top: 24px;">
    <a href="${SITE_URL}" style="color: #587DFE;">legal-talents.nl</a> · Je ontvangt dit bericht omdat je gesolliciteerd hebt via Legal Talents.
  </p>
</body>
</html>`;
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  console.log("[/api/apply] POST request received");
  const ip = getRequestIp(request.headers);
  const limit = await checkRateLimit(`apply:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { success: false, error: "Te veel verzoeken. Probeer het later opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  // 1. Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    console.error("[/api/apply] Failed to parse form data:", err);
    return NextResponse.json(
      { error: "Ongeldig formulier." },
      { status: 400 }
    );
  }

  const jobId = (formData.get("jobId") as string | null)?.trim();
  const firstName = (formData.get("firstName") as string | null)?.trim();
  const lastName = (formData.get("lastName") as string | null)?.trim();
  const email = (formData.get("email") as string | null)?.trim();
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";
  const university = (formData.get("university") as string | null)?.trim() ?? "";
  const studyField = (formData.get("studyField") as string | null)?.trim() ?? "";
  const motivation = (formData.get("motivation") as string | null)?.trim();
  const linkedInRaw = (formData.get("linkedInUrl") as string | null)?.trim() ?? "";
  let linkedInUrl: string | null = null;
  if (linkedInRaw) {
    const cleaned = sanitizeLinkedInProfileUrl(linkedInRaw);
    if (!isValidLinkedInInUrl(cleaned)) {
      return NextResponse.json(
        {
          error:
            "Voer een geldige LinkedIn-profiel-URL in (https://www.linkedin.com/in/…), of laat het veld leeg.",
        },
        { status: 400 }
      );
    }
    linkedInUrl = cleaned;
  }
  const cvFile = formData.get("cv") as File | null;

  if (process.env.RECAPTCHA_SECRET_KEY) {
    const rawToken = formData.get("recaptchaToken");
    const token = typeof rawToken === "string" ? rawToken.trim() : "";
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Voltooi de reCAPTCHA-verificatie." },
        { status: 400 }
      );
    }
    const forwarded = request.headers.get("x-forwarded-for");
    const remoteip = forwarded?.split(",")[0]?.trim() ?? undefined;
    const captcha = await verifyRecaptchaToken(token, remoteip);
    if (!captcha.ok) {
      return NextResponse.json(
        { success: false, error: "reCAPTCHA-verificatie mislukt. Probeer opnieuw." },
        { status: 400 }
      );
    }
  }

  // 2. Validate required fields
  if (!jobId || !firstName || !lastName || !email || !motivation) {
    return NextResponse.json(
      { error: "Vul alle verplichte velden in." },
      { status: 400 }
    );
  }
  if (!cvFile || cvFile.size === 0) {
    return NextResponse.json(
      { error: "Upload je CV als PDF." },
      { status: 400 }
    );
  }
  if (cvFile.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "CV is te groot. Maximum is 5 MB." },
      { status: 400 }
    );
  }

  const wordCount = motivation.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > 500) {
    return NextResponse.json(
      { error: `Motivatie bevat ${wordCount} woorden. Maximum is 500.` },
      { status: 400 }
    );
  }

  console.log("[/api/apply] Validated fields. jobId:", jobId, "email:", email);

  const supabase = createAdminClient();

  // 3. Fetch job + firm details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(`
      id, title, firm_id,
      firms ( name, notification_email, cc_emails )
    `)
    .eq("id", jobId)
    .eq("status", "active")
    .maybeSingle();

  if (jobError || !job) {
    console.error("[/api/apply] Job not found. jobId:", jobId, "error:", jobError);
    return NextResponse.json(
      { error: "Vacature niet gevonden of niet meer actief." },
      { status: 404 }
    );
  }
  console.log("[/api/apply] Job found:", job.title, "firm_id:", job.firm_id);

  const firm = Array.isArray(job.firms) ? job.firms[0] : job.firms;
  const firmName = (firm as { name: string } | null)?.name ?? "";
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

  if (!notificationEmail) {
    console.error("[/api/apply] No notification email for firm:", firmName);
    return NextResponse.json(
      { error: "Werkgever heeft geen notificatie-e-mail ingesteld." },
      { status: 500 }
    );
  }
  console.log(
    "[/api/apply] Firm:",
    firmName,
    "notificationEmail:",
    notificationEmail,
    "ccEmails:",
    ccEmails.length > 0 ? ccEmails.join(", ") : "(none)"
  );

  // 4. Read CV into buffer (for email attachment + storage)
  const cvArrayBuffer = await cvFile.arrayBuffer();
  const cvBuffer = Buffer.from(cvArrayBuffer);
  const cvFileName = `${job.firm_id}/${jobId}/${Date.now()}-${cvFile.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

  // 5. Upload CV to Supabase Storage (best-effort — don't block on failure)
  let cvStoragePath: string | null = null;
  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cvs")
      .upload(cvFileName, cvBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (uploadError) {
      console.error("[/api/apply] CV storage upload error:", uploadError);
    } else {
      cvStoragePath = uploadData?.path ?? null;
      console.log("[/api/apply] CV uploaded to storage:", cvStoragePath);
    }
  } catch (err) {
    console.error("[/api/apply] CV storage upload exception:", err);
  }

  // 6. Save application to database
  const { error: insertError } = await supabase.from("applications").insert({
    job_id: jobId,
    firm_id: job.firm_id,
    applicant_name: `${firstName} ${lastName}`,
    applicant_email: email,
    applicant_phone: phone || null,
    university: university || null,
    study_field: studyField || null,
    motivation: motivation || null,
    cv_storage_path: cvStoragePath || null,
    linkedin_url: linkedInUrl || null,
  });

  if (insertError) {
    console.error("[/api/apply] Application insert error (non-fatal):", insertError.message, insertError.code);
  } else {
    console.log("[/api/apply] Application saved to database");
  }

  // 7. Send email to firm
  console.log("[/api/apply] Sending email to firm:", notificationEmail);
  try {
    const resend = createResend();
    await resend.emails.send({
      from: "Legal Talents <noreply@legal-talents.nl>",
      to: notificationEmail,
      ...(ccEmails.length > 0 ? { cc: ccEmails } : {}),
      subject: `Nieuwe sollicitatie: ${firstName} ${lastName} voor ${job.title}`,
      html: firmEmailHtml({
        firstName,
        lastName,
        email,
        phone,
        university,
        studyField,
        motivation,
        jobTitle: job.title,
        firmName,
        linkedInUrl,
      }),
      attachments: [
        {
          filename: `CV-${firstName}-${lastName}.pdf`,
          content: cvBuffer,
        },
      ],
    });
    console.log("[/api/apply] Firm email sent");
  } catch (emailError) {
    console.error("[/api/apply] Firm email error:", emailError);
  }

  // 8. Send confirmation to student
  console.log("[/api/apply] Sending confirmation email to student:", email);
  try {
    const resend = createResend();
    await resend.emails.send({
      from: "Legal Talents <noreply@legal-talents.nl>",
      to: email,
      subject: `Je sollicitatie bij ${firmName} is ontvangen`,
      html: studentEmailHtml({ firstName, jobTitle: job.title, firmName }),
    });
  } catch (emailError) {
    console.error("[/api/apply] Student confirmation email error:", emailError);
  }

  console.log("[/api/apply] Done. cvStoragePath:", cvStoragePath);
  return NextResponse.json({ success: true, cvStoragePath });
}
