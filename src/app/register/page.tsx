"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { verifyRecaptchaAction } from "@/app/actions/recaptcha";
import { RecaptchaCheckbox } from "@/components/recaptcha/RecaptchaCheckbox";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";

function RegisterContent() {
  const [firmName, setFirmName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();
  const { widgetKey: recaptchaWidgetKey, token: recaptchaToken, setToken: setRecaptchaToken, reset: resetRecaptcha, siteKeyConfigured } =
    useRecaptcha();
  const recaptchaRequired = siteKeyConfigured;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (recaptchaRequired) {
      if (!recaptchaToken) {
        setError("Voltooi de reCAPTCHA-verificatie.");
        setLoading(false);
        return;
      }
      const captcha = await verifyRecaptchaAction(recaptchaToken);
      if (!captcha.ok) {
        setError(captcha.error);
        resetRecaptcha();
        setLoading(false);
        return;
      }
    }

    const fullName = `${firstName} ${lastName}`;

    const metadata: Record<string, string> = {
      contact_person: fullName,
      full_name: fullName,
      phone,
    };

    metadata.firm_name = firmName;

    console.log("[register] Signing up with metadata:", {
      hasToken: false,
      role: metadata.role ?? "(default)",
    });

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    });

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "Er bestaat al een account met dit e-mailadres."
          : signUpError.message
      );
      resetRecaptcha();
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
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
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-10">
            <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-5">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">
              Check je inbox
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We hebben een verificatielink gestuurd naar{" "}
              <span className="font-medium text-black">{email}</span>.
              <br />
              Klik op de link in de e-mail om je account te activeren.
            </p>
            <p className="mt-6 text-xs text-gray-400">
              Geen e-mail ontvangen? Controleer je spam-map of{" "}
              <button
                onClick={() => setSuccess(false)}
                className="text-primary hover:underline font-medium"
              >
                probeer opnieuw
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
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

          <>
            <h1 className="mt-6 text-2xl font-bold text-black">
              Werkgever aanmelden
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Maak een gratis account aan en plaats je vacatures
            </p>
          </>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label
                htmlFor="firmName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Naam werkgever
              </label>
              <input
                id="firmName"
                type="text"
                required
                placeholder="Bijv. Van der Berg Advocaten"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            {/* Contactpersoon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contactpersoon
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Voornaam"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
                <input
                  type="text"
                  required
                  placeholder="Achternaam"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* E-mailadres */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="werkgever@voorbeeld.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
              <p className="mt-1 text-xs text-gray-400">
                Dit wordt je inlognaam en standaard notificatie-e-mailadres
              </p>
            </div>

            {/* Wachtwoord */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Minimaal 8 tekens"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
            </div>

            {/* Telefoonnummer */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Telefoonnummer
              </label>
              <input
                id="phone"
                type="tel"
                required
                placeholder="06-12345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <RecaptchaCheckbox
              widgetKey={recaptchaWidgetKey}
              onChange={setRecaptchaToken}
              className="flex justify-start mb-4"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Account aanmaken…" : "Account aanmaken"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Al een account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Inloggen
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
