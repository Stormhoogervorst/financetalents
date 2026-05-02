"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  KeyRound,
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";

interface Props {
  hasFirm: boolean;
  isOwner: boolean;
  initialNotificationEmail?: string;
  initialCcEmails?: string[];
}

const MAX_CC_EMAILS = 20;
// Lightweight client-side e-mail check. The backend re-validates with zod.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export default function SettingsClient({
  hasFirm,
  isOwner,
  initialNotificationEmail = "",
  initialCcEmails = [],
}: Props) {
  const supabase = createClient();

  // ── Wachtwoord ────────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwStatus, setPwStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [pwMessage, setPwMessage] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus("error");
      setPwMessage("De wachtwoorden komen niet overeen.");
      return;
    }
    if (newPassword.length < 8) {
      setPwStatus("error");
      setPwMessage("Wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }

    setPwLoading(true);
    setPwStatus("idle");

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPwStatus("error");
      setPwMessage(error.message);
    } else {
      setPwStatus("success");
      setPwMessage("Wachtwoord succesvol gewijzigd.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPwLoading(false);
  };

  // ── E-mailinstellingen ────────────────────────────────────────────────────
  const [notifEmail, setNotifEmail] = useState(initialNotificationEmail);
  const [ccEmails, setCcEmails] = useState<string[]>(() =>
    initialCcEmails.map(normalizeEmail).filter((e) => EMAIL_RE.test(e))
  );
  const [ccDraft, setCcDraft] = useState("");
  const [ccError, setCcError] = useState<string | null>(null);

  const [emailLoading, setEmailLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [emailMessage, setEmailMessage] = useState("");

  const baselineCcEmails = useMemo(
    () => initialCcEmails.map(normalizeEmail).filter((e) => EMAIL_RE.test(e)),
    [initialCcEmails]
  );

  const isDirty =
    notifEmail.trim() !== initialNotificationEmail ||
    !arraysEqual(ccEmails, baselineCcEmails);

  const addCcEmail = () => {
    const candidate = normalizeEmail(ccDraft);
    if (!candidate) {
      setCcError("Voer een e-mailadres in.");
      return;
    }
    if (!EMAIL_RE.test(candidate)) {
      setCcError("Ongeldig e-mailadres.");
      return;
    }
    if (ccEmails.includes(candidate)) {
      setCcError("Dit adres staat al in de lijst.");
      return;
    }
    if (ccEmails.length >= MAX_CC_EMAILS) {
      setCcError(`Maximaal ${MAX_CC_EMAILS} CC-adressen.`);
      return;
    }
    setCcEmails((prev) => [...prev, candidate]);
    setCcDraft("");
    setCcError(null);
  };

  const removeCcEmail = (email: string) => {
    setCcEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleCcKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter or comma adds the current draft to the list.
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCcEmail();
    }
  };

  const handleEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailStatus("idle");

    const trimmedNotif = notifEmail.trim();

    // Only send fields that actually changed compared to what's saved.
    // Primary empty is ignored (notification_email is NOT NULL in the DB).
    const updates: Record<string, unknown> = {};
    if (trimmedNotif && trimmedNotif !== initialNotificationEmail) {
      updates.notification_email = trimmedNotif;
    }
    if (!arraysEqual(ccEmails, baselineCcEmails)) {
      updates.cc_emails = ccEmails;
    }

    if (Object.keys(updates).length === 0) {
      setEmailStatus("error");
      setEmailMessage("Niets om op te slaan — wijzig minimaal één veld.");
      setEmailLoading(false);
      return;
    }

    const res = await fetch("/api/firms/me", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setEmailStatus("error");
      setEmailMessage(
        typeof json?.error === "string" && json.error
          ? json.error
          : "Opslaan mislukt."
      );
    } else {
      setEmailStatus("success");
      setEmailMessage("E-mailinstellingen opgeslagen.");
    }
    setEmailLoading(false);
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Instellingen</h1>
        <p className="text-sm text-gray-500 mt-1">
          Beheer je accountinstellingen
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Wachtwoord wijzigen */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center">
              <KeyRound className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-black">
                Wachtwoord wijzigen
              </h2>
              <p className="text-xs text-gray-400">Minimaal 8 tekens</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nieuw wachtwoord
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bevestig nieuw wachtwoord
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {pwStatus !== "idle" && (
              <div
                className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                  pwStatus === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {pwStatus === "success" ? (
                  <CheckCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                {pwMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="btn-primary"
            >
              {pwLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {pwLoading ? "Opslaan…" : "Wachtwoord wijzigen"}
            </button>
          </form>
        </section>

        {hasFirm && isOwner && (
          <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-black">
                  E-mailinstellingen
                </h2>
                <p className="text-xs text-gray-400">
                  Ontvang sollicitaties op het juiste adres
                </p>
              </div>
            </div>

            <form onSubmit={handleEmailSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primair notificatie-e-mailadres
                </label>
                <input
                  type="email"
                  placeholder="werkgever@voorbeeld.nl"
                  value={notifEmail}
                  onChange={(e) => setNotifEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Extra CC-e-mailadressen{" "}
                  <span className="text-gray-400 font-normal">(optioneel)</span>
                </label>

                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="extra@werkgever.nl"
                    value={ccDraft}
                    onChange={(e) => {
                      setCcDraft(e.target.value);
                      if (ccError) setCcError(null);
                    }}
                    onKeyDown={handleCcKeyDown}
                    aria-invalid={ccError ? true : undefined}
                    aria-describedby={ccError ? "cc-email-error" : undefined}
                    className="flex-1 min-w-0 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addCcEmail}
                    disabled={
                      !ccDraft.trim() || ccEmails.length >= MAX_CC_EMAILS
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Toevoegen
                  </button>
                </div>

                {ccError && (
                  <p
                    id="cc-email-error"
                    className="mt-1.5 text-xs text-red-600"
                  >
                    {ccError}
                  </p>
                )}

                <p className="mt-1.5 text-xs text-gray-400">
                  Elk adres hier ontvangt een kopie (CC) van elke sollicitatie.
                  Tip: druk op Enter om snel toe te voegen.
                </p>

                {ccEmails.length > 0 && (
                  <ul className="flex flex-col gap-2 mt-4">
                    {ccEmails.map((email) => (
                      <li
                        key={email}
                        className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2"
                      >
                        <span className="text-sm text-black truncate">
                          {email}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCcEmail(email)}
                          aria-label={`${email} verwijderen`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {emailStatus !== "idle" && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${
                    emailStatus === "success"
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {emailStatus === "success" ? (
                    <CheckCircle className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {emailMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={emailLoading || !isDirty}
                className="btn-primary"
              >
                {emailLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {emailLoading ? "Opslaan…" : "E-mailinstellingen opslaan"}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
