"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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

// Company size options for the finance market. The value is stored in
// firms.team_size; het label wordt in de dropdown getoond.
const TEAM_SIZE_OPTIONS = [
  { value: "1-5", label: "1 – 5 employees" },
  { value: "6-20", label: "6 – 20 employees" },
  { value: "21-50", label: "21 – 50 employees" },
  { value: "51-100", label: "51 – 100 employees" },
  { value: "100+", label: "100+ employees" },
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
const LOGO_BUCKETS = ["logo's", "logos"] as const;

function isBucketNotFound(error: { message?: string } | null) {
  return error?.message?.toLowerCase().includes("bucket not found") ?? false;
}

function isStoragePolicyError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("row-level security") ||
    message.includes("violates row-level security") ||
    message.includes("permission denied")
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfileForm({
  firm,
  userId,
  userEmail,
  isImpersonating = false,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
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
    !name.trim() && "Company name",
    !location.trim() && "Location",
    practiceAreas.length === 0 && "Sectors",
    !description.trim() && "Description",
    !contactPerson.trim() && "Contact person",
    !notificationEmail.trim() && "Notification email",
  ].filter(Boolean) as string[];

  // ── Logo handlers ──────────────────────────────────────────────────────────
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSaveError("Only JPG, PNG or WebP files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveError("Logo must be 2 MB or smaller.");
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

  const uploadLogoWithStorageClient = async (file: File): Promise<string> => {
    const extFromType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const ext =
      extFromType[file.type] ??
      (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const path = `${userId}/logo.${ext}`;

    let lastBucketError: string | null = null;

    for (const bucket of LOGO_BUCKETS) {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
        });

      if (!uploadError) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return `${data.publicUrl}?v=${Date.now()}`;
      }

      if (!isBucketNotFound(uploadError)) {
        throw new Error(uploadError.message);
      }

      lastBucketError = uploadError.message;
    }

    throw new Error(
      lastBucketError ??
        `No logo bucket found. Tried: ${LOGO_BUCKETS.join(", ")}.`
    );
  };

  const uploadLogoServerSide = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);

    const uploadRes = await fetch("/api/firms/me/logo", {
      method: "POST",
      credentials: "include",
      body: fd,
    });

    if (!uploadRes.ok) {
      const json = await uploadRes.json().catch(() => ({}));
      throw new Error(
        typeof json?.error === "string" && json.error
          ? json.error
          : "Logo upload failed."
      );
    }

    const json = (await uploadRes.json()) as { logo_url?: string };
    if (!json.logo_url) {
      throw new Error("Logo upload failed: missing public URL.");
    }

    return json.logo_url;
  };

  // ── Save handler ───────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    let logoUrl = firm?.logo_url ?? null;

    if (logoFile) {
      try {
        if (isImpersonating) {
          logoUrl = await uploadLogoServerSide(logoFile);
        } else {
          try {
            logoUrl = await uploadLogoWithStorageClient(logoFile);
          } catch (error) {
            if (!isStoragePolicyError(error)) throw error;
            logoUrl = await uploadLogoServerSide(logoFile);
          }
        }
      } catch (error) {
        setSaveError(
          error instanceof Error && error.message
            ? `Logo upload failed: ${error.message}`
            : "Logo upload failed."
        );
        setSaving(false);
        return;
      }
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
            : "No access: you can only edit your own company profile."
        );
      } else {
        setSaveError(json?.error ?? "Save failed.");
      }
      setSaving(false);
      return;
    }

    setSaveSuccess(true);
    setSaving(false);

    // Tijdens impersonatie blijft de admin op het profielscherm zodat de
    // update direct zichtbaar geverifieerd kan worden. In de normale
    // gebruikersflow gaat de company terug naar het portaal.
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
              Profile is live —{" "}
              <span className="font-normal">visible to candidates on Finance Talents</span>
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              Profile not visible yet —{" "}
              <span className="font-normal">
                fill in all required fields:{" "}
                {missingFields.join(", ")}
              </span>
            </span>
          </>
        )}
      </div>

      {/* ── Verplichte velden ─────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-black">
          Required information
        </h2>

        {/* Company name */}
        <div>
          <label className={labelCls}>
            Company name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Van der Berg Advocaten"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Location */}
        <div>
          <label className={labelCls}>
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Amsterdam"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Sectors */}
        <div>
          <label className={labelCls}>
            Sectors <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Select one or more sectors
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
              Select at least one sector
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelCls.replace("mb-1", "")}>
              Short description <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs ${
                wordCount > 300 ? "text-red-500 font-semibold" : "text-gray-400"
              }`}
            >
              {wordCount} / 300 words
            </span>
          </div>
          <textarea
            required
            rows={5}
            placeholder="Describe the company in up to 300 words. Include focus areas, culture and type of work."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${inputCls} resize-none`}
          />
          {wordCount > 300 && (
            <p className="mt-1 text-xs text-red-500">
              Description is too long — remove {wordCount - 300} word
              {wordCount - 300 !== 1 ? "s" : ""}.
            </p>
          )}
        </div>

        {/* Contact person */}
        <div>
          <label className={labelCls}>
            Contact person <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="First name Last name"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Notification email */}
        <div>
          <label className={labelCls}>
            Notification email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            placeholder="applications@company.com"
            value={notificationEmail}
            onChange={(e) => setNotificationEmail(e.target.value)}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-gray-400">
            Applications are sent to this address
          </p>
        </div>
      </section>

      {/* ── Optionele velden ──────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-black">
          Additional information{" "}
          <span className="text-sm font-normal text-gray-400">(optional)</span>
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
                  Choose another logo
                </button>
                <button
                  type="button"
                  onClick={removeLogo}
                  className="flex items-center gap-2 text-sm text-red-500 hover:underline"
                >
                  <X className="h-4 w-4" />
                  Remove logo
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
              Click to upload a logo
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
            JPG, PNG or WebP · max 2 MB
          </p>
        </div>

        {/* Waarom bij ons werken */}
        <div>
          <label className={labelCls}>Why work with us?</label>
          <textarea
            rows={4}
            placeholder="Describe what sets your company apart. Think culture, growth and type of work..."
            value={whyWorkWithUs}
            onChange={(e) => setWhyWorkWithUs(e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Company size */}
        <div>
          <label className={labelCls}>Company size</label>
          <select
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value as TeamSizeValue | "")}
            className={inputCls}
          >
            <option value="">Choose company size…</option>
            {TEAM_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Tell candidates how big your company is.
          </p>
        </div>

        {/* Website */}
        <div>
          <label className={labelCls}>Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="url"
              placeholder="https://www.company.nl"
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
              placeholder="https://linkedin.com/company/company"
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
          Profile saved{requiredFilled ? " and published." : "."}
        </div>
      )}

      <div className="flex items-center justify-between pb-4">
        <p className="text-xs text-gray-400">
          <span className="text-red-500">*</span> Required field
        </p>
        <button
          type="submit"
          disabled={saving || wordCount > 300}
          className="btn-primary"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
}
