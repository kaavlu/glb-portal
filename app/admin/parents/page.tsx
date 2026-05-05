import {
  ParentCreateForm,
  ParentDeactivateButton,
  ParentEditForm,
  ParentReactivateButton,
  ParentStudentLinkForm,
  ParentStudentUnlinkForm,
} from "@/components/admin/parent-forms";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  listParents,
  listParentsForSelect,
  listStudentsForSelect,
} from "@/lib/data/admin";
import Link from "next/link";

export const metadata = {
  title: "Parents",
};

export default async function AdminParentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const parents = await listParents(sp.q);
  const editing = parents.find((p) => p.id === sp.edit);

  const parentOptions = (await listParentsForSelect()).map((p) => ({ value: p.id, label: p.full_name }));
  const studentOptions = (await listStudentsForSelect()).map((s) => ({ value: s.id, label: s.full_name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Parents</h1>
        <p className="mt-1 text-sm text-muted">Manage parent accounts and student links.</p>
      </div>

      <Card id="add-parent" className="space-y-4 p-5 shadow-card scroll-mt-24">
        <h2 className="text-sm font-semibold text-foreground">Add parent</h2>
        <ParentCreateForm />
      </Card>

      <Card id="parent-student-link" className="space-y-4 p-5 shadow-card scroll-mt-24">
        <h2 className="text-sm font-semibold text-foreground">Link parent to student</h2>
        <ParentStudentLinkForm parents={parentOptions} students={studentOptions} />
      </Card>

      <Card id="parent-student-unlink" className="space-y-4 p-5 shadow-card scroll-mt-24">
        <h2 className="text-sm font-semibold text-foreground">Unlink parent from student</h2>
        <ParentStudentUnlinkForm parents={parentOptions} students={studentOptions} />
      </Card>

      {editing ? (
        <Card className="space-y-3 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Edit parent</h2>
            <Link href="/admin/parents" className="text-xs font-medium text-primary hover:underline">
              Cancel
            </Link>
          </div>
          <ParentEditForm parent={editing} />
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

        {parents.length === 0 ? (
          <EmptyState
            title="No parents yet"
            description="No parents have been added yet. Add parents manually and link them to students."
          />
        ) : (
          <DataTable
            columns={[
              { key: "full_name", header: "Full name" },
              { key: "email", header: "Email" },
              {
                key: "is_active",
                header: "Status",
                render: (r) => (
                  <StatusBadge tone={(r as { is_active: boolean }).is_active ? "success" : "neutral"}>
                    {(r as { is_active: boolean }).is_active ? "Active" : "Inactive"}
                  </StatusBadge>
                ),
              },
              { key: "linkedStudents", header: "Linked students" },
              {
                key: "actions",
                header: "Actions",
                render: (r) => {
                  const row = r as { id: string; is_active: boolean };
                  return (
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <Link
                        href={`/admin/parents?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), edit: row.id }).toString()}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href="/admin/parents#parent-student-link"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Link student
                      </Link>
                      <Link
                        href="/admin/parents#parent-student-unlink"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Unlink student
                      </Link>
                      {row.is_active ? <ParentDeactivateButton id={row.id} /> : <ParentReactivateButton id={row.id} />}
                    </div>
                  );
                },
              },
            ]}
            rows={parents as unknown as Record<string, unknown>[]}
            getRowKey={(r) => String((r as { id: string }).id)}
          />
        )}
      </Card>
    </div>
  );
}
