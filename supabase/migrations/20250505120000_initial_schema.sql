-- GLB Portal — initial schema, helpers, and RLS (docs/project-spec.md §8, §10)

-- Extensions used by triggers / seed
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'parent')),
  initials text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  name text NOT NULL,
  school_year text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now ()
);

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  full_name text NOT NULL,
  initials text,
  class_id uuid REFERENCES public.classes (id),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now ()
);

CREATE INDEX idx_students_class_id ON public.students (class_id);

CREATE TABLE public.parent_students (
  parent_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  relationship text DEFAULT 'parent',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (parent_id, student_id)
);

CREATE INDEX idx_parent_students_parent ON public.parent_students (parent_id);
CREATE INDEX idx_parent_students_student ON public.parent_students (student_id);

CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now ()
);

CREATE TABLE public.teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  teacher_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes (id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects (id) ON DELETE CASCADE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now (),
  UNIQUE (teacher_id, class_id, subject_id)
);

CREATE INDEX idx_teacher_assignments_teacher ON public.teacher_assignments (teacher_id);
CREATE INDEX idx_teacher_assignments_class ON public.teacher_assignments (class_id);

CREATE TABLE public.class_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  class_id uuid NOT NULL REFERENCES public.classes (id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects (id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now ()
);

CREATE TABLE public.class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  class_id uuid NOT NULL REFERENCES public.classes (id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects (id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  schedule_id uuid REFERENCES public.class_schedules (id) ON DELETE SET NULL,
  session_date date NOT NULL,
  start_time time,
  end_time time,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now (),
  UNIQUE (class_id, subject_id, teacher_id, session_date, start_time)
);

CREATE INDEX idx_class_sessions_date ON public.class_sessions (session_date);
CREATE INDEX idx_class_sessions_teacher ON public.class_sessions (teacher_id);

CREATE TABLE public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  session_id uuid NOT NULL REFERENCES public.class_sessions (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  recorded_by uuid REFERENCES public.profiles (id),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now (),
  UNIQUE (session_id, student_id)
);

CREATE INDEX idx_attendance_session ON public.attendance_records (session_id);
CREATE INDEX idx_attendance_student ON public.attendance_records (student_id);

CREATE TABLE public.lesson_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  session_id uuid NOT NULL REFERENCES public.class_sessions (id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  topic text,
  content text NOT NULL,
  homework text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now (),
  UNIQUE (session_id)
);

CREATE TABLE public.excuse_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  attendance_record_id uuid NOT NULL REFERENCES public.attendance_records (id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  reason_category text NOT NULL CHECK (
    reason_category IN ('medical', 'family', 'travel', 'other')
  ),
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now (),
  UNIQUE (attendance_record_id, parent_id)
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
  recipient_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.students (id) ON DELETE CASCADE,
  type text NOT NULL CHECK (
    type IN (
      'absence_recorded',
      'excuse_submitted',
      'excuse_approved',
      'excuse_rejected',
      'system'
    )
  ),
  title text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'info' CHECK (status IN ('info', 'pending', 'success', 'error')),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON public.notifications (recipient_id);
CREATE INDEX idx_notifications_created ON public.notifications (created_at DESC);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at ()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at ();

CREATE TRIGGER trg_classes_updated
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at ();

CREATE TRIGGER trg_students_updated
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at ();

CREATE TRIGGER trg_subjects_updated
BEFORE UPDATE ON public.subjects
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at ();

CREATE TRIGGER trg_teacher_assignments_updated
BEFORE UPDATE ON public.teacher_assignments
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at ();

CREATE TRIGGER trg_class_schedules_updated
BEFORE UPDATE ON public.class_schedules
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at ();

CREATE TRIGGER trg_class_sessions_updated
BEFORE UPDATE ON public.class_sessions
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at ();

CREATE TRIGGER trg_attendance_records_updated
BEFORE UPDATE ON public.attendance_records
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at ();

CREATE TRIGGER trg_lesson_logs_updated
BEFORE UPDATE ON public.lesson_logs
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at ();

CREATE TRIGGER trg_excuse_requests_updated
BEFORE UPDATE ON public.excuse_requests
FOR EACH ROW
EXECUTE PROCEDURE public.set_updated_at ();

-- -----------------------------------------------------------------------------
-- Helper functions (spec §10.1–10.2 + assignment helpers for RLS)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.current_user_role ()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid ()
$$;

CREATE OR REPLACE FUNCTION public.is_admin ()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid ()
      AND role = 'admin'
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.teacher_teaches_class_subject (
  p_teacher uuid,
  p_class uuid,
  p_subject uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.teacher_assignments ta
    WHERE ta.teacher_id = p_teacher
      AND ta.class_id = p_class
      AND ta.subject_id = p_subject
      AND ta.is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.parent_has_student (p_parent uuid, p_student uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.parent_students ps
    WHERE ps.parent_id = p_parent
      AND ps.student_id = p_student
  )
$$;

CREATE OR REPLACE FUNCTION public.teacher_assigned_to_student (p_teacher uuid, p_student uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.teacher_assignments ta ON ta.class_id = s.class_id
    WHERE s.id = p_student
      AND ta.teacher_id = p_teacher
      AND ta.is_active = true
      AND s.is_active = true
  )
$$;

GRANT EXECUTE ON FUNCTION public.current_user_role () TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin () TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_teaches_class_subject (uuid, uuid, uuid) TO anon,
authenticated;
GRANT EXECUTE ON FUNCTION public.parent_has_student (uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.teacher_assigned_to_student (uuid, uuid) TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excuse_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated USING (
  id = auth.uid ()
  OR public.is_admin ()
);

CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin ());

CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated USING (
  public.is_admin ()
  OR id = auth.uid ()
)
WITH CHECK (
  public.is_admin ()
  OR (
    id = auth.uid ()
    AND role = (
      SELECT p.role
      FROM public.profiles p
      WHERE p.id = auth.uid ()
    )
  )
);

CREATE POLICY profiles_delete ON public.profiles FOR DELETE TO authenticated USING (public.is_admin ());

-- Teachers may read parent profiles linked to students in their assigned classes (excuses / notifications).
CREATE POLICY profiles_select_teacher_linked_parents ON public.profiles FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND profiles.role = 'parent'
  AND EXISTS (
    SELECT 1
    FROM public.parent_students ps
    JOIN public.students s ON s.id = ps.student_id
    JOIN public.teacher_assignments ta ON ta.class_id = s.class_id
      AND ta.teacher_id = auth.uid ()
    WHERE ps.parent_id = profiles.id
      AND ta.is_active = true
  )
);

-- classes
CREATE POLICY classes_all_admin ON public.classes FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY classes_select_teacher ON public.classes FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND EXISTS (
    SELECT 1
    FROM public.teacher_assignments ta
    WHERE ta.class_id = classes.id
      AND ta.teacher_id = auth.uid ()
      AND ta.is_active = true
  )
);

CREATE POLICY classes_select_parent ON public.classes FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'parent'
  AND EXISTS (
    SELECT 1
    FROM public.students s
    JOIN public.parent_students ps ON ps.student_id = s.id
    WHERE s.class_id = classes.id
      AND ps.parent_id = auth.uid ()
  )
);

-- students
CREATE POLICY students_all_admin ON public.students FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY students_select_teacher ON public.students FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND EXISTS (
    SELECT 1
    FROM public.teacher_assignments ta
    WHERE ta.teacher_id = auth.uid ()
      AND ta.class_id = students.class_id
      AND ta.is_active = true
  )
);

