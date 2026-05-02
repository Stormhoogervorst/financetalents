"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  User,
  Briefcase,
  Users,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/portal/profile", label: "Mijn profiel", icon: User },
  { href: "/portal/jobs", label: "Vacatures", icon: Briefcase },
  { href: "/portal/blogs", label: "Blogs", icon: FileText },
  { href: "/portal/applications", label: "Sollicitanten", icon: Users },
  { href: "/portal/settings", label: "Instellingen", icon: Settings },
];

export default function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop sidebar (fixed) ─────────────────────────────── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-white border-r border-gray-100 z-40">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-gray-100 shrink-0">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/legal-talents-logo.png"
              alt="Legal Talents logo"
              width={150}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(href, exact)
                  ? "bg-primary-light text-primary font-semibold"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="shrink-0 px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Uitloggen
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar (sticky) ─────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/legal-talents-logo.png"
              alt="Legal Talents logo"
              width={150}
              height={40}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg"
            aria-label="Uitloggen"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── Mobile bottom nav (fixed) ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
        <div className="flex">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                isActive(href, exact) ? "text-primary" : "text-gray-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="truncate w-full text-center">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
