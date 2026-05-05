import "server-only";

import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getInitials } from "@/lib/utils/initials";
import type { Database, DbRow, TablesInsert, TablesUpdate } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminAttendanceFilters,
  AdminAttendanceRow,
  AdminDashboardStats,
  AdminSeedHealth,
  AdminExcuseFilters,
  AdminExcuseRow,
  AdminLessonFilters,
  AdminLessonLogRow,
  ClassListRow,
  ClassScheduleListRow,
  ListStudentsFilters,
  ParentListRow,
  RecentAbsenceRow,
  RecentExcuseRow,
  RecentLessonLogRow,
  StudentListRow,
  SubjectListRow,
  TeacherAssignmentListRow,
  TeacherListRow,
} from "@/types/admin";
import type { AttendanceStatus, ExcuseStatus } from "@/types/domain";

function escapeIlike(q: string): string {
  return q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * Admin dashboard reads/writes must see full school data regardless of RLS edge cases
 * (stale JWT, session timing). Prefer service role when configured (server-only).
 */
async function db(): Promise<SupabaseClient<Database>> {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active || profile.role !== "admin") {
    throw new Error("Admin privileges are required for this operation.");
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return createAdminClient() as unknown as SupabaseClient<Database>;
  }
  return (await createClient()) as unknown as SupabaseClient<Database>;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await db();

  const [
    { data: studentRows },
    { count: teachersCount },
    { count: subjectsCount },
    { data: classRows },
    { count: weeklyCount },
  ] = await Promise.all([
    supabase.from("students").select("id, language_group").eq("is_active", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher").eq("is_active", true),
    supabase.from("subjects").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("classes").select("id, name").eq("is_active", true),
    supabase.from("class_schedules").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const students = studentRows ?? [];
  const totalStudents = students.length;
  const fj1 = students.filter((s) => s.language_group === "FJ1").length;
  const sj1 = students.filter((s) => s.language_group === "ŠJ1").length;
  const nj1 = students.filter((s) => s.language_group === "NJ1").length;

  const studentIds = students.map((s) => s.id);
  let parentLinksMissing = 0;
  if (studentIds.length > 0) {
    const { data: links } = await supabase.from("parent_students").select("student_id").in("student_id", studentIds);
    const linked = new Set((links ?? []).map((l) => l.student_id));
    parentLinksMissing = students.filter((s) => !linked.has(s.id)).length;
  }

  const classes = classRows ?? [];
  const totalGroups = classes.length;
  const primaryGroupName = totalGroups === 1 ? classes[0]?.name ?? null : null;

  return {
    totalStudents,
    totalTeachers: teachersCount ?? 0,
    totalSubjects: subjectsCount ?? 0,
    totalGroups,
    primaryGroupName,
    weeklySessions: weeklyCount ?? 0,
    parentLinksMissing,
    studentsByLanguage: {
      fj1,
      sj1,
      nj1,
      allMainClasses: totalStudents,
    },
  };
}

export async function getAdminSeedHealth(): Promise<AdminSeedHealth> {
  const supabase = await db();

  const [
    { count: parentCount },
    { data: jf1Row },
    { data: artTechRow },
    { data: classes },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "parent").eq("is_active", true),
    supabase.from("subjects").select("id").eq("name", "JF1").maybeSingle(),
    supabase.from("subjects").select("id").eq("name", "ArtTech").maybeSingle(),
    supabase.from("classes").select("id, name").eq("is_active", true),
  ]);

  const { data: activeStudents } = await supabase.from("students").select("id").eq("is_active", true);
  const ids = (activeStudents ?? []).map((s) => s.id);
  let studentsWithoutLinkedParents = 0;
  if (ids.length > 0) {
    const { data: links } = await supabase.from("parent_students").select("student_id").in("student_id", ids);
    const linked = new Set((links ?? []).map((l) => l.student_id));
    studentsWithoutLinkedParents = ids.filter((id) => !linked.has(id)).length;
  }

  const cls = classes ?? [];
  const singleGroupMode = cls.length === 1 ? cls[0]?.name ?? null : null;

  return {
    parentDataMissing: (parentCount ?? 0) === 0,
    studentsWithoutLinkedParents,
    fj1Normalized: !jf1Row,
    techNormalized: !artTechRow,
    singleGroupMode,
  };
}

export async function getRecentAbsencesForAdmin(limit = 8): Promise<RecentAbsenceRow[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("attendance_records")
    .select(
      `
      id,
      recorded_at,
      status,
      students(full_name),
      class_sessions(session_date, classes(name), subjects(name))
    `,
    )
    .in("status", ["absent", "late"])
    .order("recorded_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => {
    const session = row.class_sessions as unknown as {
      session_date: string;
      classes: { name: string } | null;
      subjects: { name: string } | null;
    } | null;
    const st = row.students as unknown as { full_name: string } | null;
    return {
      id: row.id,
      recordedAt: row.recorded_at,
      status: row.status as AttendanceStatus,
      studentName: st?.full_name ?? "—",
      sessionDate: session?.session_date ?? "",
      className: session?.classes?.name ?? "—",
      subjectName: session?.subjects?.name ?? "—",
    };
  });
}

