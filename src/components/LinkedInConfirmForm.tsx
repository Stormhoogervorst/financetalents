"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, AlertCircle, Upload, FileText, X } from "lucide-react";
import {
  sanitizeLinkedInProfileUrl,
  isValidLinkedInInUrl,
} from "@/lib/linkedin-profile-url";
import { RecaptchaCheckbox } from "@/components/recaptcha/RecaptchaCheckbox";
import { useRecaptcha } from "@/hooks/useRecaptcha";

interface Props {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  firmName: string;
  fullName: string;
  email: string;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

interface FieldErrors {
  linkedinUrl: string | null;
  phone: string | null;
  cv: string | null;
}

export default function LinkedInConfirmForm({
  jobId,
  jobSlug,
  jobTitle,
  firmName,
  fullName,
  email,
}: Props) {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({
    linkedinUrl: null,
    phone: null,
    cv: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    widgetKey: recaptchaWidgetKey,
    token: recaptchaToken,
    setToken: setRecaptchaToken,
    reset: resetRecaptcha,
    siteKeyConfigured,
  } = useRecaptcha();
  const recaptchaRequired = siteKeyConfigured;

  const hasFieldErrors = !!(errors.linkedinUrl || errors.phone || errors.cv);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setFileError(null);
      if (!file) { setCvFile(null); return; }
      const allowed = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowed.includes(file.type) && !/\.(pdf|doc|docx)$/i.test(file.name)) {
        setFileError("Alleen PDF of Word-bestanden zijn toegestaan.");
        e.target.value = "";
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setFileError("Bestand is te groot. Maximum is 5 MB.");
        e.target.value = "";
        return;
      }
      setCvFile(file);
      setErrors((prev) => ({ ...prev, cv: null }));
    },
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setSubmitted(true);

    const newErrors: FieldErrors = { linkedinUrl: null, phone: null, cv: null };

    const cleaned = sanitizeLinkedInProfileUrl(linkedinUrl);
    if (!linkedinUrl.trim()) {
      newErrors.linkedinUrl = "Vul je LinkedIn profiel-URL in.";
    } else if (!isValidLinkedInInUrl(cleaned)) {
      newErrors.linkedinUrl =
        "URL moet een openbaar profiel zijn: https://www.linkedin.com/in/…";
    }

    if (!phone.trim()) {
      newErrors.phone = "Vul je telefoonnummer in.";
    }

    if (!cvFile) {
      newErrors.cv = "Upload je CV om verder te gaan.";
    }

    setErrors(newErrors);
    if (newErrors.linkedinUrl || newErrors.phone || newErrors.cv) return;

    setLinkedinUrl(cleaned);
    setPhone(phone.trim());
    if (recaptchaRequired && !recaptchaToken) {
      setServerError("Voltooi de reCAPTCHA-verificatie.");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("linkedinUrl", cleaned);
      formData.append("phone", phone.trim());
      formData.append("cv", cvFile!);
      if (recaptchaToken) {
        formData.append("recaptchaToken", recaptchaToken);
      }

      const res = await fetch("/api/auth/linkedin-apply/confirm", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setServerError(data.error ?? "Er is iets misgegaan.");
        resetRecaptcha();
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("Geen verbinding. Probeer het opnieuw.");
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-[640px]">
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
        <h2
          className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A] mb-4"
          style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
        >
          Je sollicitatie is verstuurd
        </h2>
        <p
          style={{
            fontSize: "clamp(15px, 1.1vw, 17px)",
            lineHeight: 1.65,
            color: "#6B6B6B",
          }}
        >
          Je sollicitatie voor{" "}
          <strong className="text-[#0A0A0A] font-semibold">{jobTitle}</strong>{" "}
          bij{" "}
          <strong className="text-[#0A0A0A] font-semibold">{firmName}</strong>{" "}
          is in goede orde ontvangen. De werkgever neemt contact met je op.
        </p>
        <a href={`/vacature/${jobSlug}`} className="btn-primary mt-8">
          Terug naar vacature
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-[640px]">
      <h1
        className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A] mb-4"
        style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
      >
        Bevestig je gegevens
      </h1>
      <p
        className="mb-10"
        style={{
          fontSize: "clamp(15px, 1.1vw, 17px)",
          lineHeight: 1.65,
          color: "#6B6B6B",
        }}
      >
        Sollicitatie voor{" "}
        <strong className="text-[#0A0A0A] font-semibold">{jobTitle}</strong> bij{" "}
        {firmName}
      </p>

