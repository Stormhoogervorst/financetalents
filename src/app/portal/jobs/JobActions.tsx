"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  XCircle,
  Loader2,
} from "lucide-react";

type Job = {
  id: string;
  title: string;
  slug: string;
  location: string;
  type: string;
  practice_area: string;
  description: string;
  salary_indication: string | null;
  start_date: string | null;
  required_education: string | null;
  hours_per_week: number | null;
  status: string;
  firm_id: string;
};

type Props = {
  job: Job;
};

export default function JobActions({ job }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: rect.right - 192, // 192px = w-48
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    function onScrollOrResize() {
      updatePosition();
    }

    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePosition]);

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const changeStatus = (status: "draft" | "active" | "closed") =>
    run(async () => {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Status wijzigen mislukt.");
      }
    });

  const deleteJob = () => {
    if (!window.confirm(`Vacature "${job.title}" permanent verwijderen?`)) return;
    run(async () => {
      const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      if (!res.ok) {
        const { error } = await res.json();
        if (res.status === 403) throw new Error("Geen toegang: dit is niet jouw vacature.");
        throw new Error(error ?? "Verwijderen mislukt.");
      }
    });
  };

  const dropdown = open
    ? createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm"
        >
          <a
            href={`/portal/jobs/${job.id}/edit`}
            className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Bewerken
          </a>

          <div className="my-1 border-t border-gray-100" />

          {job.status !== "closed" && (
            <button
              onClick={() => changeStatus("closed")}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Sluiten
            </button>
          )}

          <div className="my-1 border-t border-gray-100" />

          <button
            onClick={deleteJob}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Verwijderen
          </button>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="relative">
      {error && (
        <p className="text-xs text-red-500 mb-1">{error}</p>
      )}

      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
        aria-label="Acties"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MoreHorizontal className="h-4 w-4" />
        )}
      </button>

      {dropdown}
    </div>
  );
}
