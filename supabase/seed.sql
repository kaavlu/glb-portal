-- GLB Portal — Komunitní skupina seed (single group). Run after migrations.
-- Default teacher login (first in roster): marek.lnenicka@gybassi.cz / GLBTeacher2026!
-- Admin: admin@gybassi.cz / GLBAdmin2026!
-- Clears prior demo rows except admin auth user, then loads community group data.

-- -----------------------------------------------------------------------------
-- Reset school data (keep admin profile + auth user)
-- -----------------------------------------------------------------------------

DELETE FROM public.notifications;
DELETE FROM public.excuse_requests;
DELETE FROM public.attendance_records;
DELETE FROM public.lesson_logs;
DELETE FROM public.class_sessions;
DELETE FROM public.class_schedules;
DELETE FROM public.teacher_assignments;
DELETE FROM public.parent_students;
DELETE FROM public.students;
DELETE FROM public.subjects;
DELETE FROM public.classes;

DELETE FROM public.profiles
WHERE id <> '10000000-0000-4000-8000-000000000001'::uuid;

DELETE FROM auth.identities
WHERE user_id <> '10000000-0000-4000-8000-000000000001'::uuid;

DELETE FROM auth.users
WHERE id <> '10000000-0000-4000-8000-000000000001'::uuid;

