import { TeacherCreateForm, TeacherDeactivateButton, TeacherEditForm, TeacherReactivateButton } from "@/components/admin/teacher-forms";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { listTeachers } from "@/lib/data/admin";
import type { TeacherListRow } from "@/types/admin";
import Link from "next/link";

export const metadata = {
  title: "Teachers",
};

export default async function AdminTeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const teachers = await listTeachers(sp.q);
  const editing = teachers.find((t) => t.id === sp.edit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Teachers</h1>
        <p className="mt-1 text-sm text-muted">Teacher accounts, emails, and subject assignments.</p>
      </div>

      <Card className="space-y-4 p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Add teacher</h2>
        <TeacherCreateForm />
      </Card>

      {editing ? (
        <Card className="space-y-3 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Edit teacher</h2>
            <Link href="/admin/teachers" className="text-xs font-medium text-primary hover:underline">
              Cancel
            </Link>
          </div>
          <TeacherEditForm teacher={editing} />
        </Card>
      ) : null}

      <Card className="space-y-4 p-5 shadow-card">
        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="sr-only" htmlFor="q">
              Search
            </label>
            <SearchInput id="q" name="q" placeholder="Search by name or email…" defaultValue={sp.q ?? ""} />
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
            { key: "full_name", header: "Full name" },
            { key: "email", header: "Email" },
            { key: "assignedSubjects", header: "Assigned subjects" },
            {
              key: "isCoTeacher",
              header: "Co-teacher",
              render: (r) => {
                const row = r as unknown as TeacherListRow;
                return (
                  <StatusBadge tone={row.isCoTeacher ? "success" : "neutral"}>
                    {row.isCoTeacher ? "Yes" : "No"}
                  </StatusBadge>
                );
              },
            },
            {
              key: "is_active",
              header: "Status",
              render: (r) => {
                const row = r as unknown as TeacherListRow;
                return (
                  <StatusBadge tone={row.is_active ? "success" : "neutral"}>
                    {row.is_active ? "Active" : "Inactive"}
                  </StatusBadge>
                );
              },
            },
            {
              key: "actions",
              header: "Actions",
              className: "whitespace-nowrap",
              render: (r) => {
                const row = r as unknown as TeacherListRow;
                const qs = new URLSearchParams();
                if (sp.q) qs.set("q", sp.q);
                qs.set("edit", row.id);
                return (
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link href={`/admin/teachers?${qs.toString()}`} className="text-sm font-medium text-primary hover:underline">
                      Edit
                    </Link>
                    {row.is_active ? <TeacherDeactivateButton id={row.id} /> : <TeacherReactivateButton id={row.id} />}
                  </div>
                );
              },
            },
          ]}
          rows={teachers as unknown as Record<string, unknown>[]}
          getRowKey={(r) => String((r as { id: string }).id)}
        />
      </Card>
    </div>
  );
}
