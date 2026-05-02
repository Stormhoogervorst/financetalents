"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { verifyRecaptchaAction } from "@/app/actions/recaptcha";
import { RecaptchaCheckbox } from "@/components/recaptcha/RecaptchaCheckbox";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";

type View = "login" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const supabase = createClient();
  const { widgetKey: recaptchaWidgetKey, token: recaptchaToken, setToken: setRecaptchaToken, reset: resetRecaptcha, siteKeyConfigured } =
    useRecaptcha();
  const recaptchaRequired = siteKeyConfigured;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (recaptchaRequired) {
        if (!recaptchaToken) {
          setError("Voltooi de reCAPTCHA-verificatie.");
          setLoading(false);
          return;
        }
        console.debug("[login] verifying reCAPTCHA token...");
        const captcha = await verifyRecaptchaAction(recaptchaToken);
        if (!captcha.ok) {
          console.error("[login] reCAPTCHA verification failed", captcha);
          const codes = captcha.codes?.length ? ` (codes: ${captcha.codes.join(", ")})` : "";
          setError(`${captcha.error}${codes}`);
          resetRecaptcha();
          setLoading(false);
          return;
        }
        console.debug("[login] reCAPTCHA OK", captcha);
      }

      console.debug("[login] calling supabase.auth.signInWithPassword for", email);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("[login] signInWithPassword error", {
          message: signInError.message,
          name: signInError.name,
          status: signInError.status,
          code: (signInError as { code?: string }).code,
          full: signInError,
        });
        setError(
          signInError.message === "Invalid login credentials"
            ? "E-mailadres of wachtwoord is onjuist."
            : `${signInError.message}${signInError.status ? ` (status ${signInError.status})` : ""}`
        );
        resetRecaptcha();
        setLoading(false);
      } else {
        console.debug("[login] signIn success", { userId: data?.user?.id });

        // Bepaal bestemming op basis van rol. Admins gaan direct naar /admin,
        // overige accounts naar /portal. De query gebruikt de verse sessie-
        // cookie en valt terug via de profiles_self_read RLS policy.
        let destination = "/portal";
        const userId = data?.user?.id;
        if (userId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .maybeSingle();
          if (profile?.role === "admin") destination = "/admin";
        }

        router.push(destination);
        router.refresh();
      }
    } catch (err) {
      console.error("[login] unexpected exception during login flow", err);
      const message =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : typeof err === "string"
            ? err
            : JSON.stringify(err);
      setError(`Onverwachte fout: ${message}`);
      resetRecaptcha();
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (recaptchaRequired) {
        if (!recaptchaToken) {
          setError("Voltooi de reCAPTCHA-verificatie.");
          setLoading(false);
          return;
        }
        const captcha = await verifyRecaptchaAction(recaptchaToken);
        if (!captcha.ok) {
          console.error("[forgot-password] reCAPTCHA verification failed", captcha);
          const codes = captcha.codes?.length ? ` (codes: ${captcha.codes.join(", ")})` : "";
          setError(`${captcha.error}${codes}`);
          resetRecaptcha();
          setLoading(false);
          return;
        }
      }

      console.log(
        "Reset email sent with redirectTo:",
        'https://www.legal-talents.nl/auth/callback?next=/update-wachtwoord'
      );
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://www.legal-talents.nl/auth/callback?next=/update-wachtwoord',
      });
      console.log("[forgot-password] resetPasswordForEmail response", { data, resetError });

      if (resetError) {
        console.error("[forgot-password] resetPasswordForEmail error", {
          message: resetError.message,
          name: resetError.name,
          status: resetError.status,
          full: resetError,
        });
        setError(resetError.message);
        resetRecaptcha();
        setLoading(false);
      } else {
        setResetSent(true);
        setLoading(false);
      }
    } catch (err) {
      console.error("[forgot-password] unexpected exception", err);
      const message =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : typeof err === "string"
            ? err
            : JSON.stringify(err);
      setError(`Onverwachte fout: ${message}`);
      resetRecaptcha();
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
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
          <h1 className="mt-6 text-2xl font-bold text-black">
            {view === "login" ? "Inloggen" : "Wachtwoord vergeten"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {view === "login"
              ? "Welkom terug — log in op je werkgeverportaal"
              : "Vul je e-mailadres in, dan sturen we een resetlink"}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          {/* ── Login form ── */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Wachtwoord
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView("forgot"); setError(null); resetRecaptcha(); }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Wachtwoord vergeten?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                {loading ? "Inloggen…" : "Inloggen"}
              </button>
            </form>
          )}

          {/* ── Forgot password form ── */}
          {view === "forgot" && !resetSent && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres
                </label>
                <input
                  id="resetEmail"
                  type="email"
                  required
                  placeholder="werkgever@voorbeeld.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Versturen…" : "Resetlink versturen"}
              </button>

              <button
                type="button"
                onClick={() => { setView("login"); setError(null); resetRecaptcha(); }}
                className="btn-secondary w-full"
              >
                ← Terug naar inloggen
              </button>
            </form>
          )}

          {/* ── Reset email sent ── */}
          {view === "forgot" && resetSent && (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-5">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-base font-bold text-black mb-2">Resetlink verstuurd</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Check je inbox op{" "}
                <span className="font-medium text-black">{email}</span> voor de resetlink.
              </p>
              <button
                type="button"
                onClick={() => { setView("login"); setResetSent(false); setError(null); resetRecaptcha(); }}
                className="mt-6 text-sm text-primary hover:underline font-medium"
              >
                ← Terug naar inloggen
              </button>
            </div>
          )}

          {/* Register link */}
          {view === "login" && (
            <p className="mt-6 text-center text-sm text-gray-500">
              Nog geen account?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Werkgever aanmelden
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
