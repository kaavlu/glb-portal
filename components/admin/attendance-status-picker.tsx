"use client";

import { updateAttendanceStatusAction } from "@/lib/actions/admin";
import type { AttendanceStatus } from "@/types/domain";
import { useTransition } from "react";
import { toast } from "sonner";

export function AttendanceStatusPicker({ recordId, value }: { recordId: string; value: AttendanceStatus }) {
  const [pending, start] = useTransition();

  return (
    <select
      className="h-9 min-w-[120px] rounded-lg border border-border bg-card px-2 text-sm text-foreground shadow-sm"
      defaultValue={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as AttendanceStatus;
        start(async () => {
          const r = await updateAttendanceStatusAction(recordId, next);
          if (r.ok) toast.success("Attendance updated");
          else toast.error(r.error);
        });
      }}
    >
      <option value="present">Present</option>
      <option value="absent">Absent</option>
      <option value="late">Late</option>
    </select>
  );
}
