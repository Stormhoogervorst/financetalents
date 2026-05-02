"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  jobId: string;
  initialStatus: string;
};

export default function JobStatusToggle({ jobId, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const isActive = status === "active";
  const isDraft = status === "draft";

  const toggle = async () => {
    const next = isActive ? "draft" : "active";
    setStatus(next);

    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    if (!res.ok) {
      setStatus(status);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className="flex items-center gap-2.5 group"
      aria-label={isActive ? "Deactiveer vacature" : "Activeer vacature"}
    >
      <span
        className={`
          relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full
          transition-colors duration-200 ease-in-out
          ${isActive ? "bg-green-500" : isDraft ? "bg-orange-400" : "bg-gray-300"}
          ${isPending ? "opacity-60" : ""}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow
            transform transition-transform duration-200 ease-in-out mt-0.5
            ${isActive ? "translate-x-[18px]" : "translate-x-0.5"}
          `}
        />
      </span>
      <span
        className={`text-xs font-semibold ${
          isActive ? "text-green-700" : isDraft ? "text-orange-700" : "text-gray-500"
        }`}
      >
        {isActive ? "Actief" : isDraft ? "Concept" : "Offline"}
      </span>
    </button>
  );
}
