"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, Send } from "lucide-react";

interface Props {
  vacancyId: string;
  vacancyStatus: string;
  userId: string | null;
  existingApplication: { id: string; status: string } | null;
}

const statusLabels: Record<string, string> = {
  pending: "Application pending",
  reviewing: "Under review",
  interview: "Interview scheduled",
  rejected: "Not selected",
  accepted: "Offer received!",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewing: "bg-primary-light text-primary-dark border-primary/25",
  interview: "bg-purple-50 text-purple-700 border-purple-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
};

export default function ApplyButton({ vacancyId, vacancyStatus, userId, existingApplication }: Props) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(!!existingApplication);
  const [appStatus, setAppStatus] = useState(existingApplication?.status ?? "");

  const supabase = createClient();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("applications").insert({
      vacancy_id: vacancyId,
      applicant_id: userId,
      cover_letter: coverLetter || null,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setApplied(true);
      setAppStatus("pending");
      setShowForm(false);
      router.refresh();
    }
  };

  if (vacancyStatus === "closed") {
    return (
      <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-500 text-center">
        This vacancy is no longer accepting applications.
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="space-y-3">
        <Link href={`/auth/login?redirectTo=/vacancies/${vacancyId}`} className="btn-primary w-full">
          <Send className="h-4 w-4" /> Apply now
        </Link>
        <p className="text-xs text-center text-gray-400">You need an account to apply</p>
      </div>
    );
  }

  if (applied) {
    return (
      <div className={`rounded-xl border px-4 py-3 flex items-center gap-2 text-sm font-medium ${statusColors[appStatus]}`}>
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        {statusLabels[appStatus] ?? "Applied"}
      </div>
    );
  }

  if (!showForm) {
    return (
      <button onClick={() => setShowForm(true)} className="btn-primary w-full">
        <Send className="h-4 w-4" /> Apply now
      </button>
    );
  }

  return (
    <form onSubmit={handleApply} className="space-y-4">
      <div>
        <label className="label">Cover letter <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea
          className="input text-sm"
          rows={5}
          placeholder="Tell the employer why you're a great fit…"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Submitting…" : "Submit application"}
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-3">
          Cancel
        </button>
      </div>
    </form>
  );
}
