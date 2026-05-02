"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";

const MIN_PASSWORD_LENGTH = 8;
// Milliseconden tot de automatische redirect naar /dashboard. Kort genoeg
// om niet te irriteren, lang genoeg om de success-melding te lezen.
const REDIRECT_DELAY_MS = 1500;

type Status = "idle" | "error" | "success";

export default function WachtwoordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  // Na succes sturen we de gebruiker automatisch door naar het dashboard.
  // De timer staat hier (in plaats van in de submit-handler) zodat hij
  // netjes wordt opgeruimd als het component eerder unmount.
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setStatus("error");
      setMessage(
        `Het wachtwoord moet minimaal ${MIN_PASSWORD_LENGTH} tekens bevatten.`
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("De wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error("[reset-password] updateUser error", error);
      setStatus("error");
      setMessage(
        error.message ||
          "Het wachtwoord kon niet worden bijgewerkt. Probeer het opnieuw."
      );
      setLoading(false);
      return;
    }

    setStatus("success");
    setMessage(
      "Wachtwoord succesvol gewijzigd. Je wordt doorgestuurd naar het dashboard…"
    );
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
  };

  const disabled = loading || status === "success";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-primary-light rounded-lg flex items-center justify-center">
          <KeyRound className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Wachtwoord wijzigen
          </h2>
          <p className="text-xs text-gray-400">
            Minimaal {MIN_PASSWORD_LENGTH} tekens
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nieuw wachtwoord
          </label>
          <div className="relative">
            <input
              id="new-password"
              name="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={MIN_PASSWORD_LENGTH}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={disabled}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Bevestig wachtwoord
          </label>
          <input
            id="confirm-password"
            name="confirm-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={disabled}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {status !== "idle" && (
          <div
            role={status === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`flex items-start gap-2 rounded-lg px-4 py-3 text-sm ${
              status === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {status === "success" ? (
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <span>{message}</span>
          </div>
        )}

        <button type="submit" disabled={disabled} className="btn-primary w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading
            ? "Opslaan…"
            : status === "success"
              ? "Doorsturen…"
              : "Wachtwoord opslaan"}
        </button>
      </form>
    </div>
  );
}
