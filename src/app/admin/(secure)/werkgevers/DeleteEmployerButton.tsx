"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import { deleteEmployerAction } from "./actions";

type Variant = "solid" | "icon";

type Props = {
  employerId: string;
  employerName: string;
  variant?: Variant;
};

// Bewust een ingebouwde modal met typbevestiging i.p.v. een simpele
// `confirm()`-prompt: deze actie verwijdert onomkeerbaar een compleet
// werkgever-account inclusief vacatures, sollicitaties en blogs via
// ON DELETE CASCADE. Dat rechtvaardigt een moment van visuele wrijving.
const REQUIRED_CONFIRM = "VERWIJDER";

export default function DeleteEmployerButton({
  employerId,
  employerName,
  variant = "solid",
}: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const disabled = typed.trim() !== REQUIRED_CONFIRM || isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      // De action gebruikt bewust geen throw voor business-fouten; bij
      // falen komt er `{ error }` terug, bij succes doet de server
      // `redirect()` en eindigt deze promise zonder return-waarde
      // (Next.js' NEXT_REDIRECT wordt dan afgehandeld door de router,
      // buiten deze handler om). Daarom GEEN try/catch hier: dat zou
      // de redirect-error vangen en op een error-boundary laten landen.
      const result = await deleteEmployerAction(fd);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          title={`Verwijder ${employerName}`}
          className="inline-flex items-center justify-center rounded-full p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200 transition hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Verwijder werkgever
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-employer-title"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2
                  id="delete-employer-title"
                  className="text-base font-semibold text-gray-900"
                >
                  Werkgever permanent verwijderen?
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Je staat op het punt om{" "}
                  <span className="font-semibold text-gray-900">
                    {employerName}
                  </span>{" "}
                  te verwijderen. Dit verwijdert{" "}
                  <span className="font-semibold">ook het account</span>,
                  alle vacatures, sollicitaties, blogs en uitnodigingen die
                  aan deze werkgever gekoppeld zijn.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Deze actie kan niet ongedaan worden gemaakt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !isPending && setOpen(false)}
                aria-label="Sluiten"
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <input type="hidden" name="employerId" value={employerId} />
              <input type="hidden" name="confirm" value={typed.trim()} />

              <label className="block text-xs font-medium text-gray-700">
                Typ{" "}
                <span className="font-mono font-semibold text-red-700">
                  {REQUIRED_CONFIRM}
                </span>{" "}
                om te bevestigen
              </label>
              <input
                type="text"
                autoFocus
                value={typed}
                onChange={(e) => {
                  setTyped(e.target.value);
                  setError(null);
                }}
                placeholder={REQUIRED_CONFIRM}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono tracking-wide text-black placeholder-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isPending}
              />

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Verwijderen…
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      Definitief verwijderen
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
