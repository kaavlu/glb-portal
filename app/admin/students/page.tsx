import {
  StudentCreateForm,
  StudentDeactivateButton,
  StudentEditForm,
  StudentParentLinkForm,
  StudentReactivateButton,
} from "@/components/admin/student-forms";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { Select } from "@/components/shared/select";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  listClassesForSelect,
  listParentsForSelect,
  listStudents,
  listStudentsForSelect,
} from "@/lib/data/admin";
import Link from "next/link";

export const metadata = {
  title: "Students",
};

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; classId?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const students = await listStudents({ search: sp.q, classId: sp.classId });
  const editing = students.find((s) => s.id === sp.edit);

  const classRows = await listClassesForSelect();
  const classOptions = classRows.map((c) => ({ value: c.id, label: c.name }));
  const parentOptions = (await listParentsForSelect()).map((p) => ({ value: p.id, label: p.full_name }));
  const studentOptions = (await listStudentsForSelect()).map((s) => ({ value: s.id, label: s.full_name }));

  const filterClassOptions = [{ value: "", label: "All classes" }, ...classOptions];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Students</h1>
        <p className="mt-1 text-sm text-muted">Roster, group assignment, language group, and parent links.</p>
      </div>

      <Card className="space-y-4 p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Add student</h2>
        <StudentCreateForm classes={classOptions} />
      </Card>

      <Card id="link-parent" className="space-y-4 p-5 shadow-card scroll-mt-24">
        <h2 className="text-sm font-semibold text-foreground">Link parent to student</h2>
        <StudentParentLinkForm parents={parentOptions} students={studentOptions} />
      </Card>

      {editing ? (
        <Card className="space-y-3 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Edit student</h2>
            <Link
              href={`/admin/students?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(sp.classId ? { classId: sp.classId } : {}) }).toString()}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              Cancel
            </Link>
          </div>
          <StudentEditForm student={editing} classes={classOptions} />
        </Card>
      ) : null}

      <Card className="space-y-4 p-5 shadow-card">
        <form method="get" className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="sr-only" htmlFor="q">
              Search
            </label>
            <SearchInput id="q" name="q" placeholder="Search by name…" defaultValue={sp.q ?? ""} />
          </div>
          <Select
            name="classId"
            label="Class"
            options={filterClassOptions}
            defaultValue={sp.classId ?? ""}
          />
          <div className="flex items-end gap-2">
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
            { key: "full_name", header: "Full name" },
            { key: "class_name", header: "Group / class" },
            {
              key: "language_group",
              header: "Language group",
              render: (r) => {
                const lg = (r as { language_group: string | null }).language_group;
                return <span className="text-foreground">{lg?.trim() ? lg : "All classes"}</span>;
              },
            },
            {
              key: "linkedParentsCount",
              header: "Linked parents",
              render: (r) => (
                <span className="tabular-nums text-foreground">
                  {(r as { linkedParentsCount: number }).linkedParentsCount}
                </span>
              ),
            },
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
                const qs = new URLSearchParams();
                if (sp.q) qs.set("q", sp.q);
                if (sp.classId) qs.set("classId", sp.classId);
                qs.set("edit", row.id);
                return (
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link href={`/admin/students?${qs.toString()}`} className="text-sm font-medium text-primary hover:underline">
                      Edit
                    </Link>
                    <Link
                      href="/admin/students#link-parent"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Link parent
                    </Link>
                    {row.is_active ? <StudentDeactivateButton id={row.id} /> : <StudentReactivateButton id={row.id} />}
                  </div>
                );
              },
            },
          ]}
          rows={students as unknown as Record<string, unknown>[]}
          getRowKey={(r) => String((r as { id: string }).id)}
        />
      </Card>
    </div>
  );
}
