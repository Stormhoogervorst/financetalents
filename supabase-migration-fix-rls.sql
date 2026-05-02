-- ============================================================
-- Migration: Fix RLS infinite recursion + add missing policies
--
-- Root cause: profiles_team_read queries the profiles table
-- inside its own USING clause → infinite recursion.
-- The same subquery pattern in jobs_team_read / applications_team_read /
-- blogs_team_read triggers profiles RLS, which recurses again.
--
-- Fix: A SECURITY DEFINER helper function that reads the
-- current user's firm_id without going through RLS.
--
-- Run this in the Supabase SQL editor.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Helper function: get the current user's firm_id
--    SECURITY DEFINER bypasses RLS, breaking the recursion.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_my_firm_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT firm_id FROM profiles WHERE id = auth.uid()
$$;

-- ────────────────────────────────────────────────────────────
-- 2. PROFILES — fix recursive policy + ensure self-access
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS profiles_team_read ON public.profiles;
DROP POLICY IF EXISTS profiles_self_read ON public.profiles;
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;

CREATE POLICY profiles_self_read ON public.profiles
  FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY profiles_self_update ON public.profiles
  FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY profiles_team_read ON public.profiles
  FOR SELECT
  USING (
    firm_id IS NOT NULL
    AND (
      firm_id = public.get_my_firm_id()
      OR firm_id IN (SELECT id FROM public.firms WHERE user_id = (SELECT auth.uid()))
    )
  );

-- ────────────────────────────────────────────────────────────
-- 3. JOBS — fix recursion + add missing write policies
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS jobs_team_read ON public.jobs;
DROP POLICY IF EXISTS jobs_owner_all ON public.jobs;
DROP POLICY IF EXISTS jobs_public_read ON public.jobs;

-- Team members can read their firm's jobs
CREATE POLICY jobs_team_read ON public.jobs
  FOR SELECT
  USING (
    firm_id = public.get_my_firm_id()
    OR firm_id IN (SELECT id FROM public.firms WHERE user_id = (SELECT auth.uid()))
  );

-- Firm owners can manage (INSERT / UPDATE / DELETE) their jobs
CREATE POLICY jobs_owner_all ON public.jobs
  FOR ALL
  USING  (firm_id IN (SELECT id FROM public.firms WHERE user_id = (SELECT auth.uid())))
  WITH CHECK (firm_id IN (SELECT id FROM public.firms WHERE user_id = (SELECT auth.uid())));

-- Anonymous visitors can read active jobs
CREATE POLICY jobs_public_read ON public.jobs
  FOR SELECT
  USING (status = 'active');

-- ────────────────────────────────────────────────────────────
-- 4. APPLICATIONS — fix recursion
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS applications_team_read ON public.applications;

CREATE POLICY applications_team_read ON public.applications
  FOR SELECT
  USING (
    firm_id = public.get_my_firm_id()
    OR firm_id IN (SELECT id FROM public.firms WHERE user_id = (SELECT auth.uid()))
  );

-- ────────────────────────────────────────────────────────────
-- 5. BLOGS — fix recursion
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS blogs_team_read ON public.blogs;

CREATE POLICY blogs_team_read ON public.blogs
  FOR SELECT
  USING (
    firm_id = public.get_my_firm_id()
    OR firm_id IN (SELECT id FROM public.firms WHERE user_id = (SELECT auth.uid()))
  );

-- ────────────────────────────────────────────────────────────
-- 6. FIRMS — ensure public read exists
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS firms_public_read ON public.firms;

CREATE POLICY firms_public_read ON public.firms
  FOR SELECT
  USING (is_published = true);