export async function getRecentLessonLogsForAdmin(limit = 8): Promise<RecentLessonLogRow[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("lesson_logs")
    .select(
      `
      id,
      updated_at,
      topic,
      profiles!lesson_logs_teacher_id_fkey(full_name),
      class_sessions(session_date, classes(name), subjects(name))
    `,
    )
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => {
    const session = row.class_sessions as unknown as {
      session_date: string;
      classes: { name: string } | null;
      subjects: { name: string } | null;
    } | null;
    const teacher = row.profiles as unknown as { full_name: string } | null;
    return {
      id: row.id,
      updatedAt: row.updated_at,
      topic: row.topic,
      teacherName: teacher?.full_name ?? "—",
      sessionDate: session?.session_date ?? "",
      className: session?.classes?.name ?? "—",
      subjectName: session?.subjects?.name ?? "—",
    };
  });
}

export async function getRecentExcusesForAdmin(limit = 8): Promise<RecentExcuseRow[]> {
  const supabase = await db();
  const { data, error } = await supabase
    .from("excuse_requests")
    .select(
      `
      id,
      created_at,
      status,
      reason_category,
      students(full_name, class_id, classes(name))
    `,
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => {
    const st = row.students as unknown as {
      full_name: string;
      classes: { name: string } | null;
    } | null;
    return {
      id: row.id,
      createdAt: row.created_at,
      studentName: st?.full_name ?? "—",
      className: st?.classes?.name ?? null,
      status: row.status as ExcuseStatus,
      reasonCategory: row.reason_category,
    };
  });
}

export async function listTeachers(search?: string): Promise<TeacherListRow[]> {
  const supabase = await db();
  let query = supabase.from("profiles").select("*").eq("role", "teacher").order("full_name");

  const q = search?.trim();
  if (q) {
    const safe = `%${escapeIlike(q)}%`;
    query = query.or(`full_name.ilike.${safe},email.ilike.${safe}`);
  }

  const { data: teachers, error } = await query;
  if (error || !teachers) return [];

  const { data: assigns } = await supabase
    .from("teacher_assignments")
    .select("teacher_id, class_id, subject_id, subjects(name)")
    .eq("is_active", true);

  const teachersPerPair = new Map<string, Set<string>>();
  const subjectAbbrevsByTeacher = new Map<string, Set<string>>();

  for (const a of assigns ?? []) {
    const sub = (a.subjects as unknown as { name: string } | null)?.name ?? "?";
    const pairKey = `${a.class_id}:${a.subject_id}`;
    const set = teachersPerPair.get(pairKey) ?? new Set();
    set.add(a.teacher_id);
    teachersPerPair.set(pairKey, set);

    const abbrevs = subjectAbbrevsByTeacher.get(a.teacher_id) ?? new Set();
    abbrevs.add(sub);
    subjectAbbrevsByTeacher.set(a.teacher_id, abbrevs);
  }

  return teachers.map((t) => {
    const abbrevs = subjectAbbrevsByTeacher.get(t.id) ?? new Set();
    let isCoTeacher = false;
    for (const a of assigns ?? []) {
      if (a.teacher_id !== t.id) continue;
      const pairKey = `${a.class_id}:${a.subject_id}`;
      const cnt = teachersPerPair.get(pairKey)?.size ?? 0;
      if (cnt > 1) {
        isCoTeacher = true;
        break;
      }
    }
    return {
      id: t.id,
      full_name: t.full_name,
      email: t.email,
      initials: t.initials,
      phone: t.phone,
      is_active: t.is_active,
      assignedSubjects: [...abbrevs].sort().join(", ") || "—",
      isCoTeacher,
    };
  });
}

type ProfileInsert = TablesInsert<"profiles">;
type ProfileUpdate = TablesUpdate<"profiles">;

export async function createTeacher(input: {
  email: string;
  password: string;
  full_name: string;
  initials?: string | null;
  phone?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      error:
        "SUPABASE_SERVICE_ROLE_KEY is not configured. Create the teacher user in Supabase Auth, then add a matching profiles row (see docs/implementation-notes.md).",
    };
  }

  const admin = createAdminClient();
  const initials = input.initials?.trim() || getInitials(input.full_name);

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    password: input.password,
    email_confirm: true,
  });

  if (authError || !created.user) {
    return { ok: false, error: authError?.message ?? "Failed to create auth user" };
  }

  const supabase = await db();
  const row: ProfileInsert = {
    id: created.user.id,
    email: input.email.trim(),
    full_name: input.full_name.trim(),
    role: "teacher",
    initials,
    phone: input.phone?.trim() || null,
    is_active: true,
  };

  const { error: profileError } = await supabase.from("profiles").insert(row);

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: profileError.message };
  }

  return { ok: true };
}

