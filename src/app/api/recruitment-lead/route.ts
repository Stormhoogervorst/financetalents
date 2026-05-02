import { NextRequest, NextResponse } from "next/server";
import { createResend } from "@/lib/resend";
import { verifyRecaptchaToken } from "@/lib/recaptcha/verify-server";
import { checkRateLimit, getRequestIp } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const TARGET_EMAIL = "Storm@legal-talents.nl";

type RecruitmentLeadPayload = {
  firstName?: string;
  lastName?: string;
  firmName?: string;
  email?: string;
  phone?: string;
  recaptchaToken?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request.headers);
  const limit = await checkRateLimit(`recruitment-lead:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error:
          "Te veel verzoeken. Wacht even en probeer het daarna opnieuw.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let body: RecruitmentLeadPayload;

  try {
    body = (await request.json()) as RecruitmentLeadPayload;
  } catch {
    return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
  }

  const firstName = clean(body.firstName);
  const lastName = clean(body.lastName);
  const firmName = clean(body.firmName);
  const email = clean(body.email);
  const phone = clean(body.phone);

  if (process.env.RECAPTCHA_SECRET_KEY) {
    const captcha = await verifyRecaptchaToken(clean(body.recaptchaToken));
    if (!captcha.ok) {
      return NextResponse.json(
        { error: "reCAPTCHA-verificatie mislukt. Probeer opnieuw." },
        { status: 400 }
      );
    }
  }

  if (!firstName || !lastName || !firmName || !email || !phone) {
    return NextResponse.json(
      { error: "Vul alle verplichte velden in." },
      { status: 400 }
    );
  }

  try {
    const resend = createResend();

    await resend.emails.send({
      from: "Legal Talents <noreply@legal-talents.nl>",
      to: TARGET_EMAIL,
      subject: `Nieuw terugbelverzoek: ${firstName} ${lastName} (${firmName})`,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="margin-bottom: 16px;">Nieuw terugbelverzoek</h2>
          <p><strong>Naam:</strong> ${firstName} ${lastName}</p>
          <p><strong>Werkgeversnaam:</strong> ${firmName}</p>
          <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Telefoon:</strong> <a href="tel:${phone}">${phone}</a></p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/recruitment-lead] Failed to send email:", error);
    return NextResponse.json(
      { error: "Versturen is mislukt. Probeer het opnieuw." },
      { status: 500 }
    );
  }
}
