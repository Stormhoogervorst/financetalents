-- ============================================================
-- Migration: Public read policies for jobs and firms
--
-- Problem: The public website uses the anon key (subject to RLS),
-- but no SELECT policy exists for unauthenticated visitors.
-- The portal works because it uses the service-role key which
-- bypasses RLS entirely.
--
-- Fix: Allow anyone to read active jobs and published firms.
-- Run this in the Supabase SQL editor.
-- ============================================================

-- 1. Public can read active jobs
CREATE POLICY jobs_public_read ON public.jobs
  FOR SELECT
  USING (status = 'active');

-- 2. Public can read published firms (needed for the join in job queries)
CREATE POLICY firms_public_read ON public.firms
  FOR SELECT
  USING (is_published = true);
