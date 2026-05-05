"use client";

import { AvatarInitials } from "@/components/shared/avatar-initials";
import { cn } from "@/lib/utils/cn";
import type { TeacherAttendanceRosterRow } from "@/lib/data/teachers";
import type { AttendanceStatus } from "@/types/domain";

export function StudentAttendanceRow({
  row,
  disabled,
  onStatus,
  saveState,
}: {
  row: TeacherAttendanceRosterRow;
  disabled?: boolean;
  onStatus: (status: AttendanceStatus) => void;
  saveState?: "idle" | "saving" | "saved" | "error";
}) {
  const statuses: AttendanceStatus[] = ["present", "absent", "late"];
  const labels: Record<AttendanceStatus, string> = {
    present: "Present",
    absent: "Absent",
    late: "Late",
  };

  const saveLabel =
    saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : saveState === "error" ? "Not saved" : null;
  const saveLabelClass =
    saveState === "saving"
      ? "text-muted"
      : saveState === "saved"
        ? "text-emerald-700"
        : saveState === "error"
          ? "text-red-600"
          : "text-muted";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <AvatarInitials name={row.studentName} />
        <p className="truncate font-medium text-foreground">{row.studentName}</p>
      </div>
      <div className="flex items-center gap-3">
        {saveLabel ? (
          <span className={cn("text-xs font-medium tabular-nums", saveLabelClass)} aria-live="polite">
            {saveLabel}
          </span>
        ) : null}
        <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const active = row.status === status;
          const palette =
            status === "present"
              ? active
                ? "bg-emerald-600 text-white ring-1 ring-emerald-700 shadow-sm"
                : "bg-card text-foreground ring-1 ring-border hover:bg-stone-50"
              : status === "absent"
                ? active
                  ? "bg-red-600 text-white ring-1 ring-red-700 shadow-sm"
                  : "bg-card text-foreground ring-1 ring-border hover:bg-stone-50"
                : active
                  ? "bg-amber-500 text-white ring-1 ring-amber-600 shadow-sm"
                  : "bg-card text-foreground ring-1 ring-border hover:bg-stone-50";

          return (
            <button
              key={status}
              type="button"
              disabled={disabled}
              onClick={() => onStatus(status)}
              className={cn(
                "inline-flex h-9 min-w-[5.5rem] items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors disabled:opacity-50",
                palette,
              )}
            >
              {labels[status]}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
