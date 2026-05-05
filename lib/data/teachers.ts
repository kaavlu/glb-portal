import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";
import { formatDisplayDate } from "@/lib/utils/dates";
import type { AttendanceStatus } from "@/types/domain";
import type { TeacherLessonSessionListItem, TeacherSessionSlotOption } from "@/types/teacher-sessions";
import type { SupabaseClient } from "@supabase/supabase-js";

export type { TeacherLessonSessionListItem, TeacherSessionSlotOption } from "@/types/teacher-sessions";

const FALLBACK_SESSION_START = "09:00:00";
const FALLBACK_SESSION_END = "09:45:00";

function formatTimeShort(isoTime: string): string {
  return isoTime.slice(0, 5);
}

function slotLabelFromTimes(start: string | null, end: string | null): string {
  if (start && end) return `${formatTimeShort(start)} – ${formatTimeShort(end)}`;
  if (start) return formatTimeShort(start);
  return "Session";
}

export async function listExistingSessionsForAssignmentDate(params: {
  teacherId: string;
  classId: string;
  subjectId: string;
  sessionDate: string;
}) {
  const supabase = await getDb();
  const { data } = await supabase
    .from("class_sessions")
    .select("id, schedule_id, start_time, end_time")
    .eq("teacher_id", params.teacherId)
    .eq("class_id", params.classId)
    .eq("subject_id", params.subjectId)
    .eq("session_date", params.sessionDate)
    .order("start_time");

  return data ?? [];
}

export function buildTeacherSessionSlotOptions(params: {
  schedulesForAssignment: TeacherScheduleSlot[];
  existingSessions: Array<{
    id: string;
    schedule_id: string | null;
    start_time: string | null;
    end_time: string | null;
  }>;
}): TeacherSessionSlotOption[] {
  const options: TeacherSessionSlotOption[] = [];
  const seen = new Set<string>();

  for (const s of params.schedulesForAssignment) {
    const key = `schedule:${s.schedule_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({
      key,
      label: `${slotLabelFromTimes(s.start_time, s.end_time)}${s.room ? ` · ${s.room}` : ""}`,
      schedule_id: s.schedule_id,
      start_time: s.start_time,
      end_time: s.end_time,
    });
  }

  for (const row of params.existingSessions) {
    const key = row.schedule_id ? `schedule:${row.schedule_id}` : `session:${row.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({
      key,
      label: slotLabelFromTimes(row.start_time, row.end_time),
      schedule_id: row.schedule_id,
      start_time: row.start_time,
      end_time: row.end_time,
    });
  }

  if (options.length === 0) {
    options.push({
      key: "fallback",
      label: slotLabelFromTimes(FALLBACK_SESSION_START, FALLBACK_SESSION_END),
      schedule_id: null,
      start_time: FALLBACK_SESSION_START,
      end_time: FALLBACK_SESSION_END,
    });
  }

  options.sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));
  return options;
}

export function pickDefaultTeacherSessionSlotKey(
  slots: TeacherSessionSlotOption[],
  existingSessions: Array<{ id: string; start_time: string | null }>,
): string {
  if (slots.length === 1) return slots[0].key;

  const localNow = new Date();
  const minutesNow = localNow.getHours() * 60 + localNow.getMinutes();

  function parseMinutes(t: string | null): number | null {
    if (!t) return null;
    const [h, m] = t.split(":").map((x) => Number(x));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  }

  const scored = slots.map((slot) => {
    const startM = parseMinutes(slot.start_time);
    const endM = parseMinutes(slot.end_time);
    let score = 1000;
    if (startM !== null && endM !== null && startM <= minutesNow && minutesNow <= endM) {
      score = 0;
    } else if (startM !== null) {
      score = Math.abs(startM - minutesNow);
    }
    return { slot, score };
  });

  scored.sort((a, b) => a.score - b.score);
  const best = scored[0]?.slot;
  if (best) return best.key;

  const firstExisting = existingSessions[0];
  if (firstExisting) {
    const match = slots.find(
      (s) => s.start_time === firstExisting.start_time || s.key.includes(firstExisting.id),
    );
    if (match) return match.key;
  }

  return slots[0]?.key ?? "fallback";
}

function filterSchedulesForAssignment(slots: TeacherScheduleSlot[], classId: string, subjectId: string) {
  return slots.filter((s) => s.class_id === classId && s.subject_id === subjectId);
}

