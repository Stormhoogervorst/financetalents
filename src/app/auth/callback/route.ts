import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase auth callback.
 *
 * Supabase's default e-mail templates (sign-up verification, magic link én
 * password recovery) verwijzen standaard naar `{{ .SiteURL }}/auth/callback`
 * met daarin een `code` query parameter. Die code moet hier worden
 * ingewisseld voor een sessie (cookies) via `exchangeCodeForSession`.
 *
 * Zonder deze route landt de gebruiker gewoon op de homepage met een losse
 * `?code=…` in de URL — precies het probleem dat we hier oplossen.
 *
 * Recovery-detectie:
 *   - We geven `next=/update-wachtwoord` mee in de `redirectTo` van
 *     `resetPasswordForEmail` (zie src/app/login/page.tsx). Supabase laat
 *     eigen query-params in `redirectTo` intact, dus die marker komt hier
 *     weer binnen.
 *   - Na succesvolle code-exchange sturen we de gebruiker naar de losse,
 *     afgeschermde wachtwoord-resetpagina (`/update-wachtwoord`). Die pagina
 *     leeft buiten de portal-layout en sluit de tijdelijke recovery-sessie
 *     na het opslaan zelf weer af.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const nextParam = searchParams.get("next");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const base = process.env.NEXT_PUBLIC_SITE_URL || origin;

  // Supabase kan ook direct met een fout terugkomen (bijv. verlopen link).
  if (errorParam) {
    console.warn("[auth/callback] Supabase returned an error:", {
      errorParam,
      errorDescription,
    });
    return NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(errorParam)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${base}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(`${base}/login?error=auth_callback_failed`);
  }

  // Recovery flow: de gebruiker heeft nu een geldige sessie, maar moet meteen
  // een nieuw wachtwoord kiezen. We sturen hem naar /update-wachtwoord —
  // een losstaande, afgeschermde pagina buiten de portal-layout. Wanneer de
  // aanroeper expliciet een `next` meegeeft respecteren we die, met een
  // veilige fallback naar /update-wachtwoord.
  if (type === "recovery") {
    const destination = nextParam || "/update-wachtwoord";
    return NextResponse.redirect(`${base}${destination}`);
  }

  // Normale login / e-mail verificatie: respecteer `next` indien opgegeven,
  // anders naar het dashboard.
  const destination = nextParam || "/dashboard";
  return NextResponse.redirect(`${base}${destination}`);
}
