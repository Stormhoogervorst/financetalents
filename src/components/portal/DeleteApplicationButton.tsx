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
        `Are you sure you want to delete the application from ${applicantName} ? This cannot be undone.`
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
      window.alert(data.error ?? "Delete failed. Try again.");
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
      aria-label={`Delete application from ${applicantName}`}
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
