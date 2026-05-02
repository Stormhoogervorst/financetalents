"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Globe,
  Linkedin,
} from "lucide-react";
import { RECHTSGEBIEDEN_MET_OVERIG } from "@/lib/constants/rechtsgebieden";

// ─── Constants ────────────────────────────────────────────────────────────────

// Bedrijfsgrootte (juridische markt). De value wordt opgeslagen in
// firms.team_size; het label wordt in de dropdown getoond.
const TEAM_SIZE_OPTIONS = [
  { value: "1-5", label: "1 - 5 medewerkers" },
  { value: "6-20", label: "6 - 20 medewerkers" },
  { value: "21-50", label: "21 - 50 medewerkers" },
  { value: "51-100", label: "51 - 100 medewerkers" },
  { value: "100+", label: "100+ medewerkers" },
] as const;

type TeamSizeValue = (typeof TEAM_SIZE_OPTIONS)[number]["value"];

// ─── Types ────────────────────────────────────────────────────────────────────

type Firm = {
  id: string;
  slug: string;
  name: string;
  location: string;
  practice_areas: string[];
  description: string;
  contact_person: string;
  notification_email: string;
  logo_url: string | null;
  why_work_with_us: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  salary_indication: string | null;
  team_size: string | null;
  is_published: boolean;
} | null;

type Props = {
  firm: Firm;
  userId: string;
  userEmail: string;
  isImpersonating?: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const rand = Math.random().toString(36).substring(2, 8);
  return `${base}-${rand}`;
}

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

// ─── Input & Label helpers ────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors";