/** All class-session slots the teacher may log for the given calendar day (from assignments + schedule, merged with existing sessions). */
export async function getTeacherLessonSessions(
  teacherId: string,
  date: string,
): Promise<TeacherLessonSessionListItem[]> {
  const assignments = await getTeacherAssignments(teacherId);
  if (assignments.length === 0) return [];

  const allSchedules = await getTeacherSchedulesForDate(teacherId, date);
  const out: TeacherLessonSessionListItem[] = [];

  for (const a of assignments) {
    const forAssign = filterSchedulesForAssignment(allSchedules, a.class_id, a.subject_id);
    const existingSessions = await listExistingSessionsForAssignmentDate({
      teacherId,
      classId: a.class_id,
      subjectId: a.subject_id,
      sessionDate: date,
    });
    const slots = buildTeacherSessionSlotOptions({
      schedulesForAssignment: forAssign,
      existingSessions,
    });
    for (const slot of slots) {
      out.push({
        assignmentId: a.id,
        classId: a.class_id,
        subjectId: a.subject_id,
        className: a.class_name,
        subjectName: a.subject_name,
        slotKey: slot.key,
        slotLabel: slot.label,
        scheduleId: slot.schedule_id,
        startTime: slot.start_time,
        endTime: slot.end_time,
      });
    }
  }

  out.sort((x, y) => {
    const t = (x.startTime ?? "").localeCompare(y.startTime ?? "");
    if (t !== 0) return t;
    return `${x.className} ${x.subjectName}`.localeCompare(`${y.className} ${y.subjectName}`);
  });
  return out;
}

export type LessonLogRow = {
  id: string;
  session_id: string;
  teacher_id: string;
  topic: string | null;
  content: string;
  homework: string | null;
  created_at: string;
  updated_at: string;
};

export async function getLessonLog(sessionId: string): Promise<LessonLogRow | null> {
  const supabase = await getDb();
  const { data, error } = await supabase.from("lesson_logs").select("*").eq("session_id", sessionId).maybeSingle();

  if (error) throw new Error(error.message);
  return data as LessonLogRow | null;
}

export type UpsertLessonLogInput = {
  sessionId: string;
  teacherId: string;
  topic: string | null;
  content: string;
  homework: string | null;
};

export async function upsertLessonLog(input: UpsertLessonLogInput): Promise<LessonLogRow> {
  const supabase = await getDb();
  const content = input.content.trim();
  if (!content) throw new Error("Lesson description is required.");

  const { data: session, error: sessErr } = await supabase
    .from("class_sessions")
    .select("id, teacher_id, class_id, subject_id")
    .eq("id", input.sessionId)
    .maybeSingle();

  if (sessErr || !session) throw new Error("Session not found.");
  if (session.teacher_id !== input.teacherId) throw new Error("Not allowed.");

  const { data: assignOk } = await supabase
    .from("teacher_assignments")
    .select("id")
    .eq("teacher_id", input.teacherId)
    .eq("class_id", session.class_id)
    .eq("subject_id", session.subject_id)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignOk) throw new Error("Not allowed.");

  const topic = input.topic?.trim() ? input.topic.trim() : null;
  const homework = input.homework?.trim() ? input.homework.trim() : null;

  const { data: existing, error: exErr } = await supabase
    .from("lesson_logs")
    .select("id")
    .eq("session_id", input.sessionId)
    .maybeSingle();

  if (exErr) throw new Error(exErr.message);

  if (existing) {
    const { data: updated, error: updErr } = await supabase
      .from("lesson_logs")
      .update({
        topic,
        content,
        homework,
      })
      .eq("id", existing.id)
      .eq("session_id", input.sessionId)
      .select("*")
      .single();

    if (updErr) throw new Error(updErr.message);
    return updated as LessonLogRow;
  }

  const { data: inserted, error: insErr } = await supabase
    .from("lesson_logs")
    .insert({
      session_id: input.sessionId,
      teacher_id: input.teacherId,
      topic,
      content,
      homework,
    })
    .select("*")
    .single();

  if (insErr) throw new Error(insErr.message);
  return inserted as LessonLogRow;
}

async function getDb(): Promise<SupabaseClient<Database>> {
  return (await createClient()) as unknown as SupabaseClient<Database>;
}

async function getNotifierDb(): Promise<SupabaseClient<Database>> {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return createAdminClient() as unknown as SupabaseClient<Database>;
  }
  return getDb();
}

export type TeacherAssignmentRow = {
  id: string;
  class_id: string;
  subject_id: string;
  class_name: string;
  subject_name: string;
};

export type TeacherScheduleSlot = {
  schedule_id: string;
  class_id: string;
  subject_id: string;
  class_name: string;
  subject_name: string;
  start_time: string;
  end_time: string;
  room: string | null;
};

