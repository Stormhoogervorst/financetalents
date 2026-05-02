-- ============================================================
-- Migration: Update handle_new_user trigger to support invitation tokens
-- When a user registers via an invitation link, the trigger now looks up
-- the firm_id from the invitations table and writes it directly into the
-- new profile row.  This guarantees the firm link is set atomically —
-- no race condition with the auth callback.
-- Run this in the Supabase SQL editor.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invitation_token text;
  _firm_id          uuid;
  _role             user_role;
  _full_name        text;
BEGIN
  _invitation_token := new.raw_user_meta_data ->> 'invitation_token';
  _full_name        := COALESCE(
                         new.raw_user_meta_data ->> 'full_name',
                         new.raw_user_meta_data ->> 'contact_person'
                       );

  -- Default role from metadata, falling back to job_seeker
  _role := COALESCE(
             (new.raw_user_meta_data ->> 'role')::user_role,
             'job_seeker'
           );

  -- If an invitation token is present, resolve the firm_id
  IF _invitation_token IS NOT NULL THEN
    SELECT i.firm_id INTO _firm_id
    FROM public.invitations i
    WHERE i.token = _invitation_token::uuid
      AND i.status = 'pending'
    LIMIT 1;

    IF _firm_id IS NOT NULL THEN
      _role := 'employer';
    END IF;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, company_name, firm_id)
  VALUES (
    new.id,
    new.email,
    _full_name,
    _role,
    new.raw_user_meta_data ->> 'company_name',
    _firm_id
  );

  RETURN new;
END;
$$;
