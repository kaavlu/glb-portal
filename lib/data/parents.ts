import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { AttendanceStatus, ExcuseStatus } from "@/types/domain";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDisplayDate } from "@/lib/utils/dates";

export type LinkedStudent = {
  id: string;
  fullName: string;
  initials: string | null;
  className: string | null;
};

export type ParentNotification = {
  id: string;
  type: Database["public"]["Tables"]["notifications"]["Row"]["type"];
  status: Database["public"]["Tables"]["notifications"]["Row"]["status"];
  message: string;
  createdAt: string;
  readAt: string | null;
};

export type ParentAttendanceDisplayStatus = "Present" | "Late" | "Pending" | "Excused" | "Unexcused";

export type ParentAttendanceRecord = {
  id: string;
  sessionDate: string;
  subjectName: string;
  attendanceStatus: AttendanceStatus;
  excuseStatus: ExcuseStatus | null;
  displayStatus: ParentAttendanceDisplayStatus;
};

export type ParentAbsenceSummary = {
  totalAbsences: number;
  unexcusedAbsences: number;
};

export type ExcusableAbsence = {
  attendanceRecordId: string;
  sessionDate: string;
  subjectName: string;
};

export type SubmitExcuseInput = {
  parentId: string;
  studentId: string;
  attendanceRecordId: string;
  reasonCategory: "medical" | "family" | "travel" | "other";
  description?: string | null;
};

function toParentDisplayStatus(
  attendanceStatus: AttendanceStatus,
  excuseStatus: ExcuseStatus | null,
): ParentAttendanceDisplayStatus {
  if (attendanceStatus === "present") return "Present";
  if (attendanceStatus === "late") return "Late";

  if (!excuseStatus) return "Unexcused";
  if (excuseStatus === "pending") return "Pending";
  if (excuseStatus === "approved") return "Excused";
  return "Unexcused";
}

async function assertParentLinkedStudent(
  supabase: SupabaseClient<Database>,
  parentId: string,
  studentId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("parent_students")
    .select("student_id")
    .eq("parent_id", parentId)
    .eq("student_id", studentId)
    .maybeSingle();

  return !error && !!data;
}

export async function getLinkedStudents(parentId: string): Promise<LinkedStudent[]> {
  const supabase = await getDb();
  const { data, error } = await supabase
    .from("parent_students")
    .select(
      `
      student_id,
      students (
        id,
        full_name,
        initials,
        is_active,
        classes ( name )
      )
    `,
    )
    .eq("parent_id", parentId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const out: LinkedStudent[] = [];
  for (const row of data as unknown as Array<{
    students: {
      id: string;
      full_name: string;
      initials: string | null;
      is_active: boolean;
      classes: { name: string } | null;
    } | null;
  }>) {
    const student = row.students;
    if (!student?.is_active) continue;
    out.push({
      id: student.id,
      fullName: student.full_name,
      initials: student.initials,
      className: student.classes?.name ?? null,
    });
  }

  out.sort((a, b) => a.fullName.localeCompare(b.fullName));
  return out;
}

export async function getParentNotifications(parentId: string): Promise<ParentNotification[]> {
  const supabase = await getDb();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, status, message, created_at, read_at")
    .eq("recipient_id", parentId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    type: row.type,
    status: row.status,
    message: row.message,
    createdAt: row.created_at,
    readAt: row.read_at,
  }));
}

