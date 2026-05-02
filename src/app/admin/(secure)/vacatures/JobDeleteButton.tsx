"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteVacancyAsAdmin } from "./actions";

/**
 * "Verwijderen"-knop voor één vacature-rij in het admin-overzicht.
 *
 * Gebruikt window.confirm voor een zero-dependency bevestigingsstap.
 * Een "echte" modal komt pas zodra we een design system component hebben;
 * window.confirm is voor een destructieve admin-actie ruim voldoende.
 */
export function JobDeleteButton({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const ok = window.confirm(
      `Weet je zeker dat je "${jobTitle}" wilt verwijderen?\n\n` +
        "Deze actie kan niet ongedaan worden gemaakt. " +
        "Bijbehorende sollicitaties worden ook verwijderd."
    );
    if (!ok) return;

    const fd = new FormData();
    fd.set("jobId", jobId);
    startTransition(async () => {
      await deleteVacancyAsAdmin(fd);
    });
  };

  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title="Vacature verwijderen"
        className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Trash2 className="h-3 w-3" />
        )}
        Verwijderen
      </button>
    </div>
  );
}
