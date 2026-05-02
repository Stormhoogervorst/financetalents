"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";

export default function UpdatePasswordPage() {
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("De wachtwoorden komen niet overeen.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Sluit de tijdelijke herstelsessie af zodat de gebruiker zich bewust
    // opnieuw moet aanmelden met zijn nieuwe wachtwoord.
    await supabase.auth.signOut();

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <Image
              src="/legal-talents-logo.png"
              alt="Legal Talents logo"
              width={150}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-black">
            {success ? "Wachtwoord gewijzigd" : "Nieuw wachtwoord instellen"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {success
              ? "Je kunt nu opnieuw inloggen met je nieuwe wachtwoord."
              : "Kies een nieuw wachtwoord voor je account"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          {success ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-base font-bold text-black mb-2">
                Je wachtwoord is succesvol gewijzigd
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Je bent uitgelogd. Log opnieuw in met je nieuwe wachtwoord om
                verder te gaan.
              </p>
              <Link href="/login" className="btn-primary w-full mt-6">
                Terug naar Inloggen
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nieuw wachtwoord
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={
                      showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  Minimaal 8 tekens
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bevestig wachtwoord
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opslaan…
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Wachtwoord opslaan
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
