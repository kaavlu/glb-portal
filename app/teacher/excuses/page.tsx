import { TeacherExcuseReviewButtons } from "@/components/teacher/excuse-review-buttons";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { Select } from "@/components/shared/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/require-role";
import {
  getExcusesForTeacher,
  getStudentsForClass,
  getTeacherAssignments,
  type TeacherExcuseFilters,
  type TeacherExcuseRow,
} from "@/lib/data/teachers";
import { formatShortDate } from "@/lib/utils/dates";
import type { ExcuseStatus } from "@/types/domain";

export const metadata = {
  title: "Excuses",
};

function toDisplayCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function toLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function TeacherExcusesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    classId?: string;
    studentId?: string;
    date?: string;
  }>;
}) {
  const profile = await requireRole("teacher");
  const assignments = await getTeacherAssignments(profile.id);
  const sp = await searchParams;

  const filters: TeacherExcuseFilters = {
    status: (sp.status as ExcuseStatus | "all" | "") || "all",
    classId: sp.classId || undefined,
    studentId: sp.studentId || undefined,
    date: sp.date || undefined,
  };

  const rows = await getExcusesForTeacher(profile.id, filters);

  const uniqueClassMap = new Map(assignments.map((assignment) => [assignment.class_id, assignment.class_name]));
  const classOptions = [
    { value: "", label: "All classes" },
    ...[...uniqueClassMap.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => ({ value: id, label: name })),
  ];

  const studentLists = await Promise.all(
    [...uniqueClassMap.keys()].map(async (classId) => getStudentsForClass(classId)),
  );
  const studentMap = new Map<string, string>();
  for (const list of studentLists) {
    for (const student of list) {
      studentMap.set(student.id, student.full_name);
    }
  }

  const studentOptions = [
    { value: "", label: "All students" },
    ...[...studentMap.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => ({ value: id, label: name })),
  ];

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Excuses</h1>
        <p className="mt-1 text-sm text-muted">
          Review pending and processed excuses for students in your assigned classes.
        </p>
      </div>

      <Card className="space-y-4 p-5 shadow-card">
        <form method="get" className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <Select
            name="status"
            label="Status"
            options={statusOptions}
            defaultValue={filters.status === "all" ? "all" : String(filters.status)}
          />
          <Select name="classId" label="Class" options={classOptions} defaultValue={sp.classId ?? ""} />
          <Select name="studentId" label="Student" options={studentOptions} defaultValue={sp.studentId ?? ""} />
          <div className="w-full space-y-1.5">
            <label htmlFor="date" className="block text-sm font-medium text-foreground">
              Date
            </label>
            <input
              id="date"
              type="date"
              name="date"
              defaultValue={sp.date ?? ""}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary"
            />
          </div>
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
            { key: "studentName", header: "Student" },
            { key: "className", header: "Class", render: (r) => (r as { className: string | null }).className ?? "—" },
            {
              key: "absenceDate",
              header: "Absence date",
              render: (r) => formatShortDate((r as { absenceDate: string }).absenceDate),
            },
            {
              key: "reasonCategory",
              header: "Reason",
              render: (r) => toDisplayCategory((r as { reasonCategory: string }).reasonCategory),
            },
            {
              key: "description",
              header: "Description",
              render: (r) => (r as { description: string | null }).description ?? "—",
            },
            { key: "parentName", header: "Submitted by" },
            {
              key: "status",
              header: "Status",
              render: (r) => {
                const status = (r as { status: ExcuseStatus }).status;
                const tone = status === "pending" ? "warning" : status === "approved" ? "success" : "neutral";
                return <StatusBadge tone={tone}>{toLabel(status)}</StatusBadge>;
              },
            },
            {
              key: "actions",
              header: "Actions",
              render: (r) => <TeacherExcuseReviewButtons excuse={r as TeacherExcuseRow} />,
            },
          ]}
          rows={rows as unknown as Record<string, unknown>[]}
          getRowKey={(r) => String((r as { id: string }).id)}
        />
      </Card>
    </div>
  );
}
