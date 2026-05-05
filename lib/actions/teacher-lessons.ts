"use server";

import { requireRole } from "@/lib/auth/require-role";
import {
  assertTeacherAssignment,
  buildTeacherSessionSlotOptions,
  getLessonLog,
  getOrCreateClassSession,
  getTeacherAssignments,
  getTeacherLessonSessions,
  getTeacherSchedulesForDate,
  listExistingSessionsForAssignmentDate,
  pickDefaultTeacherSessionSlotKey,
  upsertLessonLog,
} from "@/lib/data/teachers";
import type {
  LessonLogRow,
  TeacherScheduleSlot,
} from "@/lib/data/teachers";
import type { TeacherLessonSessionListItem, TeacherSessionSlotOption } from "@/types/teacher-sessions";
import { revalidatePath } from "next/cache";

function filterSlotsForAssignment(slots: TeacherScheduleSlot[], classId: string, subjectId: string) {
  return slots.filter((s) => s.class_id === classId && s.subject_id === subjectId);
}

export async function listTeacherLessonSessionsAction(
  date: string,
): Promise<{ ok: true; sessions: TeacherLessonSessionListItem[] } | { ok: false; error: string }> {
  const profile = await requireRole("teacher");
  if (!date || Number.isNaN(Date.parse(`${date}T12:00:00`))) {
    return { ok: false, error: "Invalid date." };
  }
  const sessions = await getTeacherLessonSessions(profile.id, date);
  return { ok: true, sessions };
}

export async function loadTeacherLessonLogAction(input: {
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
      sessionDate: string;
      log: LessonLogRow | null;
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

  const log = await getLessonLog(session.id);

  return {
    ok: true,
    slots,
    selectedSlotKey: slot.key,
    sessionId: session.id,
    className: meta.class_name,
    subjectName: meta.subject_name,
    sessionDate: input.sessionDate,
    log,
  };
}

export async function saveTeacherLessonLogAction(input: {
  sessionId: string;
  topic: string;
  content: string;
  homework: string;
}): Promise<{ ok: true; log: LessonLogRow } | { ok: false; error: string }> {
  const profile = await requireRole("teacher");
  const content = input.content.trim();
  if (!content) {
    return { ok: false, error: "Lesson description is required." };
  }

  try {
    const log = await upsertLessonLog({
      sessionId: input.sessionId,
      teacherId: profile.id,
      topic: input.topic.trim() ? input.topic : null,
      content: input.content,
      homework: input.homework.trim() ? input.homework : null,
    });
    revalidatePath("/teacher/lessons");
    return { ok: true, log };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save lesson log.";
    return { ok: false, error: message };
  }
}
