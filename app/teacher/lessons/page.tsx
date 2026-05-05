import { TeacherLessonLogsPanel } from "@/components/teacher/teacher-lesson-logs-panel";
import { requireRole } from "@/lib/auth/require-role";

export const metadata = {
  title: "Lesson Logs",
};

export default async function TeacherLessonsPage() {
  await requireRole("teacher");
  return <TeacherLessonLogsPanel />;
}