CREATE POLICY students_select_parent ON public.students FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'parent'
  AND public.parent_has_student (auth.uid (), students.id)
);

-- parent_students
CREATE POLICY parent_students_all_admin ON public.parent_students FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY parent_students_select_parent ON public.parent_students FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'parent'
  AND parent_id = auth.uid ()
);

-- subjects
CREATE POLICY subjects_all_admin ON public.subjects FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY subjects_select_teacher ON public.subjects FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND EXISTS (
    SELECT 1
    FROM public.teacher_assignments ta
    WHERE ta.teacher_id = auth.uid ()
      AND ta.subject_id = subjects.id
      AND ta.is_active = true
  )
);

CREATE POLICY subjects_select_parent ON public.subjects FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'parent'
  AND EXISTS (
    SELECT 1
    FROM public.parent_students ps
    JOIN public.attendance_records ar ON ar.student_id = ps.student_id
    JOIN public.class_sessions cs ON cs.id = ar.session_id
    WHERE ps.parent_id = auth.uid ()
      AND cs.subject_id = subjects.id
  )
);

-- teacher_assignments
CREATE POLICY teacher_assignments_all_admin ON public.teacher_assignments FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY teacher_assignments_select_teacher ON public.teacher_assignments FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND teacher_id = auth.uid ()
);

-- class_schedules
CREATE POLICY class_schedules_all_admin ON public.class_schedules FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY class_schedules_select_teacher ON public.class_schedules FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND teacher_id = auth.uid ()
);

