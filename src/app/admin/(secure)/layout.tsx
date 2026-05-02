import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "./AdminSidebar";

export const dynamic = "force-dynamic";

/**
 * Beveiligde "cockpit"-layout voor het Super Admin portaal.
 *
 * Defense-in-depth bovenop middleware.ts:
 *   - geen sessie       → /admin/login
 *   - sessie zonder admin-rol → / (met ?error=unauthorized)
 *
 * Alles binnen het route-group `(secure)` valt hieronder. /admin/login zit
 * bewust BUITEN deze layout, zodat de inlogpagina nooit zichzelf afschermt.
 */
export default async function AdminSecureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/?error=unauthorized");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar email={profile?.email ?? user.email ?? null} />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
