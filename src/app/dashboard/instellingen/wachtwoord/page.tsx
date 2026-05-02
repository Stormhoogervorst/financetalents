import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import WachtwoordForm from "./WachtwoordForm";

export const metadata = {
  title: "Nieuw wachtwoord instellen",
};

/**
 * Landingspagina voor de password-recovery flow. De gebruiker komt hier
 * terecht via /auth/callback nadat Supabase de recovery-link heeft
 * ingewisseld voor een geldige sessie. Zonder sessie kan er geen wachtwoord
 * worden bijgewerkt — dan sturen we ze terug naar /login.
 */
export default async function WachtwoordResetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=session_expired");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Nieuw wachtwoord instellen
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Kies een nieuw wachtwoord voor{" "}
            <span className="font-medium text-gray-900">{user.email}</span>.
          </p>
        </div>

        <WachtwoordForm />
      </div>
    </div>
  );
}