export async function updateTeacher(
  id: string,
  input: { full_name?: string; email?: string; initials?: string | null; phone?: string | null },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const patch: ProfileUpdate = {};
  if (input.full_name !== undefined) patch.full_name = input.full_name;
  if (input.email !== undefined) patch.email = input.email;
  if (input.initials !== undefined) patch.initials = input.initials;
  if (input.phone !== undefined) patch.phone = input.phone;

  const { error } = await supabase.from("profiles").update(patch).eq("id", id).eq("role", "teacher");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deactivateTeacher(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", id)
    .eq("role", "teacher");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reactivateTeacher(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("profiles").update({ is_active: true }).eq("id", id).eq("role", "teacher");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listParents(search?: string): Promise<ParentListRow[]> {
  const supabase = await db();
  let query = supabase.from("profiles").select("*").eq("role", "parent").order("full_name");

  const q = search?.trim();
  if (q) {
    const safe = `%${escapeIlike(q)}%`;
    query = query.or(`full_name.ilike.${safe},email.ilike.${safe}`);
  }

  const { data: parents, error } = await query;
  if (error || !parents) return [];

  const { data: links } = await supabase
    .from("parent_students")
    .select("parent_id, students(full_name)")
    .order("student_id");

  const map = new Map<string, string[]>();
  for (const l of links ?? []) {
    const name = (l.students as unknown as { full_name: string } | null)?.full_name ?? "?";
    const arr = map.get(l.parent_id) ?? [];
    arr.push(name);
    map.set(l.parent_id, arr);
  }

  return parents.map((p) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    initials: p.initials,
    phone: p.phone,
    is_active: p.is_active,
    linkedStudents: (map.get(p.id) ?? []).join(", ") || "—",
  }));
}

export async function createParent(input: {
  email: string;
  password: string;
  full_name: string;
  initials?: string | null;
  phone?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      error:
        "SUPABASE_SERVICE_ROLE_KEY is not configured. Create the parent user in Supabase Auth, then add a matching profiles row (see docs/implementation-notes.md).",
    };
  }

  const admin = createAdminClient();
  const initials = input.initials?.trim() || getInitials(input.full_name);

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    password: input.password,
    email_confirm: true,
  });

  if (authError || !created.user) {
    return { ok: false, error: authError?.message ?? "Failed to create auth user" };
  }

  const supabase = await db();
  const row: ProfileInsert = {
    id: created.user.id,
    email: input.email.trim(),
    full_name: input.full_name.trim(),
    role: "parent",
    initials,
    phone: input.phone?.trim() || null,
    is_active: true,
  };

  const { error: profileError } = await supabase.from("profiles").insert(row);

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: profileError.message };
  }

  return { ok: true };
}

