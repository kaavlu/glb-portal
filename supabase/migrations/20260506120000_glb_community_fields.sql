-- GLB Komunitní skupina: student language groups, subject metadata, timetable period index

ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS language_group text;

ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.class_schedules
ADD COLUMN IF NOT EXISTS period_number smallint;

ALTER TABLE public.class_schedules
DROP CONSTRAINT IF EXISTS class_schedules_period_number_check;

ALTER TABLE public.class_schedules
ADD CONSTRAINT class_schedules_period_number_check CHECK (
  period_number IS NULL
  OR (period_number >= 1 AND period_number <= 9)
);