export async function getStudentAttendanceForParent(
  parentId: string,
  studentId: string,
): Promise<ParentAttendanceRecord[]> {
  const supabase = await getDb();
  const isLinked = await assertParentLinkedStudent(supabase, parentId, studentId);
  if (!isLinked) return [];

  const { data: attendanceRows, error: attendanceError } = await supabase
    .from("attendance_records")
    .select("id, status, session_id")
    .eq("student_id", studentId);

  if (attendanceError || !attendanceRows || attendanceRows.length === 0) return [];

  const sessionIds = [...new Set(attendanceRows.map((row) => row.session_id))];
  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("id, session_date, subject_id")
    .in("id", sessionIds);

  const sessionsById = new Map(
    (sessions ?? []).map((session) => [
      session.id,
      { date: session.session_date, subjectId: session.subject_id },
    ]),
  );

  const subjectIds = [...new Set((sessions ?? []).map((session) => session.subject_id))];
  const { data: subjects } =
    subjectIds.length > 0
      ? await supabase.from("subjects").select("id, name").in("id", subjectIds)
      : { data: [] };

  const subjectNameById = new Map((subjects ?? []).map((subject) => [subject.id, subject.name]));

  const attendanceIds = attendanceRows.map((row) => row.id);
  const { data: excuses } = await supabase
    .from("excuse_requests")
    .select("attendance_record_id, status, created_at")
    .eq("parent_id", parentId)
    .eq("student_id", studentId)
    .in("attendance_record_id", attendanceIds);

  const latestExcuseByAttendanceId = new Map<string, ExcuseStatus>();
  const sortedExcuses = [...(excuses ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  for (const excuse of sortedExcuses) {
    if (latestExcuseByAttendanceId.has(excuse.attendance_record_id)) continue;
    latestExcuseByAttendanceId.set(excuse.attendance_record_id, excuse.status);
  }

  const records: ParentAttendanceRecord[] = attendanceRows.map((row) => {
    const session = sessionsById.get(row.session_id);
    const excuseStatus = latestExcuseByAttendanceId.get(row.id) ?? null;
    return {
      id: row.id,
      sessionDate: session?.date ?? "",
      subjectName: (session?.subjectId && subjectNameById.get(session.subjectId)) || "Subject",
      attendanceStatus: row.status as AttendanceStatus,
      excuseStatus,
      displayStatus: toParentDisplayStatus(row.status as AttendanceStatus, excuseStatus),
    };
  });

  records.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
  return records;
}

export async function getAbsenceSummaryForParent(
  parentId: string,
  studentId: string,
): Promise<ParentAbsenceSummary> {
  const records = await getStudentAttendanceForParent(parentId, studentId);
  let totalAbsences = 0;
  let unexcusedAbsences = 0;

  for (const record of records) {
    if (record.attendanceStatus !== "absent") continue;
    totalAbsences += 1;
    if (record.displayStatus === "Unexcused") {
      unexcusedAbsences += 1;
    }
  }

  return { totalAbsences, unexcusedAbsences };
}

export async function getExcusableAbsences(parentId: string, studentId: string): Promise<ExcusableAbsence[]> {
  const supabase = await getDb();
  const isLinked = await assertParentLinkedStudent(supabase, parentId, studentId);
  if (!isLinked) return [];

  const { data: attendanceRows, error: attendanceError } = await supabase
    .from("attendance_records")
    .select("id, session_id")
    .eq("student_id", studentId)
    .eq("status", "absent");

  if (attendanceError || !attendanceRows || attendanceRows.length === 0) return [];

  const attendanceIds = attendanceRows.map((row) => row.id);
  const { data: excuseRows } = await supabase
    .from("excuse_requests")
    .select("attendance_record_id, status, created_at")
    .in("attendance_record_id", attendanceIds);

  const latestExcuseByAttendance = new Map<string, ExcuseStatus>();
  const sortedExcuses = [...(excuseRows ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
  for (const excuse of sortedExcuses) {
    if (latestExcuseByAttendance.has(excuse.attendance_record_id)) continue;
    latestExcuseByAttendance.set(excuse.attendance_record_id, excuse.status as ExcuseStatus);
  }

  const availableRows = attendanceRows.filter((row) => {
    const latest = latestExcuseByAttendance.get(row.id);
    return latest !== "pending" && latest !== "approved";
  });

  if (availableRows.length === 0) return [];

  const sessionIds = [...new Set(availableRows.map((row) => row.session_id))];
  const { data: sessions } = await supabase
    .from("class_sessions")
    .select("id, session_date, subject_id")
    .in("id", sessionIds);

  const sessionsById = new Map((sessions ?? []).map((session) => [session.id, session]));

  const subjectIds = [...new Set((sessions ?? []).map((session) => session.subject_id))];
  const { data: subjects } =
    subjectIds.length > 0
      ? await supabase.from("subjects").select("id, name").in("id", subjectIds)
      : { data: [] };
  const subjectNames = new Map((subjects ?? []).map((subject) => [subject.id, subject.name]));

  const output: ExcusableAbsence[] = [];
  for (const row of availableRows) {
    const session = sessionsById.get(row.session_id);
    if (!session) continue;
    output.push({
      attendanceRecordId: row.id,
      sessionDate: session.session_date,
      subjectName: subjectNames.get(session.subject_id) ?? "Subject",
    });
  }

  output.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
  return output;
}

export async function submitExcuse(input: SubmitExcuseInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await getDb();
  const isLinked = await assertParentLinkedStudent(supabase, input.parentId, input.studentId);
  if (!isLinked) return { ok: false, error: "Student is not linked to this parent." };

  const { data: attendance, error: attendanceError } = await supabase
    .from("attendance_records")
    .select("id, student_id, status, session_id")
    .eq("id", input.attendanceRecordId)
    .maybeSingle();

  if (attendanceError || !attendance) return { ok: false, error: "Absence record not found." };
  if (attendance.student_id !== input.studentId) return { ok: false, error: "Absence record does not belong to selected student." };
  if (attendance.status !== "absent") return { ok: false, error: "Only absent records can be excused." };

  const { data: existingForParent, error: existingForParentError } = await supabase
    .from("excuse_requests")
    .select("id")
    .eq("attendance_record_id", input.attendanceRecordId)
    .eq("parent_id", input.parentId)
    .maybeSingle();

  if (existingForParentError) return { ok: false, error: existingForParentError.message };
  if (existingForParent) return { ok: false, error: "Duplicate excuse submission is not allowed." };

  const { data: allForAttendance } = await supabase
    .from("excuse_requests")
    .select("status, created_at")
    .eq("attendance_record_id", input.attendanceRecordId)
    .order("created_at", { ascending: false });
  const latestStatus = allForAttendance?.[0]?.status as ExcuseStatus | undefined;
  if (latestStatus === "pending" || latestStatus === "approved") {
    return { ok: false, error: "This absence already has a pending or approved excuse." };
  }

  const description = input.description?.trim() ? input.description.trim() : null;
  const { error: insertExcuseError } = await supabase.from("excuse_requests").insert({
    attendance_record_id: input.attendanceRecordId,
    student_id: input.studentId,
    parent_id: input.parentId,
    reason_category: input.reasonCategory,
    description,
    status: "pending",
  });

  if (insertExcuseError) {
    if (insertExcuseError.code === "23505") {
      return { ok: false, error: "Duplicate excuse submission is not allowed." };
    }
    return { ok: false, error: insertExcuseError.message };
  }

  const [{ data: student }, { data: session }, { data: subject }] = await Promise.all([
    supabase.from("students").select("full_name").eq("id", input.studentId).maybeSingle(),
    supabase
      .from("class_sessions")
      .select("session_date, class_id")
      .eq("id", attendance.session_id)
      .maybeSingle(),
    supabase
      .from("class_sessions")
      .select("subjects(name)")
      .eq("id", attendance.session_id)
      .maybeSingle(),
  ]);

  const studentName = student?.full_name ?? "Student";
  const absenceDate = session?.session_date ? formatDisplayDate(session.session_date, "MMMM d, yyyy") : "the selected date";
  const category = input.reasonCategory.charAt(0).toUpperCase() + input.reasonCategory.slice(1);

  await supabase.from("notifications").insert({
    recipient_id: input.parentId,
    student_id: input.studentId,
    type: "excuse_submitted",
    title: "Excuse submitted",
    message: `Excuse submitted for ${studentName} — Absence on ${absenceDate} (${category}). Awaiting review.`,
    status: "pending",
  });

  const classId = session?.class_id ?? null;
  if (classId) {
    const [{ data: teacherAssignments }, { data: admins }] = await Promise.all([
      supabase
        .from("teacher_assignments")
        .select("teacher_id")
        .eq("class_id", classId)
        .eq("is_active", true),
      supabase.from("profiles").select("id").eq("role", "admin").eq("is_active", true),
    ]);

    const recipientIds = new Set<string>();
    for (const row of teacherAssignments ?? []) recipientIds.add(row.teacher_id);
    for (const row of admins ?? []) recipientIds.add(row.id);

    const subjectName = (subject as unknown as { subjects: { name: string } | null } | null)?.subjects?.name ?? "class";
    const message = `New excuse submitted for ${studentName} (${subjectName}, ${absenceDate}).`;
    if (recipientIds.size > 0) {
      await supabase.from("notifications").insert(
        [...recipientIds].map((recipientId) => ({
          recipient_id: recipientId,
          student_id: input.studentId,
          type: "system" as const,
          title: "New excuse request",
          message,
          status: "info" as const,
        })),
      );
    }
  }

  return { ok: true };
}

async function getDb(): Promise<SupabaseClient<Database>> {
  return (await createClient()) as unknown as SupabaseClient<Database>;
}
