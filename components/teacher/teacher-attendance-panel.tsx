"use client";

import {
  loadTeacherAttendanceAction,
  setTeacherAttendanceStatusAction,
} from "@/lib/actions/teacher-attendance";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Select, type SelectOption } from "@/components/shared/select";
import { StudentAttendanceRow } from "@/components/teacher/student-attendance-row";
import type {
  TeacherAssignmentRow,
  TeacherAttendanceRosterRow,
} from "@/lib/data/teachers";
import type { TeacherSessionSlotOption } from "@/types/teacher-sessions";
import { formatDisplayDate } from "@/lib/utils/dates";
import type { AttendanceStatus } from "@/types/domain";
import { ClipboardList } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

function summarize(rows: TeacherAttendanceRosterRow[]) {
  let present = 0;
  let absent = 0;
  let late = 0;
  for (const r of rows) {
    if (r.status === "present") present += 1;
    else if (r.status === "absent") absent += 1;
    else late += 1;
  }
  return { total: rows.length, present, absent, late };
}

export type TeacherAttendancePanelProps = {
  assignments: TeacherAssignmentRow[];
};

export function TeacherAttendancePanel({ assignments }: TeacherAttendancePanelProps) {
  const [sessionDate, setSessionDate] = useState("");
  const [assignmentId, setAssignmentId] = useState(assignments[0]?.id ?? "");
  const [slots, setSlots] = useState<TeacherSessionSlotOption[]>([]);
  const [selectedSlotKey, setSelectedSlotKey] = useState<string>("");
  const [rows, setRows] = useState<TeacherAttendanceRosterRow[]>([]);
  const [saveStateByRecordId, setSaveStateByRecordId] = useState<Record<string, "idle" | "saving" | "saved" | "error">>(
    {},
  );
  const [classLabel, setClassLabel] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    setSessionDate(`${y}-${m}-${d}`);
  }, []);

  const load = useCallback(
    (slotOverride?: string) => {
      if (!assignmentId || !sessionDate) return;
      setError(null);
      startTransition(async () => {
        const res = await loadTeacherAttendanceAction({
          assignmentId,
          sessionDate,
          ...(slotOverride !== undefined ? { slotKey: slotOverride } : {}),
        });
        if (!res.ok) {
          setError(res.error);
          setRows([]);
          setSlots([]);
          setSaveStateByRecordId({});
          return;
        }
        setSlots(res.slots);
        setSelectedSlotKey(res.selectedSlotKey);
        setRows(res.rows);
        setSaveStateByRecordId({});
        setClassLabel(res.className);
        setSubjectName(res.subjectName);
      });
    },
    [assignmentId, sessionDate],
  );

  useEffect(() => {
    if (!sessionDate || !assignmentId) return;
    load();
  }, [assignmentId, sessionDate, load]);

  const counts = useMemo(() => summarize(rows), [rows]);

  const assignmentOptions: SelectOption[] = useMemo(
    () =>
      assignments.map((a) => ({
        value: a.id,
        label: `${a.class_name} — ${a.subject_name}`,
      })),
    [assignments],
  );

  const slotSelectOptions: SelectOption[] = useMemo(
    () => slots.map((s) => ({ value: s.key, label: s.label })),
    [slots],
  );

  async function handleStatus(recordId: string, status: AttendanceStatus) {
    const prev = rows;
    setRows((r) => r.map((row) => (row.recordId === recordId ? { ...row, status } : row)));
    setSaveStateByRecordId((m) => ({ ...m, [recordId]: "saving" }));
    const res = await setTeacherAttendanceStatusAction({ recordId, status });
    if (!res.ok) {
      setRows(prev);
      setSaveStateByRecordId((m) => ({ ...m, [recordId]: "error" }));
      toast.error(res.error);
      return;
    }
    setSaveStateByRecordId((m) => ({ ...m, [recordId]: "saved" }));
    window.setTimeout(() => {
      setSaveStateByRecordId((m) => {
        if (m[recordId] !== "saved") return m;
        const next = { ...m };
        delete next[recordId];
        return next;
      });
    }, 1500);
  }

  if (assignments.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={ClipboardList}
          title="No assignments"
          description="You have no active class assignments yet. Contact an administrator."
        />
      </Card>
    );
  }

  const titleDate =
    sessionDate && !Number.isNaN(Date.parse(`${sessionDate}T12:00:00`))
      ? formatDisplayDate(`${sessionDate}T12:00:00`, "MMMM d, yyyy")
      : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Class"
            name="assignment"
            options={assignmentOptions}
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
          />
          <div className="space-y-1.5">
            <label htmlFor="session-date" className="block text-sm font-medium text-foreground">
              Date
            </label>
            <input
              id="session-date"
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary"
            />
          </div>
          {slots.length > 1 ? (
            <Select
              label="Session"
              name="sessionSlot"
              options={slotSelectOptions}
              value={selectedSlotKey}
              onChange={(e) => load(e.target.value)}
            />
          ) : null}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Today&apos;s Attendance — Class {classLabel || "…"}
          {subjectName ? ` — ${subjectName}` : ""}
        </h1>
        {titleDate ? <p className="mt-1 text-sm text-muted">{titleDate}</p> : null}
      </div>

      {error ? <ErrorState title="Could not load attendance" message={error} /> : null}

      <Card className="p-4 sm:p-6">
        <p className="text-sm font-medium text-foreground">Summary</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-white px-3 py-2">
            <dt className="text-xs text-muted">Total</dt>
            <dd className="text-lg font-semibold tabular-nums">{counts.total}</dd>
          </div>
          <div className="rounded-lg border border-border bg-white px-3 py-2">
            <dt className="text-xs text-muted">Present</dt>
            <dd className="text-lg font-semibold tabular-nums text-emerald-700">{counts.present}</dd>
          </div>
          <div className="rounded-lg border border-border bg-white px-3 py-2">
            <dt className="text-xs text-muted">Absent</dt>
            <dd className="text-lg font-semibold tabular-nums text-red-600">{counts.absent}</dd>
          </div>
          <div className="rounded-lg border border-border bg-white px-3 py-2">
            <dt className="text-xs text-muted">Late</dt>
            <dd className="text-lg font-semibold tabular-nums text-amber-600">{counts.late}</dd>
          </div>
        </dl>
      </Card>

      <Card className="p-4 sm:p-6">
        {pending && rows.length === 0 ? <LoadingState label="Loading roster…" /> : null}
        {!pending || rows.length > 0 ? (
          rows.length === 0 && !pending ? (
            <EmptyState
              icon={ClipboardList}
              title="No students"
              description="There are no active students in this class."
            />
          ) : (
            <div>
              {rows.map((row) => (
                <StudentAttendanceRow
                  key={row.recordId}
                  row={row}
                  disabled={pending}
                  saveState={saveStateByRecordId[row.recordId] ?? "idle"}
                  onStatus={(status) => handleStatus(row.recordId, status)}
                />
              ))}
            </div>
          )
        ) : null}
      </Card>

      <div className="flex justify-end">
        <Button type="button" variant="secondary" size="sm" disabled={pending || !assignmentId || !sessionDate} onClick={() => load()}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
