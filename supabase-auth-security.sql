-- SAY AI: one-time authentication hardening and administrator setup
-- Run this script in Supabase SQL Editor for project ssfxkcylqrmdrkacpive.
-- It is safe to run more than once.

CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Supabase SQL Editor/service-role operations can manage roles.
  -- Signed-in users cannot promote themselves or change their own role.
  IF auth.uid() IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Changing your own role is not permitted';
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.users_profiles') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS prevent_self_role_change ON public.users_profiles';
    EXECUTE 'CREATE TRIGGER prevent_self_role_change BEFORE UPDATE ON public.users_profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_change()';
    EXECUTE 'UPDATE public.users_profiles SET role = ''admin'' WHERE id IN (SELECT id FROM auth.users WHERE lower(email) = lower(''trrahaman.official0.6@gmail.com''))';
  END IF;

  IF to_regclass('public.profiles') IS NOT NULL THEN
    EXECUTE 'DROP TRIGGER IF EXISTS prevent_self_role_change ON public.profiles';
    EXECUTE 'CREATE TRIGGER prevent_self_role_change BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_change()';
    EXECUTE 'UPDATE public.profiles SET role = ''admin'' WHERE id IN (SELECT id FROM auth.users WHERE lower(email) = lower(''trrahaman.official0.6@gmail.com''))';
  END IF;
END;
$$;

-- The app reads the authenticated user's role from either profile table.\n-- The administrator role is assigned above only to the configured owner email.\n