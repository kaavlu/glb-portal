import {
  ClassCreateForm,
  ClassDeactivateButton,
  ClassEditForm,
  ClassReactivateButton,
} from "@/components/admin/class-forms";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { listClasses } from "@/lib/data/admin";
import Link from "next/link";

export const metadata = {
  title: "Classes",
};

export default async function AdminClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const rows = await listClasses(sp.q);
  const editing = rows.find((c) => c.id === sp.edit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Classes</h1>
        <p className="mt-1 text-sm text-muted">Create classes and track enrolled students.</p>
      </div>

      <Card className="space-y-3 p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Add class</h2>
        <ClassCreateForm />
      </Card>

      {editing ? (
        <Card className="space-y-3 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Edit class</h2>
            <Link href="/admin/classes" className="text-xs font-medium text-primary hover:underline">
              Cancel
            </Link>
          </div>
          <ClassEditForm row={editing} />
        </Card>
      ) : null}

      <Card className="space-y-4 p-5 shadow-card">
        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <SearchInput id="q" name="q" placeholder="Search class name…" defaultValue={sp.q ?? ""} />
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
            { key: "name", header: "Name" },
            { key: "school_year", header: "School year" },
            { key: "studentCount", header: "Students" },
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
                      href={`/admin/classes?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), edit: row.id }).toString()}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    {row.is_active ? <ClassDeactivateButton id={row.id} /> : <ClassReactivateButton id={row.id} />}
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
