"use server";

import * as admin from "@/lib/data/admin";
import { requireRole } from "@/lib/auth/require-role";
import type { AttendanceStatus } from "@/types/domain";
import { revalidatePath } from "next/cache";

function rev(paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

export async function createTeacherAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const res = await admin.createTeacher({
    email: String(formData.get("email") ?? ""),
    password,
    full_name: String(formData.get("full_name") ?? ""),
    initials: String(formData.get("initials") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
  });
  if (res.ok) rev(["/admin/teachers", "/admin/dashboard"]);
  return res;
}

export async function updateTeacherAction(id: string, formData: FormData) {
  const res = await admin.updateTeacher(id, {
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    initials: String(formData.get("initials") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
  });
  if (res.ok) rev(["/admin/teachers"]);
  return res;
}

export async function deactivateTeacherAction(id: string) {
  const res = await admin.deactivateTeacher(id);
  if (res.ok) rev(["/admin/teachers", "/admin/dashboard"]);
  return res;
}

export async function reactivateTeacherAction(id: string) {
  const res = await admin.reactivateTeacher(id);
  if (res.ok) rev(["/admin/teachers", "/admin/dashboard"]);
  return res;
}

export async function createParentAction(formData: FormData) {
  const res = await admin.createParent({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    full_name: String(formData.get("full_name") ?? ""),
    initials: String(formData.get("initials") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
  });
  if (res.ok) rev(["/admin/parents", "/admin/dashboard"]);
  return res;
}

export async function updateParentAction(id: string, formData: FormData) {
  const res = await admin.updateParent(id, {
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    initials: String(formData.get("initials") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
  });
  if (res.ok) rev(["/admin/parents"]);
  return res;
}

export async function deactivateParentAction(id: string) {
  const res = await admin.deactivateParent(id);
  if (res.ok) rev(["/admin/parents", "/admin/dashboard"]);
  return res;
}

export async function reactivateParentAction(id: string) {
  const res = await admin.reactivateParent(id);
  if (res.ok) rev(["/admin/parents", "/admin/dashboard"]);
  return res;
}

export async function linkParentStudentAction(formData: FormData) {
  const res = await admin.linkParentToStudent(
    String(formData.get("parent_id") ?? ""),
    String(formData.get("student_id") ?? ""),
  );
  if (res.ok) rev(["/admin/parents", "/admin/students"]);
  return res;
}

export async function unlinkParentStudentAction(formData: FormData) {
  const res = await admin.unlinkParentFromStudent(
    String(formData.get("parent_id") ?? ""),
    String(formData.get("student_id") ?? ""),
  );
  if (res.ok) rev(["/admin/parents", "/admin/students"]);
  return res;
}

export async function createStudentAction(formData: FormData) {
  const classId = String(formData.get("class_id") ?? "");
  const lg = String(formData.get("language_group") ?? "").trim();
  const res = await admin.createStudent({
    full_name: String(formData.get("full_name") ?? ""),
    initials: String(formData.get("initials") ?? "") || null,
    class_id: classId ? classId : null,
    language_group: lg || null,
  });
  if (res.ok) rev(["/admin/students", "/admin/dashboard", "/admin/timetable"]);
  return res;
}

export async function updateStudentAction(id: string, formData: FormData) {
  const classId = String(formData.get("class_id") ?? "");
  const lg = String(formData.get("language_group") ?? "").trim();
  const res = await admin.updateStudent(id, {
    full_name: String(formData.get("full_name") ?? ""),
    initials: String(formData.get("initials") ?? "") || null,
    class_id: classId ? classId : null,
    language_group: lg || null,
  });
  if (res.ok) rev(["/admin/students", "/admin/dashboard", "/admin/timetable"]);
  return res;
}

export async function deactivateStudentAction(id: string) {
  const res = await admin.deactivateStudent(id);
  if (res.ok) rev(["/admin/students", "/admin/dashboard"]);
  return res;
}

export async function reactivateStudentAction(id: string) {
  const res = await admin.reactivateStudent(id);
  if (res.ok) rev(["/admin/students", "/admin/dashboard"]);
  return res;
}

export async function createClassAction(formData: FormData) {
  const res = await admin.createClass({
    name: String(formData.get("name") ?? ""),
    school_year: String(formData.get("school_year") ?? "") || null,
  });
  if (res.ok) rev(["/admin/classes", "/admin/dashboard"]);
  return res;
}

export async function updateClassAction(id: string, formData: FormData) {
  const res = await admin.updateClass(id, {
    name: String(formData.get("name") ?? ""),
    school_year: String(formData.get("school_year") ?? "") || null,
  });
  if (res.ok) rev(["/admin/classes"]);
  return res;
}

export async function deactivateClassAction(id: string) {
  const res = await admin.deactivateClass(id);
  if (res.ok) rev(["/admin/classes", "/admin/dashboard"]);
  return res;
}

export async function reactivateClassAction(id: string) {
  const res = await admin.reactivateClass(id);
  if (res.ok) rev(["/admin/classes", "/admin/dashboard"]);
  return res;
}

export async function createSubjectAction(formData: FormData) {
  const res = await admin.createSubject({
    name: String(formData.get("name") ?? ""),
    full_name: String(formData.get("full_name") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
  });
  if (res.ok)
    rev([
      "/admin/subjects",
      "/admin/dashboard",
      "/admin/schedules",
      "/admin/timetable",
      "/admin/assignments",
      "/admin/lessons",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function updateSubjectAction(id: string, formData: FormData) {
  const res = await admin.updateSubject(id, {
    name: String(formData.get("name") ?? ""),
    full_name: String(formData.get("full_name") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
  });
  if (res.ok)
    rev([
      "/admin/subjects",
      "/admin/schedules",
      "/admin/timetable",
      "/admin/assignments",
      "/admin/lessons",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function deactivateSubjectAction(id: string) {
  const res = await admin.deactivateSubject(id);
  if (res.ok)
    rev([
      "/admin/subjects",
      "/admin/dashboard",
      "/admin/schedules",
      "/admin/timetable",
      "/admin/assignments",
      "/admin/lessons",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function reactivateSubjectAction(id: string) {
  const res = await admin.reactivateSubject(id);
  if (res.ok)
    rev([
      "/admin/subjects",
      "/admin/dashboard",
      "/admin/schedules",
      "/admin/timetable",
      "/admin/assignments",
      "/admin/lessons",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function createTeacherAssignmentAction(formData: FormData) {
  const res = await admin.createTeacherAssignment({
    teacher_id: String(formData.get("teacher_id") ?? ""),
    class_id: String(formData.get("class_id") ?? ""),
    subject_id: String(formData.get("subject_id") ?? ""),
  });
  if (res.ok)
    rev([
      "/admin/assignments",
      "/admin/schedules",
      "/admin/timetable",
      "/admin/dashboard",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function updateTeacherAssignmentAction(id: string, formData: FormData) {
  const res = await admin.updateTeacherAssignment(id, {
    teacher_id: String(formData.get("teacher_id") ?? ""),
    class_id: String(formData.get("class_id") ?? ""),
    subject_id: String(formData.get("subject_id") ?? ""),
  });
  if (res.ok)
    rev([
      "/admin/assignments",
      "/admin/schedules",
      "/admin/timetable",
      "/admin/dashboard",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function deactivateTeacherAssignmentAction(id: string) {
  const res = await admin.deactivateTeacherAssignment(id);
  if (res.ok)
    rev([
      "/admin/assignments",
      "/admin/schedules",
      "/admin/timetable",
      "/admin/dashboard",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function reactivateTeacherAssignmentAction(id: string) {
  const res = await admin.reactivateTeacherAssignment(id);
  if (res.ok)
    rev([
      "/admin/assignments",
      "/admin/schedules",
      "/admin/timetable",
      "/admin/dashboard",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

function parsePeriodNumber(formData: FormData): number | null {
  const raw = String(formData.get("period_number") ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1 || n > 9) return null;
  return n;
}

export async function createClassScheduleAction(formData: FormData) {
  const res = await admin.createClassSchedule({
    class_id: String(formData.get("class_id") ?? ""),
    subject_id: String(formData.get("subject_id") ?? ""),
    teacher_id: String(formData.get("teacher_id") ?? ""),
    day_of_week: Number(formData.get("day_of_week") ?? "1"),
    period_number: parsePeriodNumber(formData),
    start_time: String(formData.get("start_time") ?? ""),
    end_time: String(formData.get("end_time") ?? ""),
    room: String(formData.get("room") ?? "") || null,
  });
  if (res.ok)
    rev([
      "/admin/schedules",
      "/admin/timetable",
      "/admin/assignments",
      "/admin/dashboard",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function updateClassScheduleAction(id: string, formData: FormData) {
  const res = await admin.updateClassSchedule(id, {
    class_id: String(formData.get("class_id") ?? ""),
    subject_id: String(formData.get("subject_id") ?? ""),
    teacher_id: String(formData.get("teacher_id") ?? ""),
    day_of_week: Number(formData.get("day_of_week") ?? "1"),
    period_number: parsePeriodNumber(formData),
    start_time: String(formData.get("start_time") ?? ""),
    end_time: String(formData.get("end_time") ?? ""),
    room: String(formData.get("room") ?? "") || null,
  });
  if (res.ok)
    rev([
      "/admin/schedules",
      "/admin/timetable",
      "/admin/assignments",
      "/admin/dashboard",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function deactivateClassScheduleAction(id: string) {
  const res = await admin.deactivateClassSchedule(id);
  if (res.ok)
    rev([
      "/admin/schedules",
      "/admin/timetable",
      "/admin/assignments",
      "/admin/dashboard",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function reactivateClassScheduleAction(id: string) {
  const res = await admin.reactivateClassSchedule(id);
  if (res.ok)
    rev([
      "/admin/schedules",
      "/admin/timetable",
      "/admin/assignments",
      "/admin/dashboard",
      "/teacher/attendance",
      "/teacher/lessons",
      "/teacher/excuses",
    ]);
  return res;
}

export async function updateAttendanceStatusAction(recordId: string, status: AttendanceStatus) {
  const res = await admin.updateAttendanceRecordStatus(recordId, status);
  if (res.ok) rev(["/admin/attendance", "/admin/dashboard"]);
  return res;
}

export async function updateLessonLogAction(
  id: string,
  input: { topic?: string | null; content?: string; homework?: string | null },
) {
  const res = await admin.updateLessonLogAdmin(id, input);
  if (res.ok) rev(["/admin/lessons", "/admin/dashboard"]);
  return res;
}

export async function deleteLessonLogAction(id: string) {
  const res = await admin.deleteLessonLogAdmin(id);
  if (res.ok) rev(["/admin/lessons", "/admin/dashboard"]);
  return res;
}

export async function reviewExcuseAction(excuseId: string, decision: "approved" | "rejected") {
  const profile = await requireRole("admin");
  const res = await admin.reviewExcuseAsAdmin({ excuseId, reviewerId: profile.id, decision });
  if (res.ok) rev(["/admin/excuses", "/admin/dashboard", "/parent/notifications"]);
  return res;
}
