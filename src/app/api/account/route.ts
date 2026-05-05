import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const LOGO_BUCKETS = ["logo's", "logos"] as const;

// ── DELETE /api/account — werkgever verwijdert zijn volledige account ─────
//
// Flow:
//   1. Verifieer sessie (anon client via cookies).
//   2. Resolve firm van ingelogde user (voor storage-cleanup).
//   3. Verwijder firm-logos uit de `logo's`-storage bucket (best-effort).
//   4. Verwijder auth.users-rij via service-role client. Alle gekoppelde
//      rijen in `firms`, `jobs`, `applications`, `blogs`, `invitations`
//      en `profiles` worden automatisch opgeruimd dankzij de
//      ON DELETE CASCADE-keten (zie supabase-migration-account-deletion-cascade.sql).
//
// Veiligheid:
//   - user_id wordt altijd server-side afgeleid uit de sessie. De client kan
//     geen andere gebruiker opgeven om te verwijderen.
//   - De service-role client wordt uitsluitend gebruikt voor de finale
//     auth.admin.deleteUser-call, ná IDOR-controle via de sessie-user.

export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const admin = createAdminClient();

  // Best-effort storage cleanup: logo's leven onder `${user.id}/...` in de
  // `logo's`-bucket. Faalt de cleanup, dan laten we de account-deletion wél
  // doorgaan — de user-intent is leidend en losse storage-objecten kunnen
  // later handmatig worden opgeruimd.
  try {
    for (const bucket of LOGO_BUCKETS) {
      const { data: files } = await admin.storage.from(bucket).list(user.id);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await admin.storage.from(bucket).remove(paths);
      }
    }
  } catch (err) {
    console.error("[DELETE /api/account] storage cleanup failed:", err);
  }

  // Finale stap: verwijder de auth.users-rij. De FK-cascades ruimen de
  // rest van de database op (firms, jobs, applications, blogs, invitations,
  // profiles).
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error(
      "[DELETE /api/account] auth.admin.deleteUser error:",
      deleteError.message
    );
    return NextResponse.json(
      { error: "Account verwijderen is mislukt. Probeer het later opnieuw." },
      { status: 500 }
    );
  }

  // Sign out cookies op de server voor de zekerheid — de client roept
  // daarna alsnog signOut() aan om de browser-sessie/localStorage te wissen.
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
