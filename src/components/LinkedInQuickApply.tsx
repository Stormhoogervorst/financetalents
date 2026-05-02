"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  sanitizeLinkedInProfileUrl,
  isValidLinkedInInUrl,
} from "@/lib/linkedin-profile-url";

interface Props {
  jobId: string;
  jobSlug: string;
  alreadyApplied?: boolean;
}

export default function LinkedInQuickApply({
  jobId,
  jobSlug,
  alreadyApplied = false,
}: Props) {
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [phone, setPhone] = useState("");

  const [urlError, setUrlError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Button is active only when every required field is filled AND the
  // LinkedIn URL parses as a valid https://www.linkedin.com/in/<slug>/ URL.
  const isFormValid = useMemo(() => {
    if (!firstName.trim()) return false;
    if (!lastName.trim()) return false;
    if (!phone.trim()) return false;
    const trimmedUrl = linkedinUrl.trim();
    if (!trimmedUrl) return false;
    return isValidLinkedInInUrl(sanitizeLinkedInProfileUrl(trimmedUrl));
  }, [firstName, lastName, phone, linkedinUrl]);

  function handleCancel() {
    setShowForm(false);
    setUrlError(null);
    setError(null);
  }

  async function handleSubmit() {
    setError(null);
    setUrlError(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedPhone = phone.trim();
    const cleanUrl = sanitizeLinkedInProfileUrl(linkedinUrl.trim());

    if (!trimmedFirst || !trimmedLast || !trimmedPhone) {
      setError("Vul alle velden in.");
      return;
    }

    if (!isValidLinkedInInUrl(cleanUrl)) {
      setUrlError(
        "Voer een geldige LinkedIn-profiel-URL in (https://www.linkedin.com/in/…).",
      );
      return;
    }

    setLinkedinUrl(cleanUrl);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/linkedin-apply/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          firstName: trimmedFirst,
          lastName: trimmedLast,
          linkedinUrl: cleanUrl,
          phone: trimmedPhone,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        router.replace(`/vacature/${jobSlug}?error=already_applied`);
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.error ?? "Er is iets misgegaan bij het opslaan.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      router.replace(`/vacature/${jobSlug}?status=success`);
    } catch (err) {
      console.error("[LinkedInQuickApply] Submit error:", err);
      setError("Geen verbinding. Probeer het opnieuw.");
      setLoading(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="relative w-full basis-full flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-emerald-50 border border-emerald-200 px-7 py-3.5">
          <svg
            className="h-5 w-5 shrink-0 text-emerald-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <span className="text-[15px] font-semibold text-emerald-700 whitespace-nowrap">
            Sollicitatie verstuurd
          </span>
        </div>
      </div>
    );
  }

  // ── Already-applied state ──────────────────────────────────────────────────
  if (alreadyApplied) {
    return (
      <div className="relative w-full md:w-auto md:shrink-0 flex md:block justify-center">
        <button
          disabled
          aria-disabled="true"
          className="inline-flex items-center gap-3 rounded-full bg-[#E5E5E5] px-7 py-3.5 text-[15px] font-semibold text-[#999999] cursor-not-allowed whitespace-nowrap"
        >
          <svg
            className="h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          Al gesolliciteerd
        </button>
      </div>
    );
  }

  // ── Collapsed: initial CTA ─────────────────────────────────────────────────
  if (!showForm) {
    return (
      <div className="relative w-full basis-full box-border">
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex justify-center items-center gap-3 rounded-full bg-slate-900 px-6 py-3.5 text-sm sm:text-[15px] font-semibold text-white shadow-[0_12px_28px_-10px_rgba(10,15,61,0.55)] ring-1 ring-white/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-[0_18px_36px_-12px_rgba(10,15,61,0.65)] md:hover:scale-[1.02]"
        >
          <svg
            className="h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span>Solliciteer direct met LinkedIn</span>
        </button>
      </div>
    );
  }

  // ── Expanded: form with 4 fields ───────────────────────────────────────────
  const inputBase =
    "w-full bg-white/70 rounded-lg border px-4 py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:ring-2 focus:ring-[#587DFE]/30 focus:border-[#587DFE] transition-all duration-200";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!loading && isFormValid) handleSubmit();
      }}
      className="relative w-full basis-full box-border space-y-4 border-t border-blue-200 pt-6 mt-2 motion-safe:animate-[fadeInUp_240ms_ease-out]"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] font-medium text-white/90">
          Vul je gegevens in om je sollicitatie te versturen.
        </p>
        <button
          type="button"
          onClick={handleCancel}
          className="text-[13px] font-medium text-white/80 underline-offset-4 hover:text-white hover:underline transition-colors"
        >
          Annuleren
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="w-full motion-safe:animate-[fadeInUp_260ms_ease-out]">
          <label htmlFor="linkedin-first-name" className="sr-only">
            Voornaam
          </label>
          <input
            id="linkedin-first-name"
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Voornaam *"
            className={`${inputBase} border-blue-200`}
          />
        </div>

        <div className="w-full motion-safe:animate-[fadeInUp_300ms_ease-out]">
          <label htmlFor="linkedin-last-name" className="sr-only">
            Achternaam
          </label>
          <input
            id="linkedin-last-name"
            type="text"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Achternaam *"
            className={`${inputBase} border-blue-200`}
          />
        </div>
      </div>

      <div className="w-full motion-safe:animate-[fadeInUp_340ms_ease-out]">
        <label htmlFor="linkedin-profile-url" className="sr-only">
          LinkedIn profiel-URL
        </label>
        <input
          id="linkedin-profile-url"
          type="url"
          inputMode="url"
          autoComplete="url"
          value={linkedinUrl}
          onChange={(e) => {
            setLinkedinUrl(e.target.value);
            if (urlError) setUrlError(null);
          }}
          placeholder="LinkedIn profiel-URL *"
          className={`${inputBase} ${
            urlError ? "border-red-400" : "border-blue-200"
          }`}
        />
        {urlError && (
          <p className="mt-1.5 text-[13px] text-red-500">{urlError}</p>
        )}
        <p className="mt-2 text-[13px] text-white">
          Ga naar{" "}
          <a
            href="https://www.linkedin.com/in/me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white border-b border-white/50 hover:border-white transition-colors"
          >
            linkedin.com/in/me
          </a>{" "}
          en kopieer je profiel-URL.
        </p>
      </div>

      <div className="w-full motion-safe:animate-[fadeInUp_380ms_ease-out]">
        <label htmlFor="linkedin-phone" className="sr-only">
          Telefoonnummer
        </label>
        <input
          id="linkedin-phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefoonnummer *"
          className={`${inputBase} border-blue-200`}
        />
      </div>

      <div className="flex flex-col items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full flex justify-center items-center gap-3 rounded-full bg-slate-900 px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_28px_-10px_rgba(10,15,61,0.55)] ring-1 ring-white/10 transition-all duration-200 hover:bg-slate-800 hover:shadow-[0_18px_36px_-12px_rgba(10,15,61,0.65)] md:hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-slate-900"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Versturen…" : "Sollicitatie afronden"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="text-[13px] font-medium text-white/80 underline-offset-4 hover:text-white hover:underline transition-colors"
        >
          Terug
        </button>
      </div>

      {error && (
        <p className="text-center text-[13px] text-red-500">{error}</p>
      )}
    </form>
  );
}
