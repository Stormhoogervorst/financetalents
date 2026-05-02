"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { verifyRecaptchaAction } from "@/app/actions/recaptcha";
import { RecaptchaCheckbox } from "@/components/recaptcha/RecaptchaCheckbox";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setError("Please complete the reCAPTCHA verification.");
          setLoading(false);
          return;
        }
        console.debug("[auth/login] verifying reCAPTCHA token...");
        const captcha = await verifyRecaptchaAction(recaptchaToken);
        if (!captcha.ok) {
          console.error("[auth/login] reCAPTCHA verification failed", captcha);
          const codes = captcha.codes?.length ? ` (codes: ${captcha.codes.join(", ")})` : "";
          setError(`${captcha.error}${codes}`);
          resetRecaptcha();
          setLoading(false);
          return;
        }
      }

      console.debug("[auth/login] calling supabase.auth.signInWithPassword for", email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("[auth/login] signInWithPassword error", {
          message: error.message,
          name: error.name,
          status: error.status,
          code: (error as { code?: string }).code,
          full: error,
        });
        setError(`${error.message}${error.status ? ` (status ${error.status})` : ""}`);
        resetRecaptcha();
        setLoading(false);
      } else {
        console.debug("[auth/login] signIn success", { userId: data?.user?.id });
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      console.error("[auth/login] unexpected exception during login flow", err);
      const message =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : typeof err === "string"
            ? err
            : JSON.stringify(err);
      setError(`Unexpected error: ${message}`);
      resetRecaptcha();
      setLoading(false);
    }
  };

  return (
    <div className="card p-8">
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              className="input pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="font-medium text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-600 font-bold text-2xl">
            <Briefcase className="h-7 w-7" /> VacancyHub
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <Suspense fallback={<div className="card p-8 animate-pulse h-64" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
