import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import { redirect } from "next/navigation";
import VacancyForm from "@/components/VacancyForm";

export default async function NewVacancyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (profile?.role !== "employer" && profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Post a new vacancy</h1>
        <VacancyForm
          employerId={user.id}
          companyName={profile?.company_name ?? ""}
        />
      </div>
    </div>
  );
}
