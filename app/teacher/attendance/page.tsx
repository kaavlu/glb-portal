import { TeacherAttendancePanel } from "@/components/teacher/teacher-attendance-panel";
import { requireRole } from "@/lib/auth/require-role";
import { getTeacherAssignments } from "@/lib/data/teachers";

export const metadata = {
  title: "Attendance",
};

export default async function TeacherAttendancePage() {
  const profile = await requireRole("teacher");
  const assignments = await getTeacherAssignments(profile.id);

  return <TeacherAttendancePanel assignments={assignments} />;
}
