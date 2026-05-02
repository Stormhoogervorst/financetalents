"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ApplicationStatus } from "@/types";
import { Loader2 } from "lucide-react";

const statuses: ApplicationStatus[] = ["pending", "reviewing", "interview", "rejected", "accepted"];

export default function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLoading(true);
    await supabase
      .from("applications")
      .update({ status: e.target.value })
      .eq("id", applicationId);
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1.5">
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
      <select
        className="input text-xs py-1.5 w-auto"
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={loading}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
