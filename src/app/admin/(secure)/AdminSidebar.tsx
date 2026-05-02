"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Briefcase, FileText, LogOut, Shield } from "lucide-react";
import { adminSignOutAction } from "./actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/werkgevers", label: "Werkgevers", icon: Building2, exact: false },
  { href: "/admin/vacatures", label: "Vacatures", icon: Briefcase, exact: false },
  { href: "/admin/blogs", label: "Blogs", icon: FileText, exact: false },
];

export function AdminSidebar({ email }: { email: string | null }) {
  const pathname = usePathname() ?? "";

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:text-slate-700 lg:border-r lg:border-gray-200">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
        <Image
          src="/legal-talents-logo.png"
          alt="Legal Talents logo"
          width={130}
          height={32}
          className="h-7 w-auto"
          priority
        />
      </div>

      <div className="px-6 py-4 border-b border-gray-200">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 ring-1 ring-inset ring-red-200">
          <Shield className="h-3 w-3" />
          Super Admin
        </div>
        {email && (
          <p className="mt-2 text-xs text-gray-500 truncate" title={email}>
            {email}
          </p>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-gray-100 text-gray-900"
                  : "text-slate-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action={adminSignOutAction} className="p-3 border-t border-gray-200">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-gray-100 hover:text-gray-900 transition"
        >
          <LogOut className="h-4 w-4" />
          Uitloggen
        </button>
      </form>
    </aside>
  );
}
