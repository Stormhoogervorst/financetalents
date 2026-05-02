"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type Props = {
  applicationId: string;
  applicantName: string;
};

export default function DeleteApplicationButton({
  applicationId,
  applicantName,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !window.confirm(
        `Weet je zeker dat je de sollicitatie van ${applicantName} wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`
      )
    ) {
      return;
    }

    setBusy(true);
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "DELETE",
    });
    setBusy(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      window.alert(data.error ?? "Verwijderen mislukt. Probeer het opnieuw.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  const loading = busy || isPending;

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-md text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
      aria-label={`Verwijder sollicitatie van ${applicantName}`}
      title="Verwijderen"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
