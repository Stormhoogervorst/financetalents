"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Vacancy, EmploymentType, ExperienceLevel, VacancyStatus } from "@/types";
import { employmentTypeLabels, experienceLevelLabels } from "@/lib/utils";
import { Loader2, Save } from "lucide-react";

interface Props {
  employerId: string;
  companyName: string;
  vacancy?: Vacancy;
}

export default function VacancyForm({ employerId, companyName, vacancy }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(vacancy?.title ?? "");
  const [location, setLocation] = useState(vacancy?.location ?? "");
  const [remote, setRemote] = useState(vacancy?.remote ?? false);
  const [employmentType, setEmploymentType] = useState<EmploymentType>(vacancy?.employment_type ?? "full_time");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(vacancy?.experience_level ?? "mid");
  const [salaryMin, setSalaryMin] = useState(vacancy?.salary_min?.toString() ?? "");
  const [salaryMax, setSalaryMax] = useState(vacancy?.salary_max?.toString() ?? "");
  const [description, setDescription] = useState(vacancy?.description ?? "");
  const [requirements, setRequirements] = useState(vacancy?.requirements ?? "");
  const [status, setStatus] = useState<VacancyStatus>(vacancy?.status ?? "draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let latitude: number | null = null;
    let longitude: number | null = null;

    if (location.trim()) {
      try {
        const geoRes = await fetch(
          `/api/geocode?q=${encodeURIComponent(location.trim())}`
        );
        if (geoRes.ok) {
          const geo = await geoRes.json();
          latitude = geo.lat;
          longitude = geo.lng;
        }
      } catch {
        // geocoding failed — continue without coordinates
      }
    }

    const payload = {
      employer_id: employerId,
      title,
      company_name: companyName,
      location,
      remote,
      employment_type: employmentType,
      experience_level: experienceLevel,
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      description,
      requirements,
      status,
      latitude,
      longitude,
    };

    if (vacancy) {
      const { error } = await supabase.from("vacancies").update(payload).eq("id", vacancy.id);
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.from("vacancies").insert(payload);
      if (error) { setError(error.message); setLoading(false); return; }
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="label">Job title</label>
          <input
            required
            className="input"
            placeholder="e.g. Senior React Developer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Location</label>
          <input
            required
            className="input"
            placeholder="e.g. Amsterdam, NL"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Employment type</label>
          <select className="input" value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}>
            {(Object.entries(employmentTypeLabels) as [EmploymentType, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Experience level</label>
          <select className="input" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}>
            {(Object.entries(experienceLevelLabels) as [ExperienceLevel, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Salary min (EUR)</label>
          <input
            type="number"
            className="input"
            placeholder="e.g. 40000"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Salary max (EUR)</label>
          <input
            type="number"
            className="input"
            placeholder="e.g. 60000"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 select-none">
        <input
          type="checkbox"
          checked={remote}
          onChange={(e) => setRemote(e.target.checked)}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
        Remote position
      </label>

      <div>
        <label className="label">Job description</label>
        <textarea
          required
          className="input"
          rows={8}
          placeholder="Describe the role, responsibilities, and what your company offers…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Requirements</label>
        <textarea
          className="input"
          rows={5}
          placeholder="List required skills, experience, and qualifications…"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <select
          className="input w-auto text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as VacancyStatus)}
        >
          <option value="draft">Save as draft</option>
          <option value="open">Publish (open)</option>
          <option value="closed">Closed</option>
        </select>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? "Saving…" : vacancy ? "Save changes" : "Create vacancy"}
        </button>
      </div>
    </form>
  );
}
