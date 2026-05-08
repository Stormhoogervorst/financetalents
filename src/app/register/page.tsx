"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site";
import { AlertCircle, Eye, EyeOff, Loader2, Mail } from "lucide-react";

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
  const [duplicateEmail, setDuplicateEmail] = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        // Verification email is opened from the user's mailbox (often on a
        // different device/session) — must point at the canonical site URL,
        // not whatever origin they registered from.
        emailRedirectTo: `${getSiteUrl()}/api/auth/callback`,
      },
    });

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "An account with this email address already exists."
          : signUpError.message
      );
      setLoading(false);
      return;
    }

    // Duplicate-email detection. Supabase deliberately returns 200 with a
    // populated `data.user` when the email is already registered, but it
    // sets `identities` to an empty array and silently does NOT send a
    // confirmation email. Without this check the user sees the generic
    // "check your inbox" screen and waits forever for an email that never
    // arrives. Reference:
    //   https://github.com/supabase/auth-js/issues/296
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      setDuplicateEmail(true);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (duplicateEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <Image
              src="/logo FT.png"
              alt="Finance Talents logo"
              width={150}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-10">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-black mb-2">
              This email is already registered
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              An account already exists for{" "}
              <span className="font-medium text-black">{email}</span>.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={`/login?email=${encodeURIComponent(email)}`}
                className="btn-primary w-full"
              >
                Log in
              </Link>
              <Link
                href={`/login?reset=1&email=${encodeURIComponent(email)}`}
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <p className="mt-6 text-xs text-gray-400">
              Wrong email?{" "}
              <button
                onClick={() => {
                  setDuplicateEmail(false);
                  setEmail("");
                }}
                className="text-primary hover:underline font-medium"
              >
                Try a different one
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-flex items-center justify-center">
            <Image
              src="/logo FT.png"
              alt="Finance Talents logo"
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
              Check your inbox
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              We sent a verification link to{" "}
              <span className="font-medium text-black">{email}</span>.
              <br />
              Click the link in the email to activate your account.
            </p>
            <p className="mt-6 text-xs text-gray-400">
              No email received? Check your spam folder or{" "}
              <button
                onClick={() => setSuccess(false)}
                className="text-primary hover:underline font-medium"
              >
                try again
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
              src="/logo FT.png"
              alt="Finance Talents logo"
              width={150}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <>
            <h1 className="mt-6 text-2xl font-bold text-black">
              Employer signup
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a free account and post your jobs.
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
                Employer name
              </label>
              <input
                id="firmName"
                type="text"
                required
                placeholder="e.g. Acme Capital"
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
            </div>

            {/* Contact person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact person
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Email address */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="employer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              />
              <p className="mt-1 text-xs text-gray-400">
                This will be your login and default notification email address.
              </p>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
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

            {/* Phone number */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone number
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Log in
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
