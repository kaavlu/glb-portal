-- -----------------------------------------------------------------------------
-- Remap seeded teacher rows to the real Supabase Auth user id (first teacher)
-- -----------------------------------------------------------------------------
-- Seed uses a fixed UUID for Marek Lněnička (10000000-...-0101). If you created
-- the account in the Dashboard, auth.users.id may differ, so assignments and
-- schedules stay invisible until this repair runs.
--
-- Expected email: marek.lnenicka@gybassi.cz
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  seed_teacher_id uuid := '10000000-0000-4000-8000-000000000101'::uuid;
  actual_id uuid;
BEGIN
  SELECT u.id
  INTO actual_id
  FROM auth.users u
  WHERE lower(u.email) = lower('marek.lnenicka@gybassi.cz')
  ORDER BY u.created_at ASC
  LIMIT 1;

  IF actual_id IS NULL THEN
    RAISE NOTICE 'repair_demo_teacher_ids: no auth.users row for marek.lnenicka@gybassi.cz — skip';
    RETURN;
  END IF;

  IF actual_id = seed_teacher_id THEN
    RAISE NOTICE 'repair_demo_teacher_ids: auth id already matches seed — nothing to do';
    RETURN;
  END IF;

  UPDATE public.teacher_assignments
  SET teacher_id = actual_id
  WHERE teacher_id = seed_teacher_id;

  UPDATE public.class_schedules
  SET teacher_id = actual_id
  WHERE teacher_id = seed_teacher_id;

  UPDATE public.class_sessions
  SET teacher_id = actual_id
  WHERE teacher_id = seed_teacher_id;

  UPDATE public.attendance_records
  SET recorded_by = actual_id
  WHERE recorded_by = seed_teacher_id;

  UPDATE public.lesson_logs
  SET teacher_id = actual_id
  WHERE teacher_id = seed_teacher_id;

  INSERT INTO public.profiles (id, full_name, email, role, initials, phone, is_active)
  SELECT
    actual_id,
    'Marek Lněnička',
    u.email,
    'teacher',
    'ML',
    null,
    true
  FROM auth.users u
  WHERE u.id = actual_id
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role,
    initials = excluded.initials,
    is_active = excluded.is_active;

  DELETE FROM public.profiles WHERE id = seed_teacher_id;

  RAISE NOTICE 'repair_demo_teacher_ids: remapped Marek from % to %', seed_teacher_id, actual_id;
END $$;
