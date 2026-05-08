import { createClient } from "@/lib/supabase/server";
import { getActingFirm, getImpersonatedFirmId } from "@/lib/impersonation";
import ProfileForm from "./ProfileForm";
import DangerZone from "./DangerZone";

export const metadata = {
  title: "My profile",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { firm, isImpersonating } = await getActingFirm<Record<string, unknown>>(
    "*",
    user!.id
  );

  const impersonatedFirmId = isImpersonating
    ? await getImpersonatedFirmId()
    : null;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">My profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          {firm
            ? "Manage the information of your company that is visible on Finance Talents."
            : "Set up your company profile to become visible on Finance Talents."}
        </p>
      </div>

      {isImpersonating && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You are editing this company profile as an admin. Changes are saved directly to this existing company. No new
          profile is created.
        </div>
      )}

      <ProfileForm
        firm={firm as Parameters<typeof ProfileForm>[0]["firm"]}
        userId={user!.id}
        userEmail={user!.email ?? ""}
        isImpersonating={isImpersonating}
      />

      {/* ── Gevarenzone — buiten de <form> zodat de verwijder-knop geen
          profielopslag triggert. Tijdens impersonatie verbergen zodat een
          admin het account van de klant niet per ongeluk verwijdert. ──── */}
      {!impersonatedFirmId && (
        <div className="mt-10">
          <DangerZone />
        </div>
      )}
    </div>
  );
}
