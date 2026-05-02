"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin-actie: een vacature hard verwijderen.
 *
 * We kiezen bewust voor een hard delete i.p.v. een soft-delete:
 * - Er is (nog) geen soft-delete infrastructuur in dit project.
 * - De applications-tabel heeft een ON DELETE CASCADE op job_id, dus
 *   bijbehorende sollicitaties worden in dezelfde transactie opgeruimd.
 *
 * Defense-in-depth: de UI zit al achter (secure)/layout.tsx + middleware.ts,
 * maar Server Actions zijn ook direct over het netwerk aanroepbaar. Daarom
 * valideren we hier opnieuw dat de caller een admin-profiel heeft voor we
 * met de service-role client schrijven.
 */
export async function deleteVacancyAsAdmin(formData: FormData): Promise<void> {
  const jobId = String(formData.get("jobId") ?? "");
  if (!jobId) throw new Error("Ontbrekend vacature-id.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Niet ingelogd.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") throw new Error("Geen toegang.");

  const admin = createAdminClient();
  const { error } = await admin.from("jobs").delete().eq("id", jobId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/vacatures");
}
