-- Fix teacher/parent visibility regressions caused by RLS policy cycles.
--
-- Symptoms:
-- - Teacher attendance page shows "No assignments" even when assignments exist.
-- - Creating/loading class sessions fails with infinite recursion policy errors.
--
-- Root causes:
-- 1) Helper functions set row_security=off but did not restore it, leaking the
--    setting into caller queries.
-- 2) Parent policies on subjects/class_sessions introduced recursive policy
--    dependencies through attendance/class_sessions joins.

CREATE OR REPLACE FUNCTION public.current_user_role ()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_row_security text;
  out_role text;
BEGIN
  old_row_security := current_setting('row_security', true);
  PERFORM set_config('row_security', 'off', true);

  SELECT role
  INTO out_role
  FROM public.profiles
  WHERE id = auth.uid ();

  PERFORM set_config('row_security', COALESCE(old_row_security, 'on'), true);
  RETURN out_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin ()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_row_security text;
  out_admin boolean;
BEGIN
  old_row_security := current_setting('row_security', true);
  PERFORM set_config('row_security', 'off', true);

  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid ()
      AND role = 'admin'
      AND is_active = true
  )
  INTO out_admin;

  PERFORM set_config('row_security', COALESCE(old_row_security, 'on'), true);
  RETURN out_admin;
END;
$$;

DROP POLICY IF EXISTS subjects_select_parent ON public.subjects;
CREATE POLICY subjects_select_parent ON public.subjects FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'parent'
  AND EXISTS (
    SELECT 1
    FROM public.parent_students ps
    JOIN public.students s ON s.id = ps.student_id
    JOIN public.teacher_assignments ta ON ta.class_id = s.class_id
    WHERE ps.parent_id = auth.uid ()
      AND ta.subject_id = subjects.id
      AND ta.is_active = true
      AND s.is_active = true
  )
);

DROP POLICY IF EXISTS class_sessions_select_parent ON public.class_sessions;
CREATE POLICY class_sessions_select_parent ON public.class_sessions FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'parent'
  AND EXISTS (
    SELECT 1
    FROM public.parent_students ps
    JOIN public.students s ON s.id = ps.student_id
    WHERE ps.parent_id = auth.uid ()
      AND s.class_id = class_sessions.class_id
      AND s.is_active = true
  )
);
