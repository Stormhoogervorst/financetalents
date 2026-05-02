-- ============================================================
-- Migration: Fix firms RLS + blogs write access
--
-- Problems:
-- 1. The firms table only has firms_public_read (is_published = true).
--    Firm owners can't read their own unpublished firm, which breaks
--    every RLS policy that subqueries firms (blogs_owner_all, jobs_owner_all, etc.)
-- 2. blogs_owner_all only matches firm owners (via firms.user_id).
--    Team members with profiles.firm_id can't insert/update blogs.
--
-- Run this in the Supabase SQL editor.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. FIRMS — let owners always read + manage their own firm
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS firms_owner_all ON public.firms;

CREATE POLICY firms_owner_all ON public.firms
  FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ────────────────────────────────────────────────────────────
-- 2. FIRMS — let team members read their own firm
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS firms_team_read ON public.firms;

CREATE POLICY firms_team_read ON public.firms
  FOR SELECT
  USING (id = public.get_my_firm_id());

-- ────────────────────────────────────────────────────────────
-- 3. BLOGS — replace owner-only write with owner + team write
--    Team members (who have profiles.firm_id) can now also
--    create and update their firm's blogs.
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS blogs_owner_all ON public.blogs;

CREATE POLICY blogs_firm_all ON public.blogs
  FOR ALL
  USING (
    firm_id = public.get_my_firm_id()
    OR firm_id IN (SELECT id FROM public.firms WHERE user_id = (SELECT auth.uid()))
  )
  WITH CHECK (
    firm_id = public.get_my_firm_id()
    OR firm_id IN (SELECT id FROM public.firms WHERE user_id = (SELECT auth.uid()))
  );
