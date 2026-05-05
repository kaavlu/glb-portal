import { ExcuseReviewButtons } from "@/components/admin/excuse-review-buttons";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { Select } from "@/components/shared/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { listAdminExcuses, listClassesForSelect, listStudentsForSelect } from "@/lib/data/admin";
import { formatDateTime, formatShortDate } from "@/lib/utils/dates";
import type { AdminExcuseFilters, AdminExcuseRow } from "@/types/admin";
import type { ExcuseStatus } from "@/types/domain";

export const metadata = {
  title: "Excuses",
};

function toLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function AdminExcusesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    studentId?: string;
    classId?: string;
  }>;
}) {
  const sp = await searchParams;

  const filters: AdminExcuseFilters = {
    status: (sp.status as ExcuseStatus | "all" | "") || "all",
    studentId: sp.studentId || undefined,
    classId: sp.classId || undefined,
  };

  const rows = await listAdminExcuses(filters);

  const students = [{ value: "", label: "All students" }, ...(await listStudentsForSelect()).map((s) => ({ value: s.id, label: s.full_name }))];
  const classes = [{ value: "", label: "All classes" }, ...(await listClassesForSelect()).map((c) => ({ value: c.id, label: c.name }))];

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Excuse requests</h1>
        <p className="mt-1 text-sm text-muted">Approve or reject submitted excuses and notify parents.</p>
      </div>

      <Card className="space-y-4 p-5 shadow-card">
        <form method="get" className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Select name="status" label="Status" options={statusOptions} defaultValue={filters.status === "all" ? "all" : String(filters.status)} />
          <Select name="studentId" label="Student" options={students} defaultValue={sp.studentId ?? ""} />
          <Select name="classId" label="Class" options={classes} defaultValue={sp.classId ?? ""} />
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
              render: (r) => toLabel(String((r as { reasonCategory: string }).reasonCategory)),
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
                const st = (r as { status: ExcuseStatus }).status;
                const tone = st === "pending" ? "warning" : st === "approved" ? "success" : "neutral";
                return <StatusBadge tone={tone}>{toLabel(st)}</StatusBadge>;
              },
            },
            {
              key: "reviewedByName",
              header: "Reviewed by",
              render: (r) => (r as { reviewedByName: string | null }).reviewedByName ?? "—",
            },
            {
              key: "reviewedAt",
              header: "Reviewed at",
              render: (r) => {
                const v = (r as { reviewedAt: string | null }).reviewedAt;
                return v ? formatDateTime(v) : "—";
              },
            },
            {
              key: "actions",
              header: "Actions",
              render: (r) => {
                const row = r as unknown as AdminExcuseRow;
                return <ExcuseReviewButtons excuse={row} />;
              },
            },
          ]}
          rows={rows as unknown as Record<string, unknown>[]}
          getRowKey={(r) => String((r as { id: string }).id)}
        />
      </Card>
    </div>
  );
}
