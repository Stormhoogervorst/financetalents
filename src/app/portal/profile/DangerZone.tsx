"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, Loader2, X } from "lucide-react";

const CONFIRM_WORD = "VERWIJDEREN";

export default function DangerZone() {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = confirmText.trim() === CONFIRM_WORD && !deleting;

  // Reset modal state op close + lock body scroll als open.
  useEffect(() => {
    if (!open) {
      setConfirmText("");
      setError(null);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Sluit modal op Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, deleting]);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(
          typeof json?.error === "string" && json.error
            ? json.error
            : "Account verwijderen is mislukt. Probeer het opnieuw."
        );
        setDeleting(false);
        return;
      }

      // Server heeft de user al verwijderd + sessiecookies gewist.
      // Roep client-side signOut() aan om localStorage/IndexedDB te legen,
      // en redirect dan naar de homepage.
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error("[DangerZone] delete error:", err);
      setError("Er ging iets mis. Controleer je verbinding en probeer opnieuw.");
      setDeleting(false);
    }
  };

  return (
    <>
      {/* ── Danger zone card ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-red-200 bg-red-50/60 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-red-700">Gevarenzone</h2>
            <p className="mt-1 text-sm text-red-700/80">
              Zodra je je account verwijdert, is er geen weg meer terug. Wees
              alsjeblieft zeker van je zaak. Al je vacatures en bedrijfsgegevens
              worden permanent gewist.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Verwijder mijn account
            </button>
          </div>
        </div>
      </section>

      {/* ── Bevestigings-modal ───────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setOpen(false)}
          />

          {/* Dialog panel */}
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => !deleting && setOpen(false)}
              disabled={deleting}
              className="absolute right-4 top-4 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Sluiten"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3
                  id="delete-account-title"
                  className="text-base font-semibold text-black"
                >
                  Account permanent verwijderen?
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Deze actie kan niet worden teruggedraaid. Je werkgeversprofiel,
                  alle vacatures, sollicitaties en bijbehorende data worden
                  onmiddellijk en permanent verwijderd.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="confirm-delete"
                className="block text-sm font-medium text-gray-700"
              >
                Typ{" "}
                <span className="font-mono font-semibold text-red-600">
                  {CONFIRM_WORD}
                </span>{" "}
                om te bevestigen
              </label>
              <input
                id="confirm-delete"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={deleting}
                className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black placeholder-gray-400 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                placeholder={CONFIRM_WORD}
              />
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuleer
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting ? "Verwijderen…" : "Bevestig verwijdering"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
