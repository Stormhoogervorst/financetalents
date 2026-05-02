import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getActingFirm } from "@/lib/impersonation";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Instellingen",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { firm, isImpersonating } = await getActingFirm<{
    id: string;
    name: string | null;
    notification_email: string | null;
    cc_emails: string[] | null;
  }>("id, name, notification_email, cc_emails", user.id);

  // Admins kunnen tijdens impersonatie de instellingen meekijken; opslaan
  // blijft gebonden aan de echte eigenaar (isOwner=false) zodat mutations
  // nooit per ongeluk namens de klant gebeuren.
  const isOwner = !!firm && !isImpersonating;

  return (
    <SettingsClient
      hasFirm={!!firm}
      isOwner={isOwner}
      initialNotificationEmail={firm?.notification_email ?? ""}
      initialCcEmails={Array.isArray(firm?.cc_emails) ? firm!.cc_emails! : []}
    />
  );
}
