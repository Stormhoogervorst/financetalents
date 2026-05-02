import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getImpersonatedFirmId } from "@/lib/impersonation";

// ── POST /api/firms/me/logo ──────────────────────────────────────────────
//
// Uploadt een logo naar de `logos`-storage bucket en geeft de publieke URL
// terug. Authorisatie:
//
//  1) Normaal: de ingelogde gebruiker uploadt voor zijn eigen firm —
//     pad is `${firm.user_id}/logo.<ext>` en past binnen de standaard
//     Supabase-storage RLS (owner == auth.uid()).
//  2) Impersonatie: een admin uploadt namens de geïmpersoneerde werkgever.
//     Client-side RLS zou dit blokkeren (de admin is niet de owner), dus
//     we uploaden server-side met de service-role client naar de map van
//     de *echte* firm-owner. Zo komt er GEEN nieuwe werkgeversrij bij en
//     landt het logo op de juiste plek.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Ongeldige upload (verwachtte multipart/form-data)." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Bestand ontbreekt in het formulier." },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return NextResponse.json(
      { error: "Alleen JPG, PNG of WebP bestanden zijn toegestaan." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Logo mag maximaal 2 MB zijn." },
      { status: 400 }
    );
  }

  // Resolve target firm — respects impersonation, never trusts client
  // IDs. This guarantees the logo is uploaded onto the correct firm even
  // when an admin is impersonating.
  const impersonatedFirmId = await getImpersonatedFirmId();
  const admin = createAdminClient();

  let targetFirmId: string | null = null;
  let ownerUserId: string | null = null;

  if (impersonatedFirmId) {
    const { data } = await admin
      .from("firms")
      .select("id, user_id")
      .eq("id", impersonatedFirmId)
      .maybeSingle();
    if (!data) {
      return NextResponse.json(
        { error: "Geïmpersoneerde werkgever niet gevonden." },
        { status: 404 }
      );
    }
    targetFirmId = data.id as string;
    ownerUserId = data.user_id as string;
  } else {
    const { data } = await supabase
      .from("firms")
      .select("id, user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data) {
      targetFirmId = data.id as string;
      ownerUserId = data.user_id as string;
    } else {
      // Eerste profielaanmaak — logo kan pas nadat de firm bestaat worden
      // gekoppeld; upload onder het eigen user-id zodat het consistent is
      // met de `logos`-bucket-conventie en later door de PATCH-route aan
      // de nieuwe firm wordt gekoppeld.
      ownerUserId = user.id;
    }
  }

  const extFromType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext =
    extFromType[file.type] ??
    (file.name.split(".").pop() ?? "jpg").toLowerCase();

  const path = `${ownerUserId}/logo.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("logos")
    .upload(path, buffer, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error("[POST /api/firms/me/logo] upload error:", uploadError.message);
    return NextResponse.json(
      { error: `Logo uploaden mislukt: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const { data: urlData } = admin.storage.from("logos").getPublicUrl(path);
  // Cache-busting query param zodat de browser direct de nieuwe versie
  // laadt nadat de upload het oude bestand overschreven heeft.
  const logoUrl = `${urlData.publicUrl}?v=${Date.now()}`;

  // Persist de URL meteen op de firm zodat client-side alleen nog het
  // formulier hoeft te submitten — voorkomt ook dat het logo "los" blijft
  // staan als de gebruiker het save-formulier niet verstuurt.
  if (targetFirmId) {
    const { error: updateError } = await admin
      .from("firms")
      .update({ logo_url: logoUrl })
      .eq("id", targetFirmId);
    if (updateError) {
      console.error(
        "[POST /api/firms/me/logo] firm logo_url update error:",
        updateError.message
      );
      return NextResponse.json(
        { error: "Logo geüpload, maar kon niet aan werkgever gekoppeld worden." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ logo_url: logoUrl });
}
