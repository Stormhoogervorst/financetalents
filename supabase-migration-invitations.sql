-- ============================================================
-- Migration: Team management — invitations table + profiles.firm_id + RLS
-- Run this in the Supabase SQL editor.
-- ============================================================

-- 1. Add firm_id to profiles so team members can be linked to a firm
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS firm_id uuid REFERENCES public.firms(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_firm_id ON public.profiles(firm_id);

-- Backfill: link existing firm owners to their firms
UPDATE public.profiles p
SET firm_id = f.id
FROM public.firms f
WHERE f.user_id = p.id
  AND p.firm_id IS NULL;

-- 2. Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL,
  firm_id    uuid NOT NULL REFERENCES public.firms(id) ON DELETE CASCADE,
  token      uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status     text NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token   ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_firm_id ON public.invitations(firm_id);

-- 3. RLS for invitations — firm owners can manage their invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitations_firm_manage ON public.invitations
  FOR ALL
  USING  (firm_id IN (SELECT id FROM public.firms WHERE user_id = auth.uid()))
  WITH CHECK (firm_id IN (SELECT id FROM public.firms WHERE user_id = auth.uid()));

-- 4. RLS for profiles — team members can see colleagues in the same firm
--    (multiple SELECT policies on the same table are OR'd together)
CREATE POLICY profiles_team_read ON public.profiles
  FOR SELECT
  USING (
    firm_id IS NOT NULL
    AND firm_id IN (
      -- user's own firm_id via profiles
      SELECT firm_id FROM public.profiles WHERE id = auth.uid()
      UNION
      -- user is the firm owner
      SELECT id FROM public.firms WHERE user_id = auth.uid()
    )
  );

-- 5. Allow team members to read their firm's jobs
CREATE POLICY jobs_team_read ON public.jobs
  FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM public.profiles
      WHERE id = auth.uid() AND firm_id IS NOT NULL
    )
  );

-- 6. Allow team members to read their firm's applications
CREATE POLICY applications_team_read ON public.applications
  FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM public.profiles
      WHERE id = auth.uid() AND firm_id IS NOT NULL
    )
  );

-- 7. Allow team members to read their firm's blogs
CREATE POLICY blogs_team_read ON public.blogs
  FOR SELECT
  USING (
    firm_id IN (
      SELECT firm_id FROM public.profiles
      WHERE id = auth.uid() AND firm_id IS NOT NULL
    )
  );