export type GetOrCreateClassSessionInput = {
  teacherId: string;
  classId: string;
  subjectId: string;
  sessionDate: string;
  scheduleId?: string | null;
  startTime: string | null;
  endTime: string | null;
};

export type TeacherAttendanceRosterRow = {
  recordId: string;
  studentId: string;
  studentName: string;
  initials: string | null;
  status: AttendanceStatus;
};

export type TeacherExcuseFilters = {
  status?: "pending" | "approved" | "rejected" | "all";
  classId?: string;
  studentId?: string;
  date?: string;
};

export type TeacherExcuseRow = {
  id: string;
  studentId: string;
  studentName: string;
  classId: string | null;
  className: string | null;
  absenceDate: string;
  reasonCategory: string;
  description: string | null;
  parentName: string;
  status: "pending" | "approved" | "rejected";
};

function dayOfWeekFromDateString(dateIso: string): number {
  const d = new Date(`${dateIso}T12:00:00`);
  return d.getDay();
}

export async function getTeacherAssignments(teacherId: string): Promise<TeacherAssignmentRow[]> {
  const supabase = await getDb();
  const { data, error } = await supabase
    .from("teacher_assignments")
    .select(
      `
      id,
      class_id,
      subject_id,
      classes ( name, is_active ),
      subjects ( name, is_active )
    `,
    )
    .eq("teacher_id", teacherId)
    .eq("is_active", true)
    .order("id");

  if (error || !data) return [];

  const rows: TeacherAssignmentRow[] = [];
  for (const row of data as unknown as Array<{
    id: string;
    class_id: string;
    subject_id: string;
    classes: { name: string; is_active: boolean } | null;
    subjects: { name: string; is_active: boolean } | null;
  }>) {
    const classRow = row.classes;
    const subjectRow = row.subjects;
    if (!classRow?.is_active || !subjectRow?.is_active) continue;
    rows.push({
      id: row.id,
      class_id: row.class_id,
      subject_id: row.subject_id,
      class_name: classRow.name,
      subject_name: subjectRow.name,
    });
  }
  return rows;
}