-- -----------------------------------------------------------------------------
-- Auth users (email/password) — teachers
-- -----------------------------------------------------------------------------

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES
  (
    '10000000-0000-4000-8000-000000000101',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'marek.lnenicka@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000102',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'anna.cizkova@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000103',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'miroslava.bachtikova@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000104',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'lenka.cervova@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000105',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'petr.stohwasser@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000106',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'karolina.vasutova@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000107',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'kristyna.helgetova@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000108',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'kristyna.savrdova@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-000000000109',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'thomas.hodgetts@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-00000000010a',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'severino.garofalo@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-00000000010b',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'daniela.urbanova@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-00000000010c',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'hana.kulinova@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '10000000-0000-4000-8000-00000000010d',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'magda.alawoor@gybassi.cz',
    extensions.crypt ('GLBTeacher2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  (
    'e1000000-0000-4000-8000-000000000101',
    '10000000-0000-4000-8000-000000000101',
    '10000000-0000-4000-8000-000000000101',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-000000000101',
      'email',
      'marek.lnenicka@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-000000000102',
    '10000000-0000-4000-8000-000000000102',
    '10000000-0000-4000-8000-000000000102',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-000000000102',
      'email',
      'anna.cizkova@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-000000000103',
    '10000000-0000-4000-8000-000000000103',
    '10000000-0000-4000-8000-000000000103',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-000000000103',
      'email',
      'miroslava.bachtikova@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-000000000104',
    '10000000-0000-4000-8000-000000000104',
    '10000000-0000-4000-8000-000000000104',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-000000000104',
      'email',
      'lenka.cervova@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-000000000105',
    '10000000-0000-4000-8000-000000000105',
    '10000000-0000-4000-8000-000000000105',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-000000000105',
      'email',
      'petr.stohwasser@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-000000000106',
    '10000000-0000-4000-8000-000000000106',
    '10000000-0000-4000-8000-000000000106',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-000000000106',
      'email',
      'karolina.vasutova@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-000000000107',
    '10000000-0000-4000-8000-000000000107',
    '10000000-0000-4000-8000-000000000107',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-000000000107',
      'email',
      'kristyna.helgetova@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-000000000108',
    '10000000-0000-4000-8000-000000000108',
    '10000000-0000-4000-8000-000000000108',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-000000000108',
      'email',
      'kristyna.savrdova@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-000000000109',
    '10000000-0000-4000-8000-000000000109',
    '10000000-0000-4000-8000-000000000109',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-000000000109',
      'email',
      'thomas.hodgetts@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-00000000010a',
    '10000000-0000-4000-8000-00000000010a',
    '10000000-0000-4000-8000-00000000010a',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-00000000010a',
      'email',
      'severino.garofalo@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-00000000010b',
    '10000000-0000-4000-8000-00000000010b',
    '10000000-0000-4000-8000-00000000010b',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-00000000010b',
      'email',
      'daniela.urbanova@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-00000000010c',
    '10000000-0000-4000-8000-00000000010c',
    '10000000-0000-4000-8000-00000000010c',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-00000000010c',
      'email',
      'hana.kulinova@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  ),
  (
    'e1000000-0000-4000-8000-00000000010d',
    '10000000-0000-4000-8000-00000000010d',
    '10000000-0000-4000-8000-00000000010d',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-00000000010d',
      'email',
      'magda.alawoor@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  )
ON CONFLICT (id) DO NOTHING;

-- Ensure admin auth user exists (fresh environments)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@gybassi.cz',
    extensions.crypt ('GLBAdmin2026!', extensions.gen_salt ('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  (
    'e1000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    jsonb_build_object(
      'sub',
      '10000000-0000-4000-8000-000000000001',
      'email',
      'admin@gybassi.cz',
      'email_verified',
      true
    ),
    'email',
    now(),
    now(),
    now ()
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Profiles
-- -----------------------------------------------------------------------------

INSERT INTO public.profiles (id, full_name, email, role, initials, phone, is_active)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    'Admin User',
    'admin@gybassi.cz',
    'admin',
    'AU',
    null,
    true
  ),
  ('10000000-0000-4000-8000-000000000101', 'Marek Lněnička', 'marek.lnenicka@gybassi.cz', 'teacher', 'ML', null, true),
  ('10000000-0000-4000-8000-000000000102', 'Anna Čížková', 'anna.cizkova@gybassi.cz', 'teacher', 'AČ', null, true),
  ('10000000-0000-4000-8000-000000000103', 'Miroslava Bachtíková', 'miroslava.bachtikova@gybassi.cz', 'teacher', 'MB', null, true),
  ('10000000-0000-4000-8000-000000000104', 'Lenka Červová', 'lenka.cervova@gybassi.cz', 'teacher', 'LČ', null, true),
  ('10000000-0000-4000-8000-000000000105', 'Petr Stohwasser', 'petr.stohwasser@gybassi.cz', 'teacher', 'PS', null, true),
  ('10000000-0000-4000-8000-000000000106', 'Karolína Vašutová', 'karolina.vasutova@gybassi.cz', 'teacher', 'KV', null, true),
  ('10000000-0000-4000-8000-000000000107', 'Kristýna Helgetová', 'kristyna.helgetova@gybassi.cz', 'teacher', 'KH', null, true),
  ('10000000-0000-4000-8000-000000000108', 'Kristýna Šavrdová', 'kristyna.savrdova@gybassi.cz', 'teacher', 'KŠ', null, true),
  ('10000000-0000-4000-8000-000000000109', 'Thomas Hodgetts', 'thomas.hodgetts@gybassi.cz', 'teacher', 'TH', null, true),
  ('10000000-0000-4000-8000-00000000010a', 'Severino Garofalo', 'severino.garofalo@gybassi.cz', 'teacher', 'SG', null, true),
  ('10000000-0000-4000-8000-00000000010b', 'Daniela Urbanová', 'daniela.urbanova@gybassi.cz', 'teacher', 'DU', null, true),
  ('10000000-0000-4000-8000-00000000010c', 'Hana Kulinová', 'hana.kulinova@gybassi.cz', 'teacher', 'HK', null, true),
  ('10000000-0000-4000-8000-00000000010d', 'Magda Alawoor', 'magda.alawoor@gybassi.cz', 'teacher', 'MA', null, true)
ON CONFLICT (id) DO UPDATE
SET
  full_name = excluded.full_name,
  email = excluded.email,
  role = excluded.role,
  initials = excluded.initials,
  is_active = excluded.is_active;

-- -----------------------------------------------------------------------------
-- Class, subjects, students
-- -----------------------------------------------------------------------------

INSERT INTO public.classes (id, name, school_year, is_active)
VALUES ('20000000-0000-4000-8000-000000000001', 'Komunitní skupina', '2025/2026', true)
ON CONFLICT (id) DO UPDATE
SET
  name = excluded.name,
  school_year = excluded.school_year,
  is_active = excluded.is_active;

INSERT INTO public.subjects (id, name, full_name, notes, is_active)
VALUES
  (
    '30000000-0000-4000-8000-000000000201',
    'Hum',
    'Humanities',
    'Co-taught',
    true
  ),
  (
    '30000000-0000-4000-8000-000000000202',
    'ČjH',
    'Czech language/literature with historical context',
    'Monday/Thursday teacher split',
    true
  ),
  (
    '30000000-0000-4000-8000-000000000203',
    'M',
    'Mathematics',
    null,
    true
  ),
  (
    '30000000-0000-4000-8000-000000000204',
    'Sci',
    'Science',
    null,
    true
  ),
  (
    '30000000-0000-4000-8000-000000000205',
    'Tech',
    'Technology and Informatics',
    'Timetable may display ArtTech',
    true
  ),
  (
    '30000000-0000-4000-8000-000000000206',
    'VaB',
    'Negotiation and Business',
    'Co-taught',
    true
  ),
  (
    '30000000-0000-4000-8000-000000000207',
    'AJ',
    'English',
    'Co-taught',
    true
  ),
  (
    '30000000-0000-4000-8000-000000000208',
    'ŠJ1',
    'Spanish',
    'Language subgroup',
    true
  ),
  (
    '30000000-0000-4000-8000-000000000209',
    'NJ1',
    'German',
    'Language subgroup',
    true
  ),
  (
    '30000000-0000-4000-8000-00000000020a',
    'FJ1',
    'French',
    'Language subgroup',
    true
  ),
  (
    '30000000-0000-4000-8000-00000000020b',
    'TH',
    'Homeroom',
    null,
    true
  )
ON CONFLICT (id) DO UPDATE
SET
  name = excluded.name,
  full_name = excluded.full_name,
  notes = excluded.notes,
  is_active = excluded.is_active;

INSERT INTO public.students (id, full_name, initials, class_id, language_group, is_active)
VALUES
  (
    '40000000-0000-4000-8000-000000000301',
    'Matěj Dušátko',
    'MD',
    '20000000-0000-4000-8000-000000000001',
    'ŠJ1',
    true
  ),
  (
    '40000000-0000-4000-8000-000000000302',
    'Tomáš Exner',
    'TE',
    '20000000-0000-4000-8000-000000000001',
    'NJ1',
    true
  ),
  (
    '40000000-0000-4000-8000-000000000303',
    'Hugo Kozák',
    'HK',
    '20000000-0000-4000-8000-000000000001',
    'ŠJ1',
    true
  ),
  (
    '40000000-0000-4000-8000-000000000304',
    'Sebastien Longa',
    'SL',
    '20000000-0000-4000-8000-000000000001',
    'ŠJ1',
    true
  ),
  (
    '40000000-0000-4000-8000-000000000305',
    'Matylda Pivoňková',
    'MP',
    '20000000-0000-4000-8000-000000000001',
    'NJ1',
    true
  ),
  (
    '40000000-0000-4000-8000-000000000306',
    'Mariana Urbanová',
    'MU',
    '20000000-0000-4000-8000-000000000001',
    'FJ1',
    true
  ),
  (
    '40000000-0000-4000-8000-000000000307',
    'Christine Young',
    'CY',
    '20000000-0000-4000-8000-000000000001',
    'FJ1',
    true
  )
ON CONFLICT (id) DO UPDATE
SET
  full_name = excluded.full_name,
  initials = excluded.initials,
  class_id = excluded.class_id,
  language_group = excluded.language_group,
  is_active = excluded.is_active;

-- Teacher assignments (Komunitní skupina)
INSERT INTO public.teacher_assignments (teacher_id, class_id, subject_id, is_active)
VALUES
  ('10000000-0000-4000-8000-000000000101', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000201', true),
  ('10000000-0000-4000-8000-000000000102', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000201', true),
  ('10000000-0000-4000-8000-000000000103', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000202', true),
  ('10000000-0000-4000-8000-000000000104', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000202', true),
  ('10000000-0000-4000-8000-000000000105', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000203', true),
  ('10000000-0000-4000-8000-000000000106', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000204', true),
  ('10000000-0000-4000-8000-000000000107', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000205', true),
  ('10000000-0000-4000-8000-000000000108', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000206', true),
  ('10000000-0000-4000-8000-000000000102', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000206', true),
  ('10000000-0000-4000-8000-000000000109', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000207', true),
  ('10000000-0000-4000-8000-00000000010a', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000207', true),
  ('10000000-0000-4000-8000-00000000010b', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000208', true),
  ('10000000-0000-4000-8000-00000000010c', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000209', true),
  ('10000000-0000-4000-8000-00000000010d', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-00000000020a', true),
  ('10000000-0000-4000-8000-000000000102', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-00000000020b', true);

-- Weekly timetable (day_of_week: Mon=1 … Fri=5). Co-taught = one row per teacher.
INSERT INTO public.class_schedules (
  id,
  class_id,
  subject_id,
  teacher_id,
  day_of_week,
  period_number,
  start_time,
  end_time,
  room,
  is_active
)
VALUES
  ('b0000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000101', 1, 1, time '08:30', time '09:15', null, true),
  ('b0000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000102', 1, 1, time '08:30', time '09:15', null, true),
  ('b0000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000103', 1, 3, time '10:20', time '11:05', null, true),
  ('b0000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000101', 1, 5, time '12:05', time '12:50', null, true),
  ('b0000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000201', '10000000-0000-4000-8000-000000000102', 1, 5, time '12:05', time '12:50', null, true),
  ('b0000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-00000000020a', '10000000-0000-4000-8000-00000000010d', 1, 8, time '14:35', time '15:20', null, true),
  ('b0000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000203', '10000000-0000-4000-8000-000000000105', 2, 1, time '08:30', time '09:15', null, true),
  ('b0000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000204', '10000000-0000-4000-8000-000000000106', 2, 3, time '10:20', time '11:05', null, true),
  ('b0000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000204', '10000000-0000-4000-8000-000000000106', 2, 5, time '12:05', time '12:50', null, true),
  ('b0000000-0000-4000-8000-00000000000a', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000205', '10000000-0000-4000-8000-000000000107', 3, 3, time '10:20', time '11:05', null, true),
  ('b0000000-0000-4000-8000-00000000000b', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000206', '10000000-0000-4000-8000-000000000108', 3, 5, time '12:05', time '12:50', null, true),
  ('b0000000-0000-4000-8000-00000000000c', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000206', '10000000-0000-4000-8000-000000000102', 3, 5, time '12:05', time '12:50', null, true),
  ('b0000000-0000-4000-8000-00000000000d', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000202', '10000000-0000-4000-8000-000000000104', 4, 1, time '08:30', time '09:15', null, true),
  ('b0000000-0000-4000-8000-00000000000e', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000207', '10000000-0000-4000-8000-000000000109', 4, 3, time '10:20', time '11:05', null, true),
  ('b0000000-0000-4000-8000-00000000000f', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000207', '10000000-0000-4000-8000-00000000010a', 4, 3, time '10:20', time '11:05', null, true),
  ('b0000000-0000-4000-8000-000000000010', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000208', '10000000-0000-4000-8000-00000000010b', 4, 5, time '12:05', time '12:50', null, true),
  ('b0000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000209', '10000000-0000-4000-8000-00000000010c', 4, 5, time '12:05', time '12:50', null, true),
  ('b0000000-0000-4000-8000-000000000012', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000208', '10000000-0000-4000-8000-00000000010b', 5, 1, time '08:30', time '09:15', null, true),
  ('b0000000-0000-4000-8000-000000000013', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000209', '10000000-0000-4000-8000-00000000010c', 5, 1, time '08:30', time '09:15', null, true),
  ('b0000000-0000-4000-8000-000000000014', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000203', '10000000-0000-4000-8000-000000000105', 5, 2, time '09:20', time '10:05', null, true),
  ('b0000000-0000-4000-8000-000000000015', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000207', '10000000-0000-4000-8000-000000000109', 5, 4, time '11:10', time '11:55', null, true),
  ('b0000000-0000-4000-8000-000000000016', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000207', '10000000-0000-4000-8000-00000000010a', 5, 4, time '11:10', time '11:55', null, true),
  ('b0000000-0000-4000-8000-000000000017', '20000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-00000000020b', '10000000-0000-4000-8000-000000000102', 5, 6, time '12:55', time '13:40', null, true)
ON CONFLICT (id) DO UPDATE
SET
  class_id = excluded.class_id,
  subject_id = excluded.subject_id,
  teacher_id = excluded.teacher_id,
  day_of_week = excluded.day_of_week,
  period_number = excluded.period_number,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  room = excluded.room,
  is_active = excluded.is_active;

-- -----------------------------------------------------------------------------
-- If Marek’s auth.users id differs from seed, remap his rows to the real id
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
    RAISE NOTICE 'repair_demo_teacher_ids: Marek auth id already matches seed — nothing to do';
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
