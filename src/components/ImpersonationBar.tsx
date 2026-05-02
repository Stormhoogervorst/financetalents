import { Shield, LogOut } from "lucide-react";
import { getImpersonatedFirmId } from "@/lib/impersonation";
import { createAdminClient } from "@/lib/supabase/admin";
import { stopImpersonationAction } from "@/lib/impersonation-actions";

/**
 * Sticky waarschuwingsbalk bovenaan de hele site, alleen zichtbaar wanneer
 * een admin op dit moment als werkgever is ingelogd. Eén klik op "Terug
 * naar Admin" verwijdert de cookie en stuurt de admin terug naar /admin.
 */
export default async function ImpersonationBar() {
  const firmId = await getImpersonatedFirmId();
  if (!firmId) return null;

  const admin = createAdminClient();
  const { data: firm } = await admin
    .from("firms")
    .select("name")
    .eq("id", firmId)
    .maybeSingle();

  const firmName = firm?.name ?? "onbekende werkgever";

  return (
    <div className="sticky top-0 z-[60] bg-amber-500 text-amber-950 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-sm sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Shield className="h-4 w-4 shrink-0" />
          <span className="truncate">
            <strong className="font-semibold">Impersonatie actief</strong> · Je
            beheert nu <strong>{firmName}</strong>
          </span>
        </div>
        <form action={stopImpersonationAction} className="shrink-0">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-50 transition hover:bg-black"
          >
            <LogOut className="h-3.5 w-3.5" />
            Terug naar Admin
          </button>
        </form>
      </div>
    </div>
  );
}
