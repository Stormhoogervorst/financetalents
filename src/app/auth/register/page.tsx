"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { verifyRecaptchaAction } from "@/app/actions/recaptcha";
import { RecaptchaCheckbox } from "@/components/recaptcha/RecaptchaCheckbox";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";
import { UserRole } from "@/types";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as UserRole) ?? "job_seeker";

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
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
        setError("Please complete the reCAPTCHA verification.");
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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          company_name: role === "employer" ? companyName : null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      resetRecaptcha();
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        company_name: role === "employer" ? companyName : null,
      });
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      if (role === "employer") router.push("/dashboard");
      else router.push("/vacancies");
    }, 2000);
  };

  if (success) {
    return (
      <div className="text-center card p-10">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Account created!</h2>
        <p className="text-sm text-gray-500 mt-2">Redirecting you now…</p>
      </div>
    );
  }

  return (
    <div className="card p-8">
      {/* Role selector */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6 gap-1">
        {(["job_seeker", "employer"] as UserRole[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              role === r
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {r === "job_seeker" ? "Job Seeker" : "Employer"}
          </button>
        ))}
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="label">Full name</label>
          <input
            id="fullName"
            type="text"
            required
            className="input"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {role === "employer" && (
          <div>
            <label htmlFor="companyName" className="label">Company name</label>
            <input
              id="companyName"
              type="text"
              required
              className="input"
              placeholder="Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        )}

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
              minLength={8}
              className="input pr-10"
              placeholder="Min. 8 characters"
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
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-600 font-bold text-2xl">
            <Briefcase className="h-7 w-7" /> VacancyHub
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-1 text-sm text-gray-500">Join VacancyHub today</p>
        </div>

        <Suspense fallback={<div className="card p-8 animate-pulse h-80" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