export async function updateParent(
  id: string,
  input: { full_name?: string; email?: string; initials?: string | null; phone?: string | null },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const patch: ProfileUpdate = {};
  if (input.full_name !== undefined) patch.full_name = input.full_name;
  if (input.email !== undefined) patch.email = input.email;
  if (input.initials !== undefined) patch.initials = input.initials;
  if (input.phone !== undefined) patch.phone = input.phone;

  const { error } = await supabase.from("profiles").update(patch).eq("id", id).eq("role", "parent");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deactivateParent(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", id).eq("role", "parent");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reactivateParent(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("profiles").update({ is_active: true }).eq("id", id).eq("role", "parent");

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listStudents(filters: ListStudentsFilters = {}): Promise<StudentListRow[]> {
  const supabase = await db();
  let query = supabase
    .from("students")
    .select("*, classes(name)")
    .order("full_name");

  const q = filters.search?.trim();
  if (q) {
    const safe = `%${escapeIlike(q)}%`;
    query = query.ilike("full_name", safe);
  }

  if (filters.classId) {
    query = query.eq("class_id", filters.classId);
  }

  const { data: students, error } = await query;
  if (error || !students) return [];

  const { data: links } = await supabase.from("parent_students").select("student_id");

  const countMap = new Map<string, number>();
  for (const l of links ?? []) {
    countMap.set(l.student_id, (countMap.get(l.student_id) ?? 0) + 1);
  }

  return students.map((s) => {
    const cls = s.classes as unknown as { name: string } | null;
    return {
      id: s.id,
      full_name: s.full_name,
      initials: s.initials,
      class_id: s.class_id,
      class_name: cls?.name ?? null,
      language_group: s.language_group ?? null,
      is_active: s.is_active,
      linkedParentsCount: countMap.get(s.id) ?? 0,
    };
  });
}

type StudentInsert = TablesInsert<"students">;
type StudentUpdate = TablesUpdate<"students">;

export async function createStudent(input: {
  full_name: string;
  initials?: string | null;
  class_id?: string | null;
  language_group?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await db();
  const initials = input.initials?.trim() || getInitials(input.full_name);
  const lg = input.language_group?.trim();
  const row: StudentInsert = {
    full_name: input.full_name.trim(),
    initials,
    class_id: input.class_id ?? null,
    language_group: lg ? lg : null,
    is_active: true,
  };

  const { data, error } = await supabase.from("students").insert(row).select("id").single();

  if (error || !data) return { ok: false, error: error?.message ?? "Insert failed" };
  return { ok: true, id: data.id };
}

export async function updateStudent(
  id: string,
  input: {
    full_name?: string;
    initials?: string | null;
    class_id?: string | null;
    language_group?: string | null;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const patch: StudentUpdate = {};
  if (input.full_name !== undefined) patch.full_name = input.full_name;
  if (input.initials !== undefined) patch.initials = input.initials;
  if (input.class_id !== undefined) patch.class_id = input.class_id;
  if (input.language_group !== undefined) {
    const lg = input.language_group?.trim();
    patch.language_group = lg ? lg : null;
  }

  const { error } = await supabase.from("students").update(patch).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deactivateStudent(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("students").update({ is_active: false }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reactivateStudent(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("students").update({ is_active: true }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listClasses(search?: string): Promise<ClassListRow[]> {
  const supabase = await db();
  let query = supabase.from("classes").select("*").order("name");

  const q = search?.trim();
  if (q) {
    query = query.ilike("name", `%${escapeIlike(q)}%`);
  }

  const { data: classes, error } = await query;
  if (error || !classes) return [];

  const { data: counts } = await supabase.from("students").select("class_id").eq("is_active", true);

  const map = new Map<string, number>();
  for (const c of counts ?? []) {
    if (!c.class_id) continue;
    map.set(c.class_id, (map.get(c.class_id) ?? 0) + 1);
  }

  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    school_year: c.school_year,
    is_active: c.is_active,
    studentCount: map.get(c.id) ?? 0,
  }));
}

type ClassInsert = TablesInsert<"classes">;
type ClassUpdate = TablesUpdate<"classes">;

export async function createClass(input: {
  name: string;
  school_year?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const row: ClassInsert = {
    name: input.name.trim(),
    school_year: input.school_year?.trim() || null,
    is_active: true,
  };

  const { error } = await supabase.from("classes").insert(row);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateClass(
  id: string,
  input: { name?: string; school_year?: string | null },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const patch: ClassUpdate = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.school_year !== undefined) patch.school_year = input.school_year;

  const { error } = await supabase.from("classes").update(patch).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deactivateClass(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("classes").update({ is_active: false }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reactivateClass(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("classes").update({ is_active: true }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listSubjects(search?: string): Promise<SubjectListRow[]> {
  const supabase = await db();
  let query = supabase.from("subjects").select("*").order("name");

  const q = search?.trim();
  if (q) {
    const safe = `%${escapeIlike(q)}%`;
    query = query.or(`name.ilike.${safe},full_name.ilike.${safe}`);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const { data: assigns } = await supabase
    .from("teacher_assignments")
    .select("subject_id, profiles!teacher_assignments_teacher_id_fkey(full_name)")
    .eq("is_active", true);

  const map = new Map<string, Set<string>>();
  for (const a of assigns ?? []) {
    const name = (a.profiles as unknown as { full_name: string } | null)?.full_name ?? "?";
    const set = map.get(a.subject_id) ?? new Set();
    set.add(name);
    map.set(a.subject_id, set);
  }

  return data.map((s) => ({
    id: s.id,
    name: s.name,
    full_name: s.full_name,
    notes: s.notes,
    is_active: s.is_active,
    teachersSummary: [...(map.get(s.id) ?? [])].sort().join(", ") || "—",
  }));
}

type SubjectInsert = TablesInsert<"subjects">;
type SubjectUpdate = TablesUpdate<"subjects">;

export async function createSubject(input: {
  name: string;
  full_name?: string | null;
  notes?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Subject abbreviation is required." };

  const row: SubjectInsert = {
    name,
    full_name: input.full_name?.trim() || null,
    notes: input.notes?.trim() || null,
    is_active: true,
  };

  const { error } = await supabase.from("subjects").insert(row);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateSubject(
  id: string,
  input: { name?: string; full_name?: string | null; notes?: string | null },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const patch: SubjectUpdate = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) return { ok: false, error: "Subject abbreviation is required." };
    patch.name = name;
  }
  if (input.full_name !== undefined) patch.full_name = input.full_name?.trim() || null;
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null;

  const { error } = await supabase.from("subjects").update(patch).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deactivateSubject(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("subjects").update({ is_active: false }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reactivateSubject(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("subjects").update({ is_active: true }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listTeacherAssignments(search?: string): Promise<TeacherAssignmentListRow[]> {
  const supabase = await db();
  const query = supabase
    .from("teacher_assignments")
    .select(
      `
      id,
      teacher_id,
      class_id,
      subject_id,
      is_active,
      profiles!teacher_assignments_teacher_id_fkey(full_name),
      classes(name),
      subjects(name)
    `,
    )
    .order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error || !data) return [];

  const mapped = data.map((row) => {
    const teacher = row.profiles as unknown as { full_name: string } | null;
    const cls = row.classes as unknown as { name: string } | null;
    const sub = row.subjects as unknown as { name: string } | null;
    return {
      id: row.id,
      teacher_id: row.teacher_id,
      class_id: row.class_id,
      subject_id: row.subject_id,
      is_active: row.is_active,
      teacher_name: teacher?.full_name ?? "—",
      class_name: cls?.name ?? "—",
      subject_name: sub?.name ?? "—",
    };
  });

  const q = search?.trim().toLowerCase();
  if (!q) return mapped;
  return mapped.filter(
    (r) =>
      r.teacher_name.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.subject_name.toLowerCase().includes(q),
  );
}

type TaInsert = TablesInsert<"teacher_assignments">;
type TaUpdate = TablesUpdate<"teacher_assignments">;

async function upsertTeacherAssignmentLink(
  supabase: SupabaseClient<Database>,
  teacherId: string,
  classId: string,
  subjectId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const row: TaInsert = {
    teacher_id: teacherId,
    class_id: classId,
    subject_id: subjectId,
    is_active: true,
  };
  const { error } = await supabase.from("teacher_assignments").upsert(row, {
    onConflict: "teacher_id,class_id,subject_id",
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function createTeacherAssignment(input: {
  teacher_id: string;
  class_id: string;
  subject_id: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const row: TaInsert = {
    teacher_id: input.teacher_id,
    class_id: input.class_id,
    subject_id: input.subject_id,
    is_active: true,
  };

  const { error } = await supabase.from("teacher_assignments").insert(row);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateTeacherAssignment(
  id: string,
  input: { teacher_id?: string; class_id?: string; subject_id?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const patch: TaUpdate = {};
  if (input.teacher_id !== undefined) patch.teacher_id = input.teacher_id;
  if (input.class_id !== undefined) patch.class_id = input.class_id;
  if (input.subject_id !== undefined) patch.subject_id = input.subject_id;

  const { error } = await supabase.from("teacher_assignments").update(patch).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deactivateTeacherAssignment(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("teacher_assignments").update({ is_active: false }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reactivateTeacherAssignment(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("teacher_assignments").update({ is_active: true }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listClassSchedules(search?: string): Promise<ClassScheduleListRow[]> {
  const supabase = await db();
  const query = supabase
    .from("class_schedules")
    .select(
      `
      *,
      profiles!class_schedules_teacher_id_fkey(full_name),
      classes(name),
      subjects(name, full_name)
    `,
    )
    .order("day_of_week")
    .order("period_number", { ascending: true, nullsFirst: false })
    .order("start_time");

  const { data, error } = await query;
  if (error || !data) return [];

  const mapped = data.map((row) => {
    const teacher = row.profiles as unknown as { full_name: string } | null;
    const cls = row.classes as unknown as { name: string } | null;
    const sub = row.subjects as unknown as { name: string; full_name: string | null } | null;
    return {
      id: row.id,
      class_id: row.class_id,
      subject_id: row.subject_id,
      teacher_id: row.teacher_id,
      day_of_week: row.day_of_week,
      period_number: row.period_number,
      start_time: row.start_time,
      end_time: row.end_time,
      room: row.room,
      is_active: row.is_active,
      teacher_name: teacher?.full_name ?? "—",
      class_name: cls?.name ?? "—",
      subject_name: sub?.name ?? "—",
      subject_full_name: sub?.full_name ?? null,
    };
  });

  const q = search?.trim().toLowerCase();
  if (!q) return mapped;
  return mapped.filter(
    (r) =>
      r.teacher_name.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.subject_name.toLowerCase().includes(q) ||
      (r.subject_full_name?.toLowerCase().includes(q) ?? false),
  );
}

type CsInsert = TablesInsert<"class_schedules">;
type CsUpdate = TablesUpdate<"class_schedules">;

export async function createClassSchedule(input: {
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  period_number?: number | null;
  start_time: string;
  end_time: string;
  room?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const row: CsInsert = {
    class_id: input.class_id,
    subject_id: input.subject_id,
    teacher_id: input.teacher_id,
    day_of_week: input.day_of_week,
    period_number: input.period_number ?? null,
    start_time: input.start_time,
    end_time: input.end_time,
    room: input.room?.trim() || null,
    is_active: true,
  };

  const { error } = await supabase.from("class_schedules").insert(row);

  if (error) return { ok: false, error: error.message };

  const link = await upsertTeacherAssignmentLink(supabase, input.teacher_id, input.class_id, input.subject_id);
  if (!link.ok) return link;

  return { ok: true };
}

export async function updateClassSchedule(
  id: string,
  input: {
    class_id?: string;
    subject_id?: string;
    teacher_id?: string;
    day_of_week?: number;
    period_number?: number | null;
    start_time?: string;
    end_time?: string;
    room?: string | null;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const patch: CsUpdate = {};
  if (input.class_id !== undefined) patch.class_id = input.class_id;
  if (input.subject_id !== undefined) patch.subject_id = input.subject_id;
  if (input.teacher_id !== undefined) patch.teacher_id = input.teacher_id;
  if (input.day_of_week !== undefined) patch.day_of_week = input.day_of_week;
  if (input.period_number !== undefined) patch.period_number = input.period_number;
  if (input.start_time !== undefined) patch.start_time = input.start_time;
  if (input.end_time !== undefined) patch.end_time = input.end_time;
  if (input.room !== undefined) patch.room = input.room;

  const { error } = await supabase.from("class_schedules").update(patch).eq("id", id);

  if (error) return { ok: false, error: error.message };

  const { data: row, error: fetchErr } = await supabase
    .from("class_schedules")
    .select("teacher_id, class_id, subject_id, is_active")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (row?.is_active) {
    const link = await upsertTeacherAssignmentLink(supabase, row.teacher_id, row.class_id, row.subject_id);
    if (!link.ok) return link;
  }

  return { ok: true };
}

export async function deactivateClassSchedule(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("class_schedules").update({ is_active: false }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reactivateClassSchedule(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("class_schedules").update({ is_active: true }).eq("id", id);

  if (error) return { ok: false, error: error.message };

  const { data: row, error: fetchErr } = await supabase
    .from("class_schedules")
    .select("teacher_id, class_id, subject_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchErr) return { ok: false, error: fetchErr.message };
  if (row) {
    const link = await upsertTeacherAssignmentLink(supabase, row.teacher_id, row.class_id, row.subject_id);
    if (!link.ok) return link;
  }

  return { ok: true };
}

export async function linkParentToStudent(
  parentId: string,
  studentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const row: TablesInsert<"parent_students"> = {
    parent_id: parentId,
    student_id: studentId,
    relationship: "parent",
  };

  const { error } = await supabase.from("parent_students").insert(row);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function unlinkParentFromStudent(
  parentId: string,
  studentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("parent_students").delete().eq("parent_id", parentId).eq("student_id", studentId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

function summarizeExcuseStatuses(rows: { status: ExcuseStatus }[]): string {
  if (rows.length === 0) return "—";
  if (rows.some((r) => r.status === "pending")) return "Pending";
  if (rows.some((r) => r.status === "approved")) return "Approved";
  if (rows.some((r) => r.status === "rejected")) return "Rejected";
  return "—";
}

export async function listAdminAttendance(filters: AdminAttendanceFilters): Promise<AdminAttendanceRow[]> {
  const supabase = await db();

  let query = supabase
    .from("attendance_records")
    .select(
      `
      id,
      status,
      recorded_at,
      students(full_name),
      profiles:profiles!attendance_records_recorded_by_fkey(full_name),
      class_sessions(
        session_date,
        teacher_id,
        class_id,
        classes(name),
        subjects(name)
      )
    `,
    )
    .order("recorded_at", { ascending: false })
    .limit(500);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.studentId) {
    query = query.eq("student_id", filters.studentId);
  }

  const { data: rows, error } = await query;

  if (error || !rows) return [];

  let filtered = rows;

  if (filters.date) {
    filtered = filtered.filter((r) => {
      const session = r.class_sessions as unknown as { session_date: string } | null;
      return session?.session_date === filters.date;
    });
  }

  if (filters.classId) {
    filtered = filtered.filter((r) => {
      const session = r.class_sessions as unknown as { class_id: string } | null;
      return session?.class_id === filters.classId;
    });
  }

  if (filters.teacherId) {
    filtered = filtered.filter((r) => {
      const session = r.class_sessions as unknown as { teacher_id: string } | null;
      return session?.teacher_id === filters.teacherId;
    });
  }

  const attendanceIds = filtered.map((r) => r.id);

  let excuses: { attendance_record_id: string; status: string }[] | null = null;
  if (attendanceIds.length > 0) {
    const res = await supabase
      .from("excuse_requests")
      .select("attendance_record_id, status")
      .in("attendance_record_id", attendanceIds);
    excuses = res.data;
  }

  const excuseByAttendance = new Map<string, { status: ExcuseStatus }[]>();
  for (const e of excuses ?? []) {
    const arr = excuseByAttendance.get(e.attendance_record_id) ?? [];
    arr.push({ status: e.status as ExcuseStatus });
    excuseByAttendance.set(e.attendance_record_id, arr);
  }

  const result: AdminAttendanceRow[] = [];

  for (const row of filtered) {
    const session = row.class_sessions as unknown as {
      session_date: string;
      teacher_id: string;
      class_id: string;
      classes: { name: string } | null;
      subjects: { name: string } | null;
    } | null;

    const st = row.students as unknown as { full_name: string } | null;
    const rec = row.profiles as unknown as { full_name: string } | null;

    const status = row.status as AttendanceStatus;
    const excRows = excuseByAttendance.get(row.id) ?? [];
    let excuseStatus = "—";
    if (status === "absent") {
      excuseStatus = summarizeExcuseStatuses(excRows);
    }

    result.push({
      id: row.id,
      sessionDate: session?.session_date ?? "",
      className: session?.classes?.name ?? "—",
      subjectName: session?.subjects?.name ?? "—",
      studentName: st?.full_name ?? "—",
      status,
      recordedByName: rec?.full_name ?? null,
      recordedAt: row.recorded_at,
      excuseStatus,
    });
  }

  return result;
}

export async function updateAttendanceRecordStatus(
  recordId: string,
  status: AttendanceStatus,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("attendance_records").update({ status }).eq("id", recordId);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listAdminLessonLogs(filters: AdminLessonFilters): Promise<AdminLessonLogRow[]> {
  const supabase = await db();

  const query = supabase
    .from("lesson_logs")
    .select(
      `
      id,
      topic,
      content,
      homework,
      updated_at,
      session_id,
      profiles!lesson_logs_teacher_id_fkey(full_name),
      class_sessions(session_date, class_id, subject_id, teacher_id, classes(name), subjects(name))
    `,
    )
    .order("updated_at", { ascending: false })
    .limit(500);

  const { data: rows, error } = await query;

  if (error || !rows) return [];

  let filtered = rows;

  if (filters.date) {
    filtered = filtered.filter((r) => {
      const session = r.class_sessions as unknown as { session_date: string } | null;
      return session?.session_date === filters.date;
    });
  }

  if (filters.classId) {
    filtered = filtered.filter((r) => {
      const session = r.class_sessions as unknown as { class_id: string } | null;
      return session?.class_id === filters.classId;
    });
  }

  if (filters.subjectId) {
    filtered = filtered.filter((r) => {
      const session = r.class_sessions as unknown as { subject_id: string } | null;
      return session?.subject_id === filters.subjectId;
    });
  }

  if (filters.teacherId) {
    filtered = filtered.filter((r) => {
      const session = r.class_sessions as unknown as { teacher_id: string } | null;
      return session?.teacher_id === filters.teacherId;
    });
  }

  return filtered.map((row) => {
    const session = row.class_sessions as unknown as {
      session_date: string;
      classes: { name: string } | null;
      subjects: { name: string } | null;
    } | null;
    const teacher = row.profiles as unknown as { full_name: string } | null;

    return {
      id: row.id,
      sessionDate: session?.session_date ?? "",
      className: session?.classes?.name ?? "—",
      subjectName: session?.subjects?.name ?? "—",
      teacherName: teacher?.full_name ?? "—",
      topic: row.topic,
      updatedAt: row.updated_at,
      content: row.content,
      homework: row.homework,
      sessionId: row.session_id,
    };
  });
}

export async function updateLessonLogAdmin(
  id: string,
  input: { topic?: string | null; content?: string; homework?: string | null },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const patch: TablesUpdate<"lesson_logs"> = {};
  if (input.topic !== undefined) patch.topic = input.topic;
  if (input.content !== undefined) patch.content = input.content;
  if (input.homework !== undefined) patch.homework = input.homework;

  const { error } = await supabase.from("lesson_logs").update(patch).eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteLessonLogAdmin(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();
  const { error } = await supabase.from("lesson_logs").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listAdminExcuses(filters: AdminExcuseFilters): Promise<AdminExcuseRow[]> {
  const supabase = await db();

  let query = supabase
    .from("excuse_requests")
    .select(
      `
      id,
      reason_category,
      description,
      status,
      reviewed_at,
      students(full_name, class_id, classes(name)),
      profiles!excuse_requests_parent_id_fkey(full_name),
      reviewer:profiles!excuse_requests_reviewed_by_fkey(full_name),
      attendance_records(
        class_sessions(session_date)
      )
    `,
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.studentId) {
    query = query.eq("student_id", filters.studentId);
  }

  const { data: rows, error } = await query;

  if (error || !rows) return [];

  let filtered = rows;

  if (filters.classId) {
    filtered = filtered.filter((r) => {
      const st = r.students as unknown as { class_id: string | null } | null;
      return st?.class_id === filters.classId;
    });
  }

  return filtered.map((row) => {
    const st = row.students as unknown as {
      full_name: string;
      classes: { name: string } | null;
    } | null;
    const parent = row.profiles as unknown as { full_name: string } | null;
    const reviewer = row.reviewer as unknown as { full_name: string } | null;
    const att = row.attendance_records as unknown as {
      class_sessions: { session_date: string } | null;
    } | null;

    return {
      id: row.id,
      studentName: st?.full_name ?? "—",
      className: st?.classes?.name ?? null,
      absenceDate: att?.class_sessions?.session_date ?? "",
      reasonCategory: row.reason_category,
      description: row.description,
      parentName: parent?.full_name ?? "—",
      status: row.status as ExcuseStatus,
      reviewedByName: reviewer?.full_name ?? null,
      reviewedAt: row.reviewed_at,
    };
  });
}

export async function reviewExcuseAsAdmin(input: {
  excuseId: string;
  reviewerId: string;
  decision: "approved" | "rejected";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await db();

  const { data: excuse, error: loadError } = await supabase
    .from("excuse_requests")
    .select(
      `
      id,
      parent_id,
      student_id,
      status,
      reason_category,
      students(full_name),
      attendance_records(class_sessions(session_date))
    `,
    )
    .eq("id", input.excuseId)
    .maybeSingle();

  if (loadError || !excuse) {
    return { ok: false, error: loadError?.message ?? "Excuse not found" };
  }

  if (excuse.status !== "pending") {
    return { ok: false, error: "Only pending excuses can be reviewed" };
  }

  const now = new Date().toISOString();

  const { error: updError } = await supabase
    .from("excuse_requests")
    .update({
      status: input.decision,
      reviewed_by: input.reviewerId,
      reviewed_at: now,
    })
    .eq("id", input.excuseId);

  if (updError) return { ok: false, error: updError.message };

  const student = excuse.students as unknown as { full_name: string } | null;
  const studentName = student?.full_name ?? "Student";
  const att = excuse.attendance_records as unknown as {
    class_sessions: {
      session_date: string;
      subjects: { name: string } | null;
    } | null;
  } | null;
  const sessionDate = att?.class_sessions?.session_date ?? "";

  const category =
    excuse.reason_category.charAt(0).toUpperCase() + excuse.reason_category.slice(1);

  const message =
    input.decision === "approved"
      ? `Excuse accepted for ${studentName} — Absence on ${sessionDate} (${category}).`
      : `Excuse rejected for ${studentName} — Absence on ${sessionDate} (${category}).`;

  const notif: TablesInsert<"notifications"> = {
    recipient_id: excuse.parent_id,
    student_id: excuse.student_id,
    type: input.decision === "approved" ? "excuse_approved" : "excuse_rejected",
    title: input.decision === "approved" ? "Excuse approved" : "Excuse rejected",
    message,
    status: input.decision === "approved" ? "success" : "info",
  };

  const { error: nErr } = await supabase.from("notifications").insert(notif);

  if (nErr) return { ok: false, error: nErr.message };

  return { ok: true };
}

/** Dropdown / filter helpers */
export async function listTeachersForSelect(): Promise<Pick<DbRow<"profiles">, "id" | "full_name">[]> {
  const supabase = await db();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "teacher")
    .eq("is_active", true)
    .order("full_name");

  return data ?? [];
}

export async function listParentsForSelect(): Promise<Pick<DbRow<"profiles">, "id" | "full_name">[]> {
  const supabase = await db();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "parent")
    .eq("is_active", true)
    .order("full_name");

  return data ?? [];
}

export async function listStudentsForSelect(): Promise<Pick<DbRow<"students">, "id" | "full_name">[]> {
  const supabase = await db();
  const { data } = await supabase.from("students").select("id, full_name").eq("is_active", true).order("full_name");

  return data ?? [];
}

export async function listClassesForSelect(): Promise<Pick<DbRow<"classes">, "id" | "name">[]> {
  const supabase = await db();
  const { data } = await supabase.from("classes").select("id, name").eq("is_active", true).order("name");

  return data ?? [];
}

export async function listSubjectsForSelect(): Promise<Pick<DbRow<"subjects">, "id" | "name" | "full_name">[]> {
  const supabase = await db();
  const { data } = await supabase
    .from("subjects")
    .select("id, name, full_name")
    .eq("is_active", true)
    .order("name");

  return data ?? [];
}