const labelCls = "block text-sm font-medium text-gray-700 mb-1";

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfileForm({
  firm,
  userId,
  userEmail,
  isImpersonating = false,
}: Props) {
  // `userId` is the session user's id. It is NOT used for the storage
  // write path anymore — during impersonation the session user is the
  // admin, so writing to `${userId}/logo.ext` would pollute the admin's
  // storage and (previously) caused a duplicate firm to be created. The
  // logo upload now goes through `/api/firms/me/logo`, which derives the
  // correct target firm + owner on the server.
  void userId;

  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Form state — initialise from existing firm or empty defaults
  const [name, setName] = useState(firm?.name ?? "");
  const [location, setLocation] = useState(firm?.location ?? "");
  const [practiceAreas, setPracticeAreas] = useState<string[]>(
    firm?.practice_areas ?? []
  );
  const [description, setDescription] = useState(firm?.description ?? "");
  const [contactPerson, setContactPerson] = useState(
    firm?.contact_person ?? ""
  );
  const [notificationEmail, setNotificationEmail] = useState(
    firm?.notification_email ?? userEmail
  );

  // Optional fields
  const [whyWorkWithUs, setWhyWorkWithUs] = useState(
    firm?.why_work_with_us ?? ""
  );
  const [websiteUrl, setWebsiteUrl] = useState(firm?.website_url ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(firm?.linkedin_url ?? "");
  // Alleen bekende opties voorselecteren; onbekende/legacy waarden laten we
  // leeg zodat de gebruiker een geldige optie kiest.
  const initialTeamSize =
    firm?.team_size &&
    TEAM_SIZE_OPTIONS.some((o) => o.value === firm.team_size)
      ? (firm.team_size as TeamSizeValue)
      : "";
  const [teamSize, setTeamSize] = useState<TeamSizeValue | "">(initialTeamSize);
  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    firm?.logo_url ?? null
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const wordCount = countWords(description);

  // ── Derived publication status ──────────────────────────────────────────────
  const requiredFilled =
    name.trim() !== "" &&
    location.trim() !== "" &&
    practiceAreas.length > 0 &&
    description.trim() !== "" &&
    contactPerson.trim() !== "" &&
    notificationEmail.trim() !== "";

  const missingFields = [
    !name.trim() && "Naam werkgever",
    !location.trim() && "Vestigingsplaats",
    practiceAreas.length === 0 && "Rechtsgebieden",
    !description.trim() && "Omschrijving",
    !contactPerson.trim() && "Contactpersoon",
    !notificationEmail.trim() && "Notificatie-emailadres",
  ].filter(Boolean) as string[];

  // ── Logo handlers ──────────────────────────────────────────────────────────
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSaveError("Alleen JPG, PNG of WebP bestanden zijn toegestaan.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveError("Logo mag maximaal 2 MB zijn.");
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setSaveError(null);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // ── Practice area toggle ───────────────────────────────────────────────────
  const toggleArea = (area: string) => {
    setPracticeAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    let logoUrl = firm?.logo_url ?? null;

    // Upload a new logo server-side. The server route derives the correct
    // target firm (also when impersonating), so we never rely on the
    // session user id alone — that was what caused a duplicate firm to be
    // created when an admin uploaded a logo while impersonating.
    if (logoFile) {
      const fd = new FormData();
      fd.append("file", logoFile);

      const uploadRes = await fetch("/api/firms/me/logo", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!uploadRes.ok) {
        const json = await uploadRes.json().catch(() => ({}));
        setSaveError(
          typeof json?.error === "string" && json.error
            ? json.error
            : "Logo uploaden mislukt."
        );
        setSaving(false);
        return;
      }

      const json = (await uploadRes.json()) as { logo_url?: string };
      logoUrl = json.logo_url ?? logoUrl;
    } else if (logoPreview === null) {
      // User explicitly removed the logo
      logoUrl = null;
    }

    // firmId / user_id / slug are authoritative on the server — never
    // forwarded from the client for the WHERE clause. The server reads
    // the impersonation cookie to resolve the target firm.
    const payload = {
      name: name.trim(),
      location: location.trim(),
      practice_areas: practiceAreas,
      description: description.trim(),
      contact_person: contactPerson.trim(),
      notification_email: notificationEmail.trim(),
      logo_url: logoUrl,
      why_work_with_us: whyWorkWithUs.trim() || null,
      website_url: websiteUrl.trim() || null,
      linkedin_url: linkedinUrl.trim() || null,
      team_size: teamSize || null,
    };

    const res = await fetch("/api/firms/me", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      if (res.status === 403) {
        setSaveError(
          typeof json?.error === "string" && json.error
            ? json.error
            : "Geen toegang: je kunt alleen je eigen werkgeversprofiel bewerken."
        );
      } else {
        setSaveError(json?.error ?? "Opslaan mislukt.");
      }
      setSaving(false);
      return;
    }

    setSaveSuccess(true);
    setSaving(false);

    // Tijdens impersonatie blijft de admin op het profielscherm zodat de
    // update direct zichtbaar geverifieerd kan worden. In de normale
    // gebruikersflow gaat de werkgever terug naar het portaal.
    if (isImpersonating) {
      router.refresh();
    } else {
      router.push("/portal");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* ── Publication status badge ──────────────────────────────── */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${
          requiredFilled
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-yellow-50 border-yellow-200 text-yellow-700"
        }`}
      >
        {requiredFilled ? (
          <>
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>
              Profiel is live —{" "}
              <span className="font-normal">zichtbaar voor studenten op Legal Talents</span>
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              Profiel nog niet zichtbaar —{" "}
              <span className="font-normal">
                vul alle verplichte velden in:{" "}
                {missingFields.join(", ")}
              </span>
            </span>
          </>
        )}
      </div>

      {/* ── Verplichte velden ─────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-black">
          Verplichte informatie
        </h2>

        {/* Naam werkgever */}
        <div>
          <label className={labelCls}>
            Naam werkgever <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Bijv. Van der Berg Advocaten"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Vestigingsplaats */}
        <div>
          <label className={labelCls}>
            Vestigingsplaats <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Bijv. Amsterdam"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Rechtsgebieden */}
        <div>
          <label className={labelCls}>
            Rechtsgebieden <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Selecteer één of meerdere rechtsgebieden
          </p>
          <div className="flex flex-wrap gap-2">
            {RECHTSGEBIEDEN_MET_OVERIG.map((area) => {
              const selected = practiceAreas.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    selected
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
          {practiceAreas.length === 0 && (
            <p className="mt-2 text-xs text-red-500">
              Selecteer minimaal één rechtsgebied
            </p>
          )}
        </div>

        {/* Omschrijving */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls.replace("mb-1", "")}>
              Korte omschrijving <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs ${
                wordCount > 300 ? "text-red-500 font-semibold" : "text-gray-400"
              }`}
            >
              {wordCount} / 300 woorden
            </span>
          </div>
          <textarea
            required
            rows={5}
            placeholder="Beschrijf de werkgever in max. 300 woorden. Denk aan specialisaties, cultuur en type zaken."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputCls} resize-none`}
          />
          {wordCount > 300 && (
            <p className="mt-1 text-xs text-red-500">
              Omschrijving is te lang — verwijder {wordCount - 300} woord
              {wordCount - 300 !== 1 ? "en" : ""}.
            </p>
          )}
        </div>

        {/* Contactpersoon */}
        <div>
          <label className={labelCls}>
            Contactpersoon platform <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Voornaam Achternaam"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Notificatie-email */}
        <div>
          <label className={labelCls}>
            Notificatie-emailadres <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="sollicitaties@werkgever.nl"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-gray-400">
            Sollicitaties worden naar dit adres verstuurd
          </p>
        </div>
      </section>

      {/* ── Optionele velden ──────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-black">
          Extra informatie{" "}
          <span className="text-sm font-normal text-gray-400">(optioneel)</span>
        </h2>

        {/* Logo upload */}
        <div>
          <label className={labelCls}>Logo</label>
          {logoPreview ? (
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                >
                  <Upload className="h-4 w-4" />
                  Ander logo kiezen
                </button>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="flex items-center gap-2 text-sm text-red-500 hover:underline"
                >
                  <X className="h-4 w-4" />
                  Logo verwijderen
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-xl py-8 text-sm text-gray-400 hover:border-primary hover:text-primary transition-colors"
            >
              <Upload className="h-5 w-5" />
              Klik om een logo te uploaden
            </button>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleLogoChange}
            className="hidden"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            JPG, PNG of WebP · max. 2 MB
          </p>
        </div>

        {/* Waarom bij ons werken */}
        <div>
          <label className={labelCls}>Waarom bij ons werken?</label>
          <textarea
            rows={4}
            placeholder="Vertel wat jullie onderscheidt als werkgever. Denk aan cultuur, doorgroei, type werk…"
            value={whyWorkWithUs}
            onChange={(e) => setWhyWorkWithUs(e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Bedrijfsgrootte */}
        <div>
          <label className={labelCls}>Bedrijfsgrootte</label>
          <select
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value as TeamSizeValue | "")}
            className={inputCls}
          >
            <option value="">Kies bedrijfsgrootte…</option>
            {TEAM_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Geef het aantal medewerkers op zodat kandidaten weten wat voor
            werkgever jullie zijn.
          </p>
        </div>

        {/* Website */}
        <div>
          <label className={labelCls}>Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              placeholder="https://www.werkgever.nl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className={`${inputCls} pl-9`}
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className={labelCls}>LinkedIn</label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              placeholder="https://linkedin.com/company/werkgever"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className={`${inputCls} pl-9`}
            />
          </div>
        </div>

      </section>

      {/* ── Save feedback + button ────────────────────────────────── */}
      {saveError && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Profiel opgeslagen{requiredFilled ? " en live gezet!" : "."}
        </div>
      )}

      <div className="flex items-center justify-between pb-4">
        <p className="text-xs text-gray-400">
          <span className="text-red-500">*</span> Verplicht veld
        </p>
        <button
          type="submit"
          disabled={saving || wordCount > 300}
          className="btn-primary"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Opslaan…" : "Profiel opslaan"}
        </button>
      </div>
    </form>
  );
}
