import {
  AssignmentCreateForm,
  AssignmentDeactivateButton,
  AssignmentEditForm,
  AssignmentReactivateButton,
} from "@/components/admin/assignment-forms";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  listClassesForSelect,
  listSubjectsForSelect,
  listTeacherAssignments,
  listTeachersForSelect,
} from "@/lib/data/admin";
import Link from "next/link";

export const metadata = {
  title: "Assignments",
};

export default async function AdminAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const rows = await listTeacherAssignments(sp.q);

  const teachers = (await listTeachersForSelect()).map((t) => ({ value: t.id, label: t.full_name }));
  const classes = (await listClassesForSelect()).map((c) => ({ value: c.id, label: c.name }));
  const subjects = (await listSubjectsForSelect()).map((s) => ({
    value: s.id,
    label: s.full_name ? `${s.name} — ${s.full_name}` : s.name,
  }));

  const editing = rows.find((r) => r.id === sp.edit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Teacher assignments</h1>
        <p className="mt-1 text-sm text-muted">Assign teachers to class + subject pairs.</p>
      </div>

      <Card className="space-y-3 p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Create assignment</h2>
        <AssignmentCreateForm teachers={teachers} classes={classes} subjects={subjects} />
      </Card>

      {editing ? (
        <Card className="space-y-3 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Edit assignment</h2>
            <Link href="/admin/assignments" className="text-xs font-medium text-primary hover:underline">
              Cancel
            </Link>
          </div>
          <AssignmentEditForm row={editing} teachers={teachers} classes={classes} subjects={subjects} />
        </Card>
      ) : null}

      <Card className="space-y-4 p-5 shadow-card">
        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <SearchInput id="q" name="q" placeholder="Filter by teacher, class, subject…" defaultValue={sp.q ?? ""} />
          </div>
          <button
            type="submit"
            className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
          >
            Search
          </button>
        </form>

        <DataTable
          columns={[
            { key: "teacher_name", header: "Teacher" },
            { key: "subject_name", header: "Subject" },
            { key: "class_name", header: "Class" },
            {
              key: "is_active",
              header: "Status",
              render: (r) => (
                <StatusBadge tone={(r as { is_active: boolean }).is_active ? "success" : "neutral"}>
                  {(r as { is_active: boolean }).is_active ? "Active" : "Inactive"}
                </StatusBadge>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (r) => {
                const row = r as { id: string; is_active: boolean };
                return (
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link
                      href={`/admin/assignments?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), edit: row.id }).toString()}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    {row.is_active ? <AssignmentDeactivateButton id={row.id} /> : <AssignmentReactivateButton id={row.id} />}
                  </div>
                );
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
