import { LessonLogActions } from "@/components/admin/lesson-log-actions";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { Select } from "@/components/shared/select";
import {
  listAdminLessonLogs,
  listClassesForSelect,
  listSubjectsForSelect,
  listTeachersForSelect,
} from "@/lib/data/admin";
import { formatDateTime, formatShortDate } from "@/lib/utils/dates";
import type { AdminLessonFilters, AdminLessonLogRow } from "@/types/admin";
import { format } from "date-fns";

export const metadata = {
  title: "Lesson logs",
};

export default async function AdminLessonsPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    classId?: string;
    subjectId?: string;
    teacherId?: string;
  }>;
}) {
  const sp = await searchParams;

  const effectiveDate = sp.date && sp.date.length > 0 ? sp.date : format(new Date(), "yyyy-MM-dd");

  const filters: AdminLessonFilters = {
    date: effectiveDate,
    classId: sp.classId || undefined,
    subjectId: sp.subjectId || undefined,
    teacherId: sp.teacherId || undefined,
  };

  const rows = await listAdminLessonLogs(filters);

  const classes = [{ value: "", label: "All classes" }, ...(await listClassesForSelect()).map((c) => ({ value: c.id, label: c.name }))];
  const subjects = [
    { value: "", label: "All subjects" },
    ...(await listSubjectsForSelect()).map((s) => ({
      value: s.id,
      label: s.full_name ? `${s.name} — ${s.full_name}` : s.name,
    })),
  ];
  const teachers = [{ value: "", label: "All teachers" }, ...(await listTeachersForSelect()).map((t) => ({ value: t.id, label: t.full_name }))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lesson logs</h1>
        <p className="mt-1 text-sm text-muted">Review and edit lesson logs across the school.</p>
      </div>

      <Card className="space-y-4 p-5 shadow-card">
        <form method="get" className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={effectiveDate}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            />
          </div>
          <Select name="classId" label="Class" options={classes} defaultValue={sp.classId ?? ""} />
          <Select name="subjectId" label="Subject" options={subjects} defaultValue={sp.subjectId ?? ""} />
          <Select name="teacherId" label="Teacher" options={teachers} defaultValue={sp.teacherId ?? ""} />
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
            { key: "teacherName", header: "Teacher" },
            {
              key: "topic",
              header: "Topic",
              render: (r) => (r as { topic: string | null }).topic?.trim() || "—",
            },
            {
              key: "updatedAt",
              header: "Last updated",
              render: (r) => formatDateTime((r as { updatedAt: string }).updatedAt),
            },
            {
              key: "actions",
              header: "Details",
              render: (r) => <LessonLogActions log={r as unknown as AdminLessonLogRow} />,
            },
          ]}
          rows={rows as unknown as Record<string, unknown>[]}
          getRowKey={(r) => String((r as { id: string }).id)}
        />
      </Card>
    </div>
  );
}
