import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/require-role";
import {
  getAbsenceSummaryForParent,
  getLinkedStudents,
  getStudentAttendanceForParent,
  type ParentAttendanceDisplayStatus,
} from "@/lib/data/parents";
import { formatDisplayDate } from "@/lib/utils/dates";
import { CalendarX2 } from "lucide-react";

export const metadata = {
  title: "Attendance",
};

function badgeTone(status: ParentAttendanceDisplayStatus): "success" | "warning" | "info" | "error" {
  if (status === "Present") return "success";
  if (status === "Late") return "warning";
  if (status === "Pending") return "info";
  if (status === "Excused") return "success";
  return "error";
}

export default async function ParentAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const profile = await requireRole("parent");
  const linkedStudents = await getLinkedStudents(profile.id);
  const sp = await searchParams;
  const requestedStudentId = sp.studentId;
  const fallbackStudentId = linkedStudents[0]?.id;

  const selectedStudent =
    linkedStudents.find((student) => student.id === requestedStudentId) ?? linkedStudents[0] ?? null;
  const selectedStudentId = selectedStudent?.id ?? fallbackStudentId ?? null;

  const attendanceRecords = selectedStudentId
    ? await getStudentAttendanceForParent(profile.id, selectedStudentId)
    : [];
  const summary = selectedStudentId
    ? await getAbsenceSummaryForParent(profile.id, selectedStudentId)
    : { totalAbsences: 0, unexcusedAbsences: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Attendance Record</h1>
        <p className="mt-1 text-sm text-muted">
          {selectedStudent
            ? `Showing attendance history for ${selectedStudent.fullName}.`
            : "No linked student selected."}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4 sm:p-5">
          <p className="text-xs text-muted">Total Absences</p>
          <p className="mt-1 text-2xl font-semibold text-foreground tabular-nums">{summary.totalAbsences}</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs text-muted">Unexcused</p>
          <p className="mt-1 text-2xl font-semibold text-red-600 tabular-nums">{summary.unexcusedAbsences}</p>
        </Card>
      </div>

      <Card className="p-6">
        {attendanceRecords.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title="No attendance records"
            description="Attendance records will appear here once sessions are logged."
          />
        ) : (
          <div className="divide-y divide-border">
            {attendanceRecords.map((record) => (
              <article key={record.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{record.subjectName}</p>
                  <p className="text-xs text-muted">{formatDisplayDate(record.sessionDate, "MMMM d, yyyy")}</p>
                </div>
                <StatusBadge tone={badgeTone(record.displayStatus)}>{record.displayStatus}</StatusBadge>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
