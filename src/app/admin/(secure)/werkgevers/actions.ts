"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { IMPERSONATION_COOKIE } from "@/lib/impersonation";

// ── deleteEmployerAction ─────────────────────────────────────────────────
//
// Verwijdert een werkgever volledig vanuit het admin-dashboard.
//
// Flow:
//  1. Verifieer dat de ingelogde gebruiker admin is (defense-in-depth;
//     middleware + (secure)/layout doen dit ook al).
//  2. Resolve firm + firm-owner user_id via service-role client.
//  3. Best-effort: verwijder logo-bestanden uit de `logos`-bucket onder
//     de firm-owner.
//  4. Verwijder de auth.users-rij van de firm-owner. De
//     ON DELETE CASCADE-keten (zie
//     supabase-migration-account-deletion-cascade.sql) ruimt
//     `profiles`, `firms`, `jobs`, `applications`, `blogs` en
//     `invitations` automatisch op.
//  5. Als er per ongeluk nog een actieve impersonatie-cookie op deze
//     firm stond, wissen we die zodat de admin niet op een dead link
//     blijft hangen.
//
// Contract met de client:
//  - Bij falen: `return { error: "..." }`. Nooit throwen voor business-
//     fouten; dat laat Next.js de error-boundary triggeren en dat leest
//     als een generieke render-crash voor de gebruiker.
//  - Bij succes: `redirect(...)` — nadrukkelijk BUITEN elk try/catch,
//     want Next.js gebruikt intern een thrown NEXT_REDIRECT om de
//     navigatie te laten plaatsvinden. Als we die zouden vangen,
//     blokkeren we de navigatie en crasht het scherm.

type DeleteEmployerResult = { error: string };

export async function deleteEmployerAction(
  formData: FormData
): Promise<DeleteEmployerResult | void> {
  const employerId = String(formData.get("employerId") ?? "").trim();
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (!employerId) {
    return { error: "Geen werkgever-id opgegeven." };
  }
  if (confirm !== "VERWIJDER") {
    return {
      error: "Bevestiging onjuist — typ 'VERWIJDER' exact om te bevestigen.",
    };
  }

  // Step 1: admin-rol herverificatie
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Niet ingelogd: redirect gebeurt buiten elk try/catch.
    redirect("/admin/login");
  }

  const { data: selfProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (selfProfile?.role !== "admin") {
    redirect("/?error=unauthorized");
  }

  const admin = createAdminClient();

  // Step 2: resolve firm + owner
  const { data: firm, error: firmError } = await admin
    .from("firms")
    .select("id, name, user_id")
    .eq("id", employerId)
    .maybeSingle<{ id: string; name: string; user_id: string }>();

  if (firmError) {
    console.error(
      "[deleteEmployerAction] firm lookup error:",
      firmError.message
    );
    return { error: "Werkgever ophalen mislukt." };
  }
  if (!firm) {
    return { error: "Werkgever niet gevonden." };
  }

  // Guard: admin mag zichzelf niet wegpoetsen via deze route.
  if (firm.user_id === user.id) {
    return {
      error: "Je kunt je eigen account niet via deze route verwijderen.",
    };
  }

  // Guard: weiger het verwijderen van andere admin-accounts. Werkgever-
  // delete is nadrukkelijk voor gewone werkgevers, niet voor collega-
  // admins — die verdienen een expliciete, apart gelogde flow.
  const { data: ownerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", firm.user_id)
    .maybeSingle<{ role: string | null }>();

  if (ownerProfile?.role === "admin") {
    return {
      error:
        "Deze werkgever is gekoppeld aan een admin-account en kan niet via dit scherm verwijderd worden.",
    };
  }

  // Step 3: storage-cleanup (best-effort). Bewust geïsoleerde try/catch;
  // we willen nooit falen op een losse logo-file als de delete zelf
  // prima gaat.
  try {
    const { data: files } = await admin.storage
      .from("logos")
      .list(firm.user_id);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${firm.user_id}/${f.name}`);
      await admin.storage.from("logos").remove(paths);
    }
  } catch (err) {
    console.error("[deleteEmployerAction] storage cleanup failed:", err);
  }

  // Step 4: delete auth.users — cascade ruimt de rest op. Strikt binnen
  // een try/catch zodat we netjes een error terug kunnen geven zonder
  // dat de UI crasht.
  try {
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(
      firm.user_id
    );

    if (deleteUserError) {
      const notFound = /user not found|not_found|no user/i.test(
        deleteUserError.message
      );

      if (!notFound) {
        console.error(
          "[deleteEmployerAction] auth.admin.deleteUser error:",
          deleteUserError.message
        );
        return { error: "Werkgever verwijderen is mislukt." };
      }

      // Fallback: auth.users-rij bestaat niet meer (weesprofiel).
      // Verwijder de firm-rij direct; de cascade binnen `public` ruimt
      // dan alsnog jobs/applications/blogs op.
      const { error: firmDeleteError } = await admin
        .from("firms")
        .delete()
        .eq("id", firm.id);

      if (firmDeleteError) {
        console.error(
          "[deleteEmployerAction] firm fallback delete error:",
          firmDeleteError.message
        );
        return { error: "Werkgever verwijderen is mislukt." };
      }
    }
  } catch (err) {
    console.error("[deleteEmployerAction] unexpected delete failure:", err);
    return { error: "Werkgever verwijderen is mislukt." };
  }

  // Step 5: wis impersonatie-cookie als die toevallig op deze firm stond.
  const cookieStore = await cookies();
  const impersonating = cookieStore.get(IMPERSONATION_COOKIE)?.value;
  if (impersonating === firm.id) {
    cookieStore.delete(IMPERSONATION_COOKIE);
  }

  // Force een verse render van de werkgeverslijst + dashboard.
  revalidatePath("/admin/werkgevers");
  revalidatePath("/admin");

  // BELANGRIJK: redirect() gooit intern een NEXT_REDIRECT-error die Next.js
  // gebruikt om de navigatie te doen. Deze call MOET buiten elk try/catch
  // blijven, anders vangen we die error en krijgt de gebruiker een
  // generieke render-crash in plaats van een doorverwijzing.
  redirect("/admin/werkgevers?deleted=" + encodeURIComponent(firm.name));
}
