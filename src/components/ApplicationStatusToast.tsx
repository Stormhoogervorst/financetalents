"use client";

import { useEffect, useState } from "react";

interface Props {
  alreadyApplied?: boolean;
  success?: boolean;
  /** Auto-dismiss timeout in ms. Set to 0 to disable auto-dismiss. */
  autoDismissMs?: number;
}

export default function ApplicationStatusToast({
  alreadyApplied = false,
  success = false,
  autoDismissMs = 6000,
}: Props) {
  const shouldShow = alreadyApplied || success;
  const [visible, setVisible] = useState(shouldShow);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!shouldShow) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const enterTimer = window.setTimeout(() => setEntered(true), 20);

    let dismissTimer: number | undefined;
    if (autoDismissMs > 0) {
      dismissTimer = window.setTimeout(() => {
        setEntered(false);
        window.setTimeout(() => setVisible(false), 250);
      }, autoDismissMs);
    }

    return () => {
      window.clearTimeout(enterTimer);
      if (dismissTimer !== undefined) window.clearTimeout(dismissTimer);
    };
  }, [shouldShow, autoDismissMs]);

  if (!visible) return null;

  const message = success
    ? "Sollicitatie verstuurd — we nemen snel contact met je op."
    : "Je hebt al gesolliciteerd op deze vacature.";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform transition-all duration-250 ease-out ${
        entered
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex items-center gap-3 rounded-full bg-gray-900 px-6 py-3 text-white shadow-lg ring-1 ring-white/10">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            success ? "bg-emerald-500" : "bg-amber-400"
          }`}
        >
          {success ? (
            <svg
              className="h-3.5 w-3.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="h-3.5 w-3.5 text-gray-900"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8v5" />
              <path d="M12 17h.01" />
            </svg>
          )}
        </span>
        <p className="text-[14px] font-medium whitespace-nowrap">{message}</p>
        <button
          type="button"
          onClick={() => {
            setEntered(false);
            window.setTimeout(() => setVisible(false), 250);
          }}
          className="ml-1 rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Sluiten"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
