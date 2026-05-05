import { AttendanceStatusPicker } from "@/components/admin/attendance-status-picker";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { Select } from "@/components/shared/select";
import {
  listAdminAttendance,
  listClassesForSelect,
  listStudentsForSelect,
  listTeachersForSelect,
} from "@/lib/data/admin";
import { formatDateTime, formatShortDate } from "@/lib/utils/dates";
import type { AdminAttendanceFilters } from "@/types/admin";
import type { AttendanceStatus } from "@/types/domain";
import { format } from "date-fns";

export const metadata = {
  title: "Attendance",
};

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    classId?: string;
    studentId?: string;
    teacherId?: string;
    status?: string;
  }>;
}) {
  const sp = await searchParams;

  const effectiveDate = sp.date && sp.date.length > 0 ? sp.date : format(new Date(), "yyyy-MM-dd");

  const filters: AdminAttendanceFilters = {
    date: effectiveDate,
    classId: sp.classId || undefined,
    studentId: sp.studentId || undefined,
    teacherId: sp.teacherId || undefined,
    status: (sp.status as AttendanceStatus | "") || "",
  };

  const rows = await listAdminAttendance(filters);

  const classes = [{ value: "", label: "All classes" }, ...(await listClassesForSelect()).map((c) => ({ value: c.id, label: c.name }))];
  const students = [{ value: "", label: "All students" }, ...(await listStudentsForSelect()).map((s) => ({ value: s.id, label: s.full_name }))];
  const teachers = [{ value: "", label: "All teachers" }, ...(await listTeachersForSelect()).map((t) => ({ value: t.id, label: t.full_name }))];

  const statusOptions = [
    { value: "", label: "All statuses" },
    { value: "present", label: "Present" },
    { value: "absent", label: "Absent" },
    { value: "late", label: "Late" },
  ];

  const defaultDate = effectiveDate;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Attendance</h1>
        <p className="mt-1 text-sm text-muted">All attendance records with excuse context.</p>
      </div>

      <Card className="space-y-4 p-5 shadow-card">
        <form method="get" className="grid gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={defaultDate}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            />
          </div>
          <Select name="classId" label="Class" options={classes} defaultValue={sp.classId ?? ""} />
          <Select name="studentId" label="Student" options={students} defaultValue={sp.studentId ?? ""} />
          <Select name="teacherId" label="Teacher" options={teachers} defaultValue={sp.teacherId ?? ""} />
          <Select name="status" label="Status" options={statusOptions} defaultValue={sp.status ?? ""} />
          <div className="flex items-end">
            <button
              type="submit"
              className="h-10 w-full rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
            >
              Apply filters
            </button>
          </div>
        </form>

        <DataTable
          columns={[
            {
              key: "sessionDate",
              header: "Date",
              render: (r) => formatShortDate((r as { sessionDate: string }).sessionDate),
            },
            { key: "className", header: "Class" },
            { key: "subjectName", header: "Subject" },
            { key: "studentName", header: "Student" },
            {
              key: "status",
              header: "Status",
              render: (r) => {
                const row = r as { id: string; status: AttendanceStatus };
                return <AttendanceStatusPicker recordId={row.id} value={row.status} />;
              },
            },
            { key: "recordedByName", header: "Recorded by", render: (r) => (r as { recordedByName: string | null }).recordedByName ?? "—" },
            {
              key: "recordedAt",
              header: "Recorded at",
              render: (r) => formatDateTime((r as { recordedAt: string }).recordedAt),
            },
            { key: "excuseStatus", header: "Excuse" },
          ]}
          rows={rows as unknown as Record<string, unknown>[]}
          getRowKey={(r) => String((r as { id: string }).id)}
        />
      </Card>
    </div>
  );
}
