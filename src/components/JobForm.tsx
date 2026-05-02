"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { nanoid } from "nanoid";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Bold,
  Italic,
  List,
  Shield,
} from "lucide-react";
import { RECHTSGEBIEDEN_MET_OVERIG } from "@/lib/constants/rechtsgebieden";

// ─── Constants ────────────────────────────────────────────────────────────────

const JOB_TYPES = [
  { value: "fulltime",        label: "Fulltime" },
  { value: "parttime",        label: "Parttime" },
  { value: "business-course", label: "Business Course" },
  { value: "stage",           label: "Stage" },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobData = {
  id?: string;
  title: string;
  location: string;
  type: string;
  practice_area: string;
  description: string;
  salary_indication: string | null;
  start_date: string | null;
  required_education: string | null;
  hours_per_week: number | null;
  expires_at: string | null;
  status: string;
};

type Props = {
  firmId: string;
  firmSlug: string;
  job?: JobData;
  /**
   * Admin-flow "plaats vacature namens dit bedrijf": toont een banner,
   * stuurt bij opslaan het veld `posted_by_admin: true` mee en geeft de
   * API een expliciete `firm_id` zodat de admin-server niet afhankelijk
   * is van de eigen session-firm.
   */
  postedByAdmin?: boolean;
  firmName?: string;
  /**
   * Route waar de gebruiker naartoe moet na opslaan. Default is
   * /portal/jobs; bij de admin-flow gaat de admin terug naar
   * /admin/werkgevers/[id].
   */
  returnTo?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors";

const labelCls = "block text-sm font-medium text-gray-700 mb-1";

// ─── Tiptap toolbar button ────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-primary text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JobForm({
  firmId,
  firmSlug,
  job,
  postedByAdmin = false,
  firmName,
  returnTo,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(job?.title ?? "");
  const [location, setLocation] = useState(job?.location ?? "");
  const [type, setType] = useState(job?.type ?? "");
  const [practiceArea, setPracticeArea] = useState(job?.practice_area ?? "");
  const [salaryIndication, setSalaryIndication] = useState(
    job?.salary_indication ?? ""
  );
  const [startDate, setStartDate] = useState(job?.start_date ?? "");
  const [requiredEducation, setRequiredEducation] = useState(
    job?.required_education ?? ""
  );
  const [hoursPerWeek, setHoursPerWeek] = useState<string>(
    job?.hours_per_week != null ? String(job.hours_per_week) : ""
  );
  const [expiresAt, setExpiresAt] = useState(job?.expires_at ?? "");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: job?.description ?? "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[180px] px-4 py-3 text-sm text-black focus:outline-none",
      },
    },
  });

  const handleSubmit = useCallback(
    async (targetStatus: "draft" | "active") => {
      if (!firmId) {
        setSaveError("Geen werkgever gekoppeld aan dit account. Maak eerst een bedrijfsprofiel aan.");
        return;
      }

      if (!title.trim() || !location.trim() || !type || !practiceArea) {
        setSaveError("Vul alle verplichte velden in.");
        return;
      }

      const description = editor?.getHTML() ?? "";
      if (description === "<p></p>" || description.trim() === "") {
        setSaveError("Voeg een beschrijving toe.");
        return;
      }

      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const slug = job?.id
        ? undefined
        : `${firmSlug}-${title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")}-${nanoid(6)}`;

      // firmId is provided by the server component but de API-route
      // re-derives de firm normaal gesproken uit de sessie. In de
      // admin-flow ("namens werkgever X") geven we de firm_id én de
      // `posted_by_admin` vlag expliciet mee. De server controleert dan
      // nogmaals of de user echt admin is vóór hij die velden accepteert.
      const payload = {
        title: title.trim(),
        location: location.trim(),
        type,
        practice_area: practiceArea,
        description,
        salary_indication: salaryIndication.trim() || null,
        start_date: startDate || null,
        required_education: requiredEducation.trim() || null,
        hours_per_week: hoursPerWeek ? parseInt(hoursPerWeek, 10) : null,
        expires_at: expiresAt || null,
        status: targetStatus,
        ...(slug ? { slug } : {}),
        ...(postedByAdmin
          ? { firm_id: firmId, posted_by_admin: true }
          : {}),
      };

      let res: Response;
      if (job?.id) {
        res = await fetch(`/api/jobs/${job.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setSaveError(json?.error ?? "Opslaan mislukt.");
        setSaving(false);
        return;
      }

      setSaveSuccess(true);
      setSavedStatus(targetStatus);
      setSaving(false);

      setTimeout(() => {
        router.refresh();
        router.push(returnTo ?? "/portal/jobs");
      }, 800);
    },
    [
      firmId,
      title,
      location,
      type,
      practiceArea,
      salaryIndication,
      startDate,
      requiredEducation,
      hoursPerWeek,
      expiresAt,
      editor,
      firmSlug,
      job,
      postedByAdmin,
      returnTo,
      router,
    ]
  );

  return (
    <div className="space-y-6">
      {postedByAdmin && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">
              Je plaatst namens {firmName ?? "deze werkgever"}
            </p>
            <p className="text-red-700">
              De vacature wordt gekoppeld aan het bedrijf en gemarkeerd als
              door admin geplaatst ({" "}
              <code className="rounded bg-red-100 px-1 py-0.5 text-[11px] font-mono">
                posted_by_admin
              </code>{" "}
              = true).
            </p>
          </div>
        </div>
      )}

      {/* ── Verplichte velden ─────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-black">
          Vacaturegegevens <span className="text-red-500 text-sm font-normal">* verplicht</span>
        </h2>

        {/* Vacaturetitel */}
        <div>
          <label className={labelCls}>
            Vacaturetitel <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Bijv. Juridisch stagiair arbeidsrecht"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

        {/* Type + Rechtsgebied */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>
              Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={inputCls}
            >
              <option value="">Kies type…</option>
              {JOB_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>
              Rechtsgebied <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={practiceArea}
              onChange={(e) => setPracticeArea(e.target.value)}
              className={inputCls}
            >
              <option value="">Kies rechtsgebied…</option>
              {RECHTSGEBIEDEN_MET_OVERIG.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Beschrijving (Tiptap) */}
        <div>
          <label className={labelCls}>
            Beschrijving <span className="text-red-500">*</span>
          </label>

          {/* Toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border border-gray-200 border-b-0 rounded-t-lg bg-gray-50">
            <ToolbarButton
              title="Vet"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={editor?.isActive("bold")}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Cursief"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={editor?.isActive("italic")}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <ToolbarButton
              title="Opsomming"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={editor?.isActive("bulletList")}
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
          </div>

          {/* Editor */}
          <div className="border border-gray-200 rounded-b-lg bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-colors">
            <EditorContent editor={editor} />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Beschrijf de functie, taken en wat jullie zoeken in een kandidaat.
          </p>
        </div>
      </section>

      {/* ── Optionele velden ──────────────────────────────────────── */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        <h2 className="text-lg font-semibold text-black">
          Extra informatie{" "}
          <span className="text-sm font-normal text-gray-400">(optioneel)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Salarisindicatie */}
          <div>
            <label className={labelCls}>Salarisindicatie</label>
            <input
              type="text"
              placeholder="Bijv. €500–€700 per maand"
              value={salaryIndication}
              onChange={(e) => setSalaryIndication(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Uren per week */}
          <div>
            <label className={labelCls}>Uren per week</label>
            <input
              type="number"
              min={1}
              max={60}
              placeholder="Bijv. 32"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Startdatum */}
          <div>
            <label className={labelCls}>Startdatum</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Vereiste opleiding */}
          <div>
            <label className={labelCls}>Vereiste opleiding / studierichting</label>
            <input
              type="text"
              placeholder="Bijv. HBO Rechtsgeleerdheid"
              value={requiredEducation}
              onChange={(e) => setRequiredEducation(e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Vervaldatum */}
          <div>
            <label className={labelCls}>Vervaldatum</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={inputCls}
            />
            <p className="mt-1 text-xs text-gray-400">
              Als leeg, verloopt de vacature automatisch 60 dagen na plaatsing.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feedback ─────────────────────────────────────────────── */}
      {saveError && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {savedStatus === "active"
            ? "Vacature gepubliceerd! Je wordt doorgestuurd…"
            : "Vacature opgeslagen als concept. Je wordt doorgestuurd…"}
        </div>
      )}

      {/* ── Action buttons ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pb-6">
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSubmit("draft")}
          className="btn-secondary"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Opslaan als concept
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSubmit("active")}
          className="btn-primary"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Publiceren
        </button>
      </div>
    </div>
  );
}
