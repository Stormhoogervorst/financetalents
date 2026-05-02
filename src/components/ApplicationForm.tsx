"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, Upload, X, FileText } from "lucide-react";
import {
  sanitizeLinkedInProfileUrl,
  isValidLinkedInInUrl,
} from "@/lib/linkedin-profile-url";
import { RecaptchaCheckbox } from "@/components/recaptcha/RecaptchaCheckbox";
import { useRecaptcha } from "@/hooks/useRecaptcha";

interface Props {
  jobId: string;
  jobTitle: string;
  firmName: string;
}

const MAX_WORDS = 500;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export default function ApplicationForm({ jobId, jobTitle, firmName }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("");
  const [studyField, setStudyField] = useState("");
  const [motivation, setMotivation] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { widgetKey: recaptchaWidgetKey, token: recaptchaToken, setToken: setRecaptchaToken, reset: resetRecaptcha, siteKeyConfigured } =
    useRecaptcha();
  const recaptchaRequired = siteKeyConfigured;

  const wordCount = countWords(motivation);
  const wordsOver = wordCount > MAX_WORDS;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setFileError(null);
      if (!file) { setCvFile(null); return; }
      if (file.type !== "application/pdf") {
        setFileError("Alleen PDF-bestanden zijn toegestaan.");
        e.target.value = "";
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setFileError("Bestand is te groot. Maximum is 5 MB.");
        e.target.value = "";
        return;
      }
      setCvFile(file);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (wordsOver) {
      setError(`Je motivatie bevat ${wordCount} woorden. Maximum is ${MAX_WORDS}.`);
      return;
    }
    if (!cvFile) {
      setError("Upload je CV als PDF.");
      return;
    }

    const linkedInTrimmed = linkedInUrl.trim();
    const linkedInClean = linkedInTrimmed
      ? sanitizeLinkedInProfileUrl(linkedInTrimmed)
      : "";
    if (linkedInTrimmed && !isValidLinkedInInUrl(linkedInClean)) {
      setError(
        "Voer een geldige LinkedIn-profiel-URL in (https://www.linkedin.com/in/…), of laat het veld leeg."
      );
      return;
    }
    if (linkedInClean) setLinkedInUrl(linkedInClean);

    if (recaptchaRequired && !recaptchaToken) {
      setError("Voltooi de reCAPTCHA-verificatie.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("firstName", firstName.trim());
    formData.append("lastName", lastName.trim());
    formData.append("email", email.trim());
    formData.append("phone", phone.trim());
    formData.append("university", university.trim());
    formData.append("studyField", studyField.trim());
    formData.append("motivation", motivation.trim());
    formData.append("linkedInUrl", linkedInClean);
    formData.append("cv", cvFile);
    if (recaptchaToken) {
      formData.append("recaptchaToken", recaptchaToken);
    }

    try {
      const res = await fetch("/api/apply", { method: "POST", body: formData });

      let data: { success?: boolean; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        console.error("[ApplicationForm] Response was not JSON. Status:", res.status);
        setError(`Serverfout (${res.status}). Probeer het opnieuw.`);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        setError(data.error ?? "Er is iets misgegaan. Probeer het opnieuw.");
        resetRecaptcha();
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch (err) {
      console.error("[ApplicationForm] Fetch error:", err);
      setError("Geen verbinding. Controleer je internet en probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full bg-transparent border-0 border-b border-[#CCCCCC] py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200";

  if (success) {
    return (
      <div className="max-w-[640px] pt-8">
        <div className="w-12 h-12 rounded-full bg-[#587DFE] mb-6 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3
          className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A] mb-4"
          style={{ fontSize: "clamp(24px, 2.5vw, 36px)" }}
        >
          Je sollicitatie is verstuurd
        </h3>
        <p
          style={{
            fontSize: "clamp(15px, 1.1vw, 17px)",
            lineHeight: 1.65,
            color: "#6B6B6B",
          }}
        >
          Je sollicitatie voor <strong className="text-[#0A0A0A] font-semibold">{jobTitle}</strong> bij{" "}
          <strong className="text-[#0A0A0A] font-semibold">{firmName}</strong> is in goede orde
          ontvangen. Je krijgt een bevestiging per e-mail.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[640px] space-y-8"
    >
      {/* Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label htmlFor="apply-firstname" className="sr-only">
            Voornaam
          </label>
          <input
            id="apply-firstname"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Voornaam *"
            className={inputBase}
          />
        </div>
        <div>
          <label htmlFor="apply-lastname" className="sr-only">
            Achternaam
          </label>
          <input
            id="apply-lastname"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Achternaam *"
            className={inputBase}
          />
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label htmlFor="apply-email" className="sr-only">
            E-mailadres
          </label>
          <input
            id="apply-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mailadres *"
            className={inputBase}
          />
        </div>
        <div>
          <label htmlFor="apply-phone" className="sr-only">
            Telefoonnummer
          </label>
          <input
            id="apply-phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefoonnummer *"
            className={inputBase}
          />
        </div>
      </div>

      {/* LinkedIn */}
      <div>
        <label htmlFor="apply-linkedin" className="sr-only">
          LinkedIn-profiel
        </label>
        <input
          id="apply-linkedin"
          type="url"
          inputMode="url"
          value={linkedInUrl}
          onChange={(e) =>
            setLinkedInUrl(sanitizeLinkedInProfileUrl(e.target.value))
          }
          placeholder="LinkedIn-profiel (optioneel)"
          className={inputBase}
        />
      </div>

      {/* University + Study */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label htmlFor="apply-university" className="sr-only">
            Universiteit
          </label>
          <input
            id="apply-university"
            type="text"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="Universiteit"
            className={inputBase}
          />
        </div>
        <div>
          <label htmlFor="apply-studyfield" className="sr-only">
            Studierichting
          </label>
          <input
            id="apply-studyfield"
            type="text"
            value={studyField}
            onChange={(e) => setStudyField(e.target.value)}
            placeholder="Studierichting"
            className={inputBase}
          />
        </div>
      </div>

      {/* Motivation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="apply-motivation" className="sr-only">
            Motivatie
          </label>
          <span
            className={`text-[13px] font-medium tracking-[0.02em] ${
              wordsOver ? "text-red-500" : "text-[#999999]"
            }`}
          >
            {wordCount} / {MAX_WORDS} woorden
          </span>
        </div>
        <textarea
          id="apply-motivation"
          required
          rows={6}
          value={motivation}
          onChange={(e) => setMotivation(e.target.value)}
          placeholder="Vertel waarom je solliciteert en wat je te bieden hebt… *"
          className={`w-full bg-transparent border-0 border-b ${
            wordsOver ? "border-red-400" : "border-[#CCCCCC]"
          } py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200 resize-none`}
        />
        {wordsOver && (
          <p className="mt-2 text-[13px] text-red-500">
            Je motivatie is te lang. Verwijder {wordCount - MAX_WORDS} woord
            {wordCount - MAX_WORDS !== 1 ? "en" : ""}.
          </p>
        )}
      </div>

      {/* CV upload */}
      <div>
        <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999] uppercase mb-3">
          CV uploaden *
        </p>

        {cvFile ? (
          <div className="flex items-center gap-4 border-b border-[#E5E5E5] pb-4">
            <FileText className="h-5 w-5 text-[#999999] shrink-0" />
            <span className="text-[15px] text-[#0A0A0A] flex-1 truncate">
              {cvFile.name}
            </span>
            <span className="text-[13px] text-[#999999]">
              {(cvFile.size / 1024 / 1024).toFixed(1)} MB
            </span>
            <button
              type="button"
              onClick={() => {
                setCvFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="p-1 text-[#999999] hover:text-[#0A0A0A] transition-colors duration-200"
              aria-label="CV verwijderen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-4 border-b border-[#CCCCCC] pb-4 cursor-pointer group hover:border-[#0A0A0A] transition-colors duration-200">
            <Upload className="h-5 w-5 text-[#999999] group-hover:text-[#0A0A0A] transition-colors duration-200 shrink-0" />
            <span className="text-[15px] text-[#999999] group-hover:text-[#0A0A0A] transition-colors duration-200">
              Klik om je CV te uploaden (PDF, max 5 MB)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {fileError && (
          <p className="mt-2 text-[13px] text-red-500">{fileError}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border-b border-red-300 pb-4">
          <p className="text-[14px] text-red-500">{error}</p>
        </div>
      )}

      <RecaptchaCheckbox
        widgetKey={recaptchaWidgetKey}
        onChange={setRecaptchaToken}
        className="flex justify-start mb-4"
      />

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={loading || wordsOver}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Versturen…" : "Sollicitatie versturen"}
        </button>
        <p className="mt-4 text-[13px] text-[#999999]">
          Geen account nodig · Je gegevens worden alleen doorgestuurd aan{" "}
          {firmName || "de werkgever"}.
        </p>
      </div>
    </form>
  );
}
