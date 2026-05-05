"use server";

import { requireRole } from "@/lib/auth/require-role";
import {
  assertTeacherAssignment,
  buildTeacherSessionSlotOptions,
  getAttendanceForSession,
  getOrCreateClassSession,
  getTeacherAssignments,
  getTeacherSchedulesForDate,
  initializeAttendanceForSession,
  listExistingSessionsForAssignmentDate,
  pickDefaultTeacherSessionSlotKey,
  updateAttendanceStatus,
} from "@/lib/data/teachers";
import type {
  TeacherAttendanceRosterRow,
  TeacherScheduleSlot,
} from "@/lib/data/teachers";
import type { TeacherSessionSlotOption } from "@/types/teacher-sessions";
import type { AttendanceStatus } from "@/types/domain";
import { revalidatePath } from "next/cache";

function filterSlotsForAssignment(slots: TeacherScheduleSlot[], classId: string, subjectId: string) {
  return slots.filter((s) => s.class_id === classId && s.subject_id === subjectId);
}

export async function loadTeacherAttendanceAction(input: {
  assignmentId: string;
  sessionDate: string;
  slotKey?: string | null;
}): Promise<
  | {
      ok: true;
      slots: TeacherSessionSlotOption[];
      selectedSlotKey: string;
      sessionId: string;
      className: string;
      subjectName: string;
      rows: TeacherAttendanceRosterRow[];
    }
  | { ok: false; error: string }
> {
  const profile = await requireRole("teacher");
  const assignment = await assertTeacherAssignment(profile.id, input.assignmentId);
  if (!assignment) return { ok: false, error: "Assignment not found." };

  const assignments = await getTeacherAssignments(profile.id);
  const meta = assignments.find((a) => a.id === input.assignmentId);
  if (!meta) return { ok: false, error: "Assignment not found." };

  const allSchedules = await getTeacherSchedulesForDate(profile.id, input.sessionDate);
  const forAssign = filterSlotsForAssignment(allSchedules, assignment.class_id, assignment.subject_id);
  const existingSessions = await listExistingSessionsForAssignmentDate({
    teacherId: profile.id,
    classId: assignment.class_id,
    subjectId: assignment.subject_id,
    sessionDate: input.sessionDate,
  });

  const slots = buildTeacherSessionSlotOptions({
    schedulesForAssignment: forAssign,
    existingSessions,
  });

  const selectedSlotKey =
    input.slotKey && slots.some((s) => s.key === input.slotKey)
      ? input.slotKey
      : pickDefaultTeacherSessionSlotKey(slots, existingSessions);

  const slot = slots.find((s) => s.key === selectedSlotKey) ?? slots[0];
  if (!slot) return { ok: false, error: "No session slot available." };

  const session = await getOrCreateClassSession({
    teacherId: profile.id,
    classId: assignment.class_id,
    subjectId: assignment.subject_id,
    sessionDate: input.sessionDate,
    scheduleId: slot.schedule_id,
    startTime: slot.start_time,
    endTime: slot.end_time,
  });

  await initializeAttendanceForSession(session.id, assignment.class_id, profile.id);
  const rows = await getAttendanceForSession(session.id);

  revalidatePath("/teacher/attendance");

  return {
    ok: true,
    slots,
    selectedSlotKey: slot.key,
    sessionId: session.id,
    className: meta.class_name,
    subjectName: meta.subject_name,
    rows,
  };
}

export async function setTeacherAttendanceStatusAction(input: {
  recordId: string;
  status: AttendanceStatus;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireRole("teacher");
  const res = await updateAttendanceStatus(input.recordId, input.status, profile.id);
  if (res.ok) revalidatePath("/teacher/attendance");
  return res;
}
