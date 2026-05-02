-- Migration: Recreate applications table with the correct schema
-- Run this in the Supabase SQL editor at:
-- https://supabase.com/dashboard/project/cuekfbypvwzznnkfiedq/sql/new

-- Drop existing table (removes old vacancy_id / applicant_id schema)
DROP TABLE IF EXISTS public.applications CASCADE;

-- Create the new applications table
CREATE TABLE public.applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  firm_id         uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  applicant_name  text NOT NULL,
  applicant_email text NOT NULL,
  applicant_phone text,
  university      text,
  study_field     text,
  motivation      text,
  cv_storage_path text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes for portal queries
CREATE INDEX applications_firm_id_idx ON public.applications (firm_id);
CREATE INDEX applications_job_id_idx  ON public.applications (job_id);
CREATE INDEX applications_created_at_idx ON public.applications (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Firms can read their own applications (via firm_id)
CREATE POLICY "Firms read own applications"
  ON public.applications FOR SELECT
  USING (
    firm_id IN (
      SELECT id FROM public.firms WHERE user_id = auth.uid()
    )
  );

-- Inserts are done by the service-role key in /api/apply (bypasses RLS)
-- No public INSERT policy needed.

-- ─── If the table already exists, run these to add the missing columns ────────
-- ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS motivation      text;
-- ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS cv_storage_path text;