      <div className="border-t border-[#E5E5E5] pt-8 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999] uppercase mb-1.5">
              Naam
            </p>
            <p className="text-[15px] font-medium text-[#0A0A0A]">{fullName}</p>
          </div>
          <div>
            <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999] uppercase mb-1.5">
              E-mail
            </p>
            <p className="text-[15px] font-medium text-[#0A0A0A]">{email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="linkedin-url" className="sr-only">
            LinkedIn profiel-URL
          </label>
          <input
            id="linkedin-url"
            type="url"
            value={linkedinUrl}
            onChange={(e) => {
              setLinkedinUrl(sanitizeLinkedInProfileUrl(e.target.value));
              if (errors.linkedinUrl)
                setErrors((prev) => ({ ...prev, linkedinUrl: null }));
            }}
            placeholder="LinkedIn profiel-URL *"
            className={`w-full bg-transparent border-0 border-b ${
              errors.linkedinUrl ? "border-red-600" : "border-[#CCCCCC]"
            } py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200`}
          />

          {errors.linkedinUrl && (
            <p className="flex items-center gap-1.5 text-[13px] text-red-600 mt-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.linkedinUrl}
            </p>
          )}

          <p className="mt-3 text-[13px] text-[#999999] leading-relaxed">
            Ga naar{" "}
            <a
              href="https://www.linkedin.com/in/me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#587DFE] border-b border-[#587DFE] hover:opacity-80 transition-opacity"
            >
              linkedin.com/in/me
            </a>{" "}
            en kopieer de URL uit je adresbalk.
          </p>
        </div>

        <div>
          <label htmlFor="phone" className="sr-only">
            Telefoonnummer
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone)
                setErrors((prev) => ({ ...prev, phone: null }));
            }}
            placeholder="Telefoonnummer *"
            className={`w-full bg-transparent border-0 border-b ${
              errors.phone ? "border-red-600" : "border-[#CCCCCC]"
            } py-3 text-[15px] text-[#0A0A0A] placeholder-[#999999] focus:outline-none focus:border-[#0A0A0A] transition-colors duration-200`}
          />

          {errors.phone && (
            <p className="flex items-center gap-1.5 text-[13px] text-red-600 mt-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* CV upload */}
        <div>
          <p className="text-[13px] font-medium tracking-[0.02em] text-[#999999] uppercase mb-3">
            CV / Curriculum Vitae *
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
            <label
              className={`flex items-center gap-4 border-b ${
                errors.cv ? "border-red-600" : "border-[#CCCCCC]"
              } pb-4 cursor-pointer group hover:border-[#0A0A0A] transition-colors duration-200`}
            >
              <Upload
                className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                  errors.cv
                    ? "text-red-600"
                    : "text-[#999999] group-hover:text-[#0A0A0A]"
                }`}
              />
              <span
                className={`text-[15px] transition-colors duration-200 ${
                  errors.cv
                    ? "text-red-600"
                    : "text-[#999999] group-hover:text-[#0A0A0A]"
                }`}
              >
                Klik om je CV te uploaden
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          <p className="mt-2 text-[13px] text-[#999999]">
            Upload je CV in PDF of Word formaat (max 5MB)
          </p>

          {errors.cv && (
            <p className="flex items-center gap-1.5 text-[13px] text-red-600 mt-1">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {errors.cv}
            </p>
          )}

          {fileError && (
            <p className="mt-1 text-[13px] text-red-600">{fileError}</p>
          )}
        </div>

        <div
          className={`border-b pb-4 ${
            serverError ? "border-red-300" : "border-transparent"
          }`}
          aria-live="polite"
        >
          <RecaptchaCheckbox
            widgetKey={recaptchaWidgetKey}
            onChange={setRecaptchaToken}
            className="flex justify-start mb-4"
          />
          {serverError && (
            <p className="text-[14px] text-red-600">{serverError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn-primary transition-opacity ${
            submitted && hasFieldErrors
              ? "opacity-50 cursor-not-allowed"
              : ""
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Versturen…" : "Sollicitatie verzenden"}
        </button>
      </form>
    </div>
  );
}
