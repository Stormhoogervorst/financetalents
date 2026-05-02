export type UserRole = "job_seeker" | "employer" | "admin";

// ─── Legal Talents schema types ───────────────────────────────────────────────

export type JobType =
  | "fulltime" | "parttime" | "business-course" | "stage"
  | "full-time" | "part-time" | "internship" | "student"
  | "lawcourse" | "summer-course";
export type JobStatus = "draft" | "active" | "closed";

/** Canonical display options shown in dropdowns and filters */
export const JOB_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "fulltime",        label: "Fulltime" },
  { value: "parttime",        label: "Parttime" },
  { value: "business-course", label: "Business Course" },
  { value: "stage",           label: "Stage" },
];

/** Label lookup for all values including legacy DB entries */
export const jobTypeLabels: Record<string, string> = {
  "fulltime":        "Fulltime",
  "parttime":        "Parttime",
  "business-course": "Business Course",
  "stage":           "Stage",
  // Legacy-waarden (backward compatibility)
  "full-time":     "Fulltime",
  "part-time":     "Parttime",
  "internship":    "Stage",
  "student":       "Stage",
  "lawcourse":     "Business Course",
  "summer-course": "Business Course",
};

export interface JobFirmPreview {
  name: string;
  logo_url: string | null;
  slug: string;
}

export interface Job {
  id: string;
  firm_id: string;
  title: string;
  slug: string;
  location: string;
  type: JobType;
  practice_area: string;
  description: string;
  salary_indication: string | null;
  start_date: string | null;
  required_education: string | null;
  hours_per_week: number | null;
  status: JobStatus;
  notification_email_override: string | null;
  latitude: number | null;
  longitude: number | null;
  views: number;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  firms?: JobFirmPreview | null;
}

export interface Firm {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  contact_person: string | null;
  notification_email: string;
  cc_emails: string[];
  phone: string | null;
  location: string | null;
  practice_areas: string[] | null;
  description: string | null;
  why_work_with_us: string | null;
  team_size: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  salary_indication: string | null;
  logo_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  firm_id: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  created_at: string;
}

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | "freelance";
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";
export type VacancyStatus = "open" | "closed" | "draft";

export interface Vacancy {
  id: string;
  employer_id: string;
  title: string;
  company_name: string;
  company_logo_url: string | null;
  location: string;
  remote: boolean;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  description: string;
  requirements: string;
  status: VacancyStatus;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export type InvitationStatus = "pending" | "accepted";

export interface Invitation {
  id: string;
  email: string;
  firm_id: string;
  token: string;
  status: InvitationStatus;
  created_at: string;
}

export interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export type ApplicationStatus = "pending" | "reviewing" | "interview" | "rejected" | "accepted";

export interface Application {
  id: string;
  vacancy_id: string;
  applicant_id: string;
  cover_letter: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  vacancy?: Vacancy;
  applicant?: Profile;
}
