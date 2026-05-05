import type { AttendanceStatus, ExcuseStatus } from "@/types/domain";

/** Parent-facing label from attendance + optional excuse (spec §9.1). */
export function getParentDisplayStatus(
  attendanceStatus: AttendanceStatus,
  excuseStatus: ExcuseStatus | null,
): string {
  if (attendanceStatus === "present") return "Present";
  if (attendanceStatus === "late") return "Late";

  if (attendanceStatus === "absent") {
    if (!excuseStatus) return "Unexcused";
    if (excuseStatus === "pending") return "Pending";
    if (excuseStatus === "approved") return "Excused";
    if (excuseStatus === "rejected") return "Unexcused";
  }

  return "Unknown";
}