-- class_sessions
CREATE POLICY class_sessions_all_admin ON public.class_sessions FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY class_sessions_teacher_rw ON public.class_sessions FOR ALL TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND teacher_id = auth.uid ()
  AND public.teacher_teaches_class_subject (auth.uid (), class_id, subject_id)
)
WITH CHECK (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND teacher_id = auth.uid ()
  AND public.teacher_teaches_class_subject (auth.uid (), class_id, subject_id)
);

CREATE POLICY class_sessions_select_parent ON public.class_sessions FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'parent'
  AND EXISTS (
    SELECT 1
    FROM public.attendance_records ar
    JOIN public.parent_students ps ON ps.student_id = ar.student_id
    WHERE ar.session_id = class_sessions.id
      AND ps.parent_id = auth.uid ()
  )
);

-- attendance_records
CREATE POLICY attendance_all_admin ON public.attendance_records FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY attendance_teacher_rw ON public.attendance_records FOR ALL TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND EXISTS (
    SELECT 1
    FROM public.class_sessions cs
    WHERE cs.id = attendance_records.session_id
      AND cs.teacher_id = auth.uid ()
      AND public.teacher_teaches_class_subject (auth.uid (), cs.class_id, cs.subject_id)
  )
)
WITH CHECK (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND EXISTS (
    SELECT 1
    FROM public.class_sessions cs
    WHERE cs.id = attendance_records.session_id
      AND cs.teacher_id = auth.uid ()
      AND public.teacher_teaches_class_subject (auth.uid (), cs.class_id, cs.subject_id)
  )
);

CREATE POLICY attendance_select_parent ON public.attendance_records FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'parent'
  AND public.parent_has_student (auth.uid (), attendance_records.student_id)
);

-- lesson_logs
CREATE POLICY lesson_logs_all_admin ON public.lesson_logs FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY lesson_logs_teacher_rw ON public.lesson_logs FOR ALL TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND teacher_id = auth.uid ()
  AND EXISTS (
    SELECT 1
    FROM public.class_sessions cs
    WHERE cs.id = lesson_logs.session_id
      AND cs.teacher_id = auth.uid ()
      AND public.teacher_teaches_class_subject (auth.uid (), cs.class_id, cs.subject_id)
  )
)
WITH CHECK (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND teacher_id = auth.uid ()
  AND EXISTS (
    SELECT 1
    FROM public.class_sessions cs
    WHERE cs.id = lesson_logs.session_id
      AND cs.teacher_id = auth.uid ()
      AND public.teacher_teaches_class_subject (auth.uid (), cs.class_id, cs.subject_id)
  )
);

-- excuse_requests
CREATE POLICY excuse_all_admin ON public.excuse_requests FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY excuse_select_teacher ON public.excuse_requests FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND public.teacher_assigned_to_student (auth.uid (), excuse_requests.student_id)
);

CREATE POLICY excuse_update_teacher ON public.excuse_requests FOR UPDATE TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND public.teacher_assigned_to_student (auth.uid (), excuse_requests.student_id)
)
WITH CHECK (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND public.teacher_assigned_to_student (auth.uid (), excuse_requests.student_id)
);

CREATE POLICY excuse_select_parent ON public.excuse_requests FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND public.current_user_role () = 'parent'
  AND parent_id = auth.uid ()
);

CREATE POLICY excuse_insert_parent ON public.excuse_requests FOR INSERT TO authenticated WITH CHECK (
  NOT public.is_admin ()
  AND public.current_user_role () = 'parent'
  AND parent_id = auth.uid ()
  AND public.parent_has_student (auth.uid (), excuse_requests.student_id)
);

-- notifications
CREATE POLICY notifications_all_admin ON public.notifications FOR ALL TO authenticated USING (public.is_admin ())
WITH CHECK (public.is_admin ());

CREATE POLICY notifications_select_own ON public.notifications FOR SELECT TO authenticated USING (
  NOT public.is_admin ()
  AND recipient_id = auth.uid ()
);

CREATE POLICY notifications_insert_teacher ON public.notifications FOR INSERT TO authenticated WITH CHECK (
  NOT public.is_admin ()
  AND public.current_user_role () = 'teacher'
  AND EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = notifications.recipient_id
      AND p.role = 'parent'
  )
  AND (
    notifications.student_id IS NULL
    OR public.parent_has_student (notifications.recipient_id, notifications.student_id)
  )
);
