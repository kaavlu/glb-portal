-- Fix infinite recursion on profiles RLS: is_admin() / current_user_role() SELECT profiles,
-- which re-evaluates profiles policies that call those functions again.
-- SECURITY DEFINER alone does not bypass RLS for the invoker (PostgreSQL behaviour).
-- See: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

CREATE OR REPLACE FUNCTION public.current_user_role ()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN (
    SELECT role
    FROM public.profiles
    WHERE id = auth.uid ()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin ()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('row_security', 'off', true);
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid ()
      AND role = 'admin'
      AND is_active = true
  );
END;
$$;

-- Avoid nested SELECT on profiles in WITH CHECK (same recursion risk for self-updates).
DROP POLICY IF EXISTS profiles_update ON public.profiles;

CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated USING (
  public.is_admin ()
  OR id = auth.uid ()
)
WITH CHECK (
  public.is_admin ()
  OR (
    id = auth.uid ()
    AND role = public.current_user_role ()
  )
);