export async function assertTeacherAssignment(
  teacherId: string,
  assignmentId: string,
): Promise<{ id: string; class_id: string; subject_id: string } | null> {
  const supabase = await getDb();
  const { data, error } = await supabase
    .from("teacher_assignments")
    .select("id, class_id, subject_id")
    .eq("id", assignmentId)
    .eq("teacher_id", teacherId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as { id: string; class_id: string; subject_id: string };
}

export async function getTeacherSchedulesForDate(
  teacherId: string,
  date: string,
): Promise<TeacherScheduleSlot[]> {
  const supabase = await getDb();
  const dow = dayOfWeekFromDateString(date);

  const { data, error } = await supabase
    .from("class_schedules")
    .select(
      `
      id,
      class_id,
      subject_id,
      start_time,
      end_time,
      room,
      classes ( name ),
      subjects ( name )
    `,
    )
    .eq("teacher_id", teacherId)
    .eq("day_of_week", dow)
    .eq("is_active", true)
    .order("start_time");

  if (error || !data) return [];

  const out: TeacherScheduleSlot[] = [];
  for (const row of data as unknown as Array<{
    id: string;
    class_id: string;
    subject_id: string;
    start_time: string;
    end_time: string;
    room: string | null;
    classes: { name: string } | null;
    subjects: { name: string } | null;
  }>) {
    out.push({
      schedule_id: row.id,
      class_id: row.class_id,
      subject_id: row.subject_id,
      class_name: row.classes?.name ?? "",
      subject_name: row.subjects?.name ?? "",
      start_time: row.start_time,
      end_time: row.end_time,
      room: row.room,
    });
  }
  return out;
}

async function findExistingSession(supabase: SupabaseClient<Database>, input: GetOrCreateClassSessionInput) {
  let q = supabase
    .from("class_sessions")
    .select("*")
    .eq("class_id", input.classId)
    .eq("subject_id", input.subjectId)
    .eq("teacher_id", input.teacherId)
    .eq("session_date", input.sessionDate);

  if (input.startTime === null || input.startTime === undefined) {
    q = q.is("start_time", null);
  } else {
    q = q.eq("start_time", input.startTime);
  }

  const { data, error } = await q.maybeSingle();
  if (error) return null;
  return data;
}

export async function getOrCreateClassSession(input: GetOrCreateClassSessionInput) {
  const supabase = await getDb();
  const existing = await findExistingSession(supabase, input);
  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("class_sessions")
    .insert({
      class_id: input.classId,
      subject_id: input.subjectId,
      teacher_id: input.teacherId,
      schedule_id: input.scheduleId ?? null,
      session_date: input.sessionDate,
      start_time: input.startTime,
      end_time: input.endTime,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function getStudentsForClass(classId: string) {
  const supabase = await getDb();
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, initials")
    .eq("class_id", classId)
    .eq("is_active", true)
    .order("full_name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function initializeAttendanceForSession(
  sessionId: string,
  classId: string,
  recordedBy: string,
): Promise<void> {
  const supabase = await getDb();
  const students = await getStudentsForClass(classId);
  if (students.length === 0) return;

  const { data: existing } = await supabase
    .from("attendance_records")
    .select("student_id")
    .eq("session_id", sessionId);

  const have = new Set((existing ?? []).map((r) => r.student_id));
  const missing = students.filter((s) => !have.has(s.id));
  if (missing.length === 0) return;

  const rows = missing.map((s) => ({
    session_id: sessionId,
    student_id: s.id,
    status: "present" as const,
    recorded_by: recordedBy,
  }));

  const { error } = await supabase.from("attendance_records").insert(rows);
  if (error) throw new Error(error.message);
}

export async function getAttendanceForSession(sessionId: string): Promise<TeacherAttendanceRosterRow[]> {
  const supabase = await getDb();
  const { data: records, error } = await supabase
    .from("attendance_records")
    .select(
      `
      id,
      student_id,
      status,
      students ( full_name, initials )
    `,
    )
    .eq("session_id", sessionId);

  if (error) throw new Error(error.message);

  const rows: TeacherAttendanceRosterRow[] = (records ?? []).map((r) => {
    const st = (r as unknown as { students: { full_name: string; initials: string | null } | null }).students;
    return {
      recordId: r.id,
      studentId: r.student_id,
      studentName: st?.full_name ?? "Student",
      initials: st?.initials ?? null,
      status: r.status as AttendanceStatus,
    };
  });

  rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
  return rows;
}

async function notifyParentsOfAbsence(params: {
  supabase: SupabaseClient<Database>;
  studentId: string;
  studentName: string;
  subjectName: string;
  sessionDate: string;
}) {
  const { supabase } = params;
  const { data: links } = await supabase
    .from("parent_students")
    .select("parent_id")
    .eq("student_id", params.studentId);

  const parentIds = [...new Set((links ?? []).map((l) => l.parent_id))];
  if (parentIds.length === 0) return;

  const displayDate = formatDisplayDate(params.sessionDate, "MMMM d, yyyy");
  const message = `${params.studentName} was marked absent from ${params.subjectName} on ${displayDate}.`;

  for (const recipientId of parentIds) {
    const { data: dup } = await supabase
      .from("notifications")
      .select("id")
      .eq("recipient_id", recipientId)
      .eq("student_id", params.studentId)
      .eq("type", "absence_recorded")
      .eq("message", message)
      .maybeSingle();

    if (dup) continue;

    await supabase.from("notifications").insert({
      recipient_id: recipientId,
      student_id: params.studentId,
      type: "absence_recorded",
      title: null,
      message,
      status: "info",
    });
  }
}

export async function updateAttendanceStatus(
  recordId: string,
  status: AttendanceStatus,
  teacherId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await getDb();

  const { data: rec, error: fetchErr } = await supabase
    .from("attendance_records")
    .select("id, student_id, session_id")
    .eq("id", recordId)
    .maybeSingle();

  if (fetchErr || !rec) return { ok: false, error: "Record not found." };

  const { data: session, error: sessErr } = await supabase
    .from("class_sessions")
    .select("id, teacher_id, session_date, subject_id")
    .eq("id", rec.session_id)
    .maybeSingle();

  if (sessErr || !session) return { ok: false, error: "Session not found." };

  if (session.teacher_id !== teacherId) {
    return { ok: false, error: "Not allowed." };
  }

  const { data: subjectRow } = await supabase
    .from("subjects")
    .select("name")
    .eq("id", session.subject_id)
    .maybeSingle();

  const subjectName = subjectRow?.name ?? "Class";

  const { data: student, error: stErr } = await supabase
    .from("students")
    .select("full_name")
    .eq("id", rec.student_id)
    .maybeSingle();

  if (stErr || !student) return { ok: false, error: "Student not found." };

  const { error: updErr } = await supabase
    .from("attendance_records")
    .update({ status, recorded_by: teacherId })
    .eq("id", recordId);

  if (updErr) return { ok: false, error: updErr.message };

  if (status === "absent") {
    await notifyParentsOfAbsence({
      supabase,
      studentId: rec.student_id,
      studentName: student.full_name,
      subjectName,
      sessionDate: session.session_date,
    });
  }

  return { ok: true };
}

export async function getExcusesForTeacher(
  teacherId: string,
  filters: TeacherExcuseFilters = {},
): Promise<TeacherExcuseRow[]> {
  const supabase = await getDb();
  const { data: assignments } = await supabase
    .from("teacher_assignments")
    .select("class_id")
    .eq("teacher_id", teacherId)
    .eq("is_active", true);

  const classIds = [...new Set((assignments ?? []).map((row) => row.class_id))];
  if (classIds.length === 0) return [];

  let query = supabase
    .from("excuse_requests")
    .select(
      `
      id,
      student_id,
      reason_category,
      description,
      status,
      students(full_name, class_id, classes(name)),
      profiles!excuse_requests_parent_id_fkey(full_name),
      attendance_records(class_sessions(session_date))
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

  const out: TeacherExcuseRow[] = [];
  for (const row of rows) {
    const student = row.students as unknown as {
      full_name: string;
      class_id: string | null;
      classes: { name: string } | null;
    } | null;
    const classId = student?.class_id ?? null;
    if (!classId || !classIds.includes(classId)) continue;
    if (filters.classId && filters.classId !== classId) continue;

    const attendance = row.attendance_records as unknown as {
      class_sessions: { session_date: string } | null;
    } | null;
    const absenceDate = attendance?.class_sessions?.session_date ?? "";
    if (filters.date && filters.date !== absenceDate) continue;

    const parent = row.profiles as unknown as { full_name: string } | null;
    out.push({
      id: row.id,
      studentId: row.student_id,
      studentName: student?.full_name ?? "—",
      classId,
      className: student?.classes?.name ?? null,
      absenceDate,
      reasonCategory: row.reason_category,
      description: row.description,
      parentName: parent?.full_name ?? "—",
      status: row.status,
    });
  }

  return out;
}

export async function reviewExcuse(
  excuseId: string,
  reviewerId: string,
  status: "approved" | "rejected",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await getDb();
  const { data: excuse, error: loadError } = await supabase
    .from("excuse_requests")
    .select(
      `
      id,
      status,
      parent_id,
      student_id,
      reason_category,
      attendance_record_id,
      students(full_name),
      attendance_records(class_sessions(session_date, class_id))
    `,
    )
    .eq("id", excuseId)
    .maybeSingle();

  if (loadError || !excuse) return { ok: false, error: loadError?.message ?? "Excuse not found." };
  if (excuse.status !== "pending") return { ok: false, error: "Only pending excuses can be reviewed." };

  const attendance = excuse.attendance_records as unknown as {
    class_sessions: { class_id: string; session_date: string } | null;
  } | null;
  const classId = attendance?.class_sessions?.class_id;
  if (!classId) return { ok: false, error: "Excuse is missing class information." };

  const { data: assignment } = await supabase
    .from("teacher_assignments")
    .select("id")
    .eq("teacher_id", reviewerId)
    .eq("class_id", classId)
    .eq("is_active", true)
    .maybeSingle();

  if (!assignment) return { ok: false, error: "Not allowed to review this excuse." };

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("excuse_requests")
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: now,
    })
    .eq("id", excuseId);

  if (updateError) return { ok: false, error: updateError.message };

  const student = excuse.students as unknown as { full_name: string } | null;
  const studentName = student?.full_name ?? "Student";
  const sessionDate = attendance.class_sessions?.session_date ?? "";
  const category = excuse.reason_category.charAt(0).toUpperCase() + excuse.reason_category.slice(1);
  const formattedDate = sessionDate ? formatDisplayDate(sessionDate, "MMMM d, yyyy") : "the selected date";

  const message =
    status === "approved"
      ? `Excuse accepted for ${studentName} — Absence on ${formattedDate} (${category}).`
      : `Excuse rejected for ${studentName} — Absence on ${formattedDate} (${category}).`;

  const notifierDb = await getNotifierDb();
  const { error: notificationError } = await notifierDb.from("notifications").insert({
    recipient_id: excuse.parent_id,
    student_id: excuse.student_id,
    type: status === "approved" ? "excuse_approved" : "excuse_rejected",
    title: status === "approved" ? "Excuse approved" : "Excuse rejected",
    message,
    status: status === "approved" ? "success" : "info",
  });

  if (notificationError) return { ok: false, error: notificationError.message };

  return { ok: true };
}
