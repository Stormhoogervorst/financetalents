-- Migration: Add linkedin_id column to applications table
-- Run this in the Supabase SQL editor at:
-- https://supabase.com/dashboard/project/cuekfbypvwzznnkfiedq/sql/new

-- Stores the LinkedIn provider_id (from OAuth user_metadata.sub / provider_id)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS linkedin_id text;

-- Index for potential future lookups
CREATE INDEX IF NOT EXISTS applications_linkedin_id_idx
  ON public.applications (linkedin_id)
  WHERE linkedin_id IS NOT NULL;
