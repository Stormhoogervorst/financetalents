"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavbarPublicVariant = "default" | "overlay" | "hero";

type NavbarPublicProps = {
  variant?: NavbarPublicVariant;
};

function useNavActive(pathname: string | null) {
  const p = pathname ?? "";
  return {
    vacatures:
      p === "/vacatures" ||
      p.startsWith("/vacatures/") ||
      p === "/vacature" ||
      p.startsWith("/vacature/"),
    stages: p === "/stages" || p.startsWith("/stages/"),
    werkgevers:
      p === "/werkgevers" ||
      p.startsWith("/werkgevers/") ||
      p === "/voor-werkgevers",
    kennisbank: p === "/kennisbank" || p.startsWith("/kennisbank/"),
    recruitment: p === "/recruitment" || p.startsWith("/recruitment/"),
  };
}

export default function NavbarPublic({
  variant = "default",
}: NavbarPublicProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();
  const active = useNavActive(pathname);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Track whether the user has scrolled past the hero area so the liquid-glass
  // navbar can swap to a readable light appearance over white page content.
  useEffect(() => {
    if (variant !== "hero") return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  // Guard scroll-dependent state with hasMounted so the first client render
  // exactly matches the server-rendered HTML and avoids hydration errors.
  const effectiveScrolled = hasMounted && scrolled;

  // "Transparent over hero" state: hero variant AND still near the top.
  const isHeroTop = variant === "hero" && !effectiveScrolled;

  const linkClass = (key: keyof ReturnType<typeof useNavActive>) =>
    cn(
      "inline-flex items-center text-[14px] font-medium transition-colors duration-300",
      isHeroTop
        ? active[key]
          ? "text-white"
          : "text-white/70 hover:text-white"
        : active[key]
          ? "text-[#2C337A]"
          : "text-[#5A6094] hover:text-[#2C337A]",
    );

  // When the mobile menu is open we render the light liquid-glass panel, so
  // the close icon must be dark to stay visible on that lighter surface.
  const menuIconClass = menuOpen
    ? "text-[#2C337A] hover:text-[#1E2560]"
    : isHeroTop
      ? "text-white/80 hover:text-white"
      : "text-[#5A6094] hover:text-[#2C337A]";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
        variant === "hero"
          ? effectiveScrolled
            ? "bg-white/80 backdrop-blur-[14px] backdrop-saturate-150 border-b border-[#E2E5F0]/70 shadow-[0_1px_0_0_rgba(44,51,122,0.04)]"
            : "bg-white/10 backdrop-blur-[12px] backdrop-saturate-150 border-b border-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset]"
          : variant === "overlay"
            ? "bg-white/90 backdrop-blur-sm border-b border-[#E2E5F0]"
            : "bg-white border-b border-[#E2E5F0]",
      )}
      style={
        variant === "hero"
          ? {
              WebkitBackdropFilter: effectiveScrolled
                ? "blur(14px) saturate(150%)"
                : "blur(12px) saturate(150%)",
            }
          : undefined
      }
    >
      <div
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="flex h-[4.25rem] items-center justify-between gap-6">
            <div className="flex items-center min-w-0 gap-8 lg:gap-10">
              <Link href="/" className="flex items-center shrink-0">
                <Image
                  src="/legal-talents-logo.png"
                  alt="Legal Talents logo"
                  width={150}
                  height={40}
                  className="h-8 w-auto"
                  priority
                />
              </Link>

              <div className="hidden md:flex items-center gap-6 lg:gap-8">
                <Link href="/vacatures" className={linkClass("vacatures")} title="Juridische Vacatures">
                  Vacatures
                </Link>
                <Link href="/stages" className={linkClass("stages")} title="Juridische Stages">
                  Stages
                </Link>
                <Link href="/werkgevers" className={linkClass("werkgevers")}>
                  Werkgevers
                </Link>
                <Link href="/kennisbank" className={linkClass("kennisbank")}>
                  Kennisbank
                </Link>
                <Link href="/recruitment" className={linkClass("recruitment")}>
                  Recruitment
                </Link>
              </div>
            </div>

            <div className="flex items-center shrink-0 gap-4">
              <Link
                href="/register"
                className={cn(
                  "hidden md:inline-flex items-center rounded-full px-5 py-2 text-[14px] font-medium transition-[background-color,color,transform] duration-300 hover:scale-[1.03]",
                  isHeroTop
                    ? "bg-white text-[#2C337A] hover:bg-white/90"
                    : "bg-[#587DFE] text-white hover:bg-[#4A6CE6]",
                )}
              >
                Werkgever aanmelden
              </Link>

              <button
                type="button"
                className={cn("md:hidden p-2 -mr-2 transition-colors", menuIconClass)}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="md:hidden border-t border-white/30 bg-white/70 backdrop-blur-lg backdrop-saturate-150 shadow-[0_8px_24px_-12px_rgba(44,51,122,0.18)]"
          style={{
            paddingLeft: "clamp(24px, 5vw, 80px)",
            paddingRight: "clamp(24px, 5vw, 80px)",
            paddingTop: "12px",
            paddingBottom: "20px",
            WebkitBackdropFilter: "blur(16px) saturate(150%)",
          }}
        >
          <div className="max-w-[1400px] mx-auto flex flex-col items-stretch">
            {[
              { href: "/vacatures", key: "vacatures" as const, label: "Vacatures", title: "Juridische Vacatures" },
              { href: "/stages", key: "stages" as const, label: "Stages", title: "Juridische Stages" },
              { href: "/werkgevers", key: "werkgevers" as const, label: "Werkgevers" },
              { href: "/kennisbank", key: "kennisbank" as const, label: "Kennisbank" },
              { href: "/recruitment", key: "recruitment" as const, label: "Recruitment" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                title={item.title}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "block w-full py-4 text-[16px] font-medium border-b border-white/30 transition-colors duration-200",
                  active[item.key]
                    ? "text-[#2C337A]"
                    : "text-[#2C337A]/85 hover:text-[#2C337A]",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-5">
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="btn-primary w-full justify-center text-[15px] py-3 shadow-[0_10px_24px_-8px_rgba(88,125,254,0.55)]"
              >
                Werkgever aanmelden
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
