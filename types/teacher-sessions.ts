/** Shared shapes for teacher session pickers (safe for client components). */

export type TeacherSessionSlotOption = {
  key: string;
  label: string;
  schedule_id: string | null;
  start_time: string | null;
  end_time: string | null;
};

export type TeacherLessonSessionListItem = {
  assignmentId: string;
  classId: string;
  subjectId: string;
  className: string;
  subjectName: string;
  slotKey: string;
  slotLabel: string;
  scheduleId: string | null;
  startTime: string | null;
  endTime: string | null;
};
