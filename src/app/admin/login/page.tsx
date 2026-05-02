"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { adminLoginAction, type AdminLoginState } from "./actions";

const initialState: AdminLoginState = { error: null };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    adminLoginAction,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <Image
              src="/legal-talents-logo.png"
              alt="Legal Talents logo"
              width={150}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200">
            <Shield className="h-3.5 w-3.5" />
            Super Admin Portaal
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Inloggen op de cockpit
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Toegang uitsluitend voor de platformbeheerder.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mailadres
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@voorbeeld.nl"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-colors"
              />
            </div>

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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
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

            {state.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? "Inloggen…" : "Inloggen"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Werkgever? Ga naar{" "}
          <a href="/login" className="text-gray-700 hover:text-gray-900 underline">
            het werkgeversportaal
          </a>
          .
        </p>
      </div>
    </div>
  );
}
