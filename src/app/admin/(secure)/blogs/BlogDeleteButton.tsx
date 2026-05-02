"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteBlogAsAdmin } from "./actions";

/**
 * "Verwijderen"-knop voor één blog-rij in het admin-overzicht.
 *
 * Gebruikt window.confirm voor een zero-dependency bevestigingsstap,
 * consistent met JobDeleteButton.
 */
export function BlogDeleteButton({
  blogId,
  blogTitle,
}: {
  blogId: string;
  blogTitle: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    const ok = window.confirm(
      `Weet je zeker dat je deze blog wilt verwijderen?\n\n"${blogTitle}"\n\n` +
        "Deze actie kan niet ongedaan worden gemaakt."
    );
    if (!ok) return;

    const fd = new FormData();
    fd.set("blogId", blogId);
    startTransition(async () => {
      await deleteBlogAsAdmin(fd);
    });
  };

  return (
    <div className="flex items-center justify-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title="Blog verwijderen"
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
