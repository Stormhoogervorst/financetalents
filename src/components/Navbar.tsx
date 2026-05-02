"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { Briefcase, Menu, X, ChevronDown, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    };
    getProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getProfile();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-brand-600 text-xl">
            <Briefcase className="h-6 w-6" />
            VacancyHub
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/vacancies" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
              Browse Jobs
            </Link>
            {profile?.role === "employer" && (
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                Dashboard
              </Link>
            )}
            {profile?.role === "admin" && (
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                Admin
              </Link>
            )}
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-100 transition"
                >
                  <span className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {(profile.full_name ?? profile.email)[0]}
                  </span>
                  {profile.full_name ?? profile.email}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-lg ring-1 ring-gray-200 py-1 text-sm">
                    {profile.role === "employer" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                    )}
                    {profile.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <Shield className="h-4 w-4" /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary text-xs px-3 py-2">
                  Log in
                </Link>
                <Link href="/auth/register" className="btn-primary text-xs px-3 py-2">
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href="/vacancies" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
            Browse Jobs
          </Link>
          {profile?.role === "employer" && (
            <Link href="/dashboard" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}
          {profile?.role === "admin" && (
            <Link href="/admin" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
          {profile ? (
            <button onClick={handleSignOut} className="block text-sm font-medium text-red-600">
              Sign out
            </button>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link href="/auth/login" className="btn-secondary text-sm" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link href="/auth/register" className="btn-primary text-sm" onClick={() => setMenuOpen(false)}>Sign up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
