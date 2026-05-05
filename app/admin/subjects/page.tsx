import {
  SubjectCreateForm,
  SubjectDeactivateButton,
  SubjectEditForm,
  SubjectReactivateButton,
} from "@/components/admin/subject-forms";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { listSubjects } from "@/lib/data/admin";
import Link from "next/link";

export const metadata = {
  title: "Subjects",
};

export const dynamic = "force-dynamic";

export default async function AdminSubjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const rows = await listSubjects(sp.q);
  const editing = rows.find((s) => s.id === sp.edit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Subjects</h1>
        <p className="mt-1 text-sm text-muted">Abbreviations, full titles, assigned teachers, and notes.</p>
      </div>

      <Card className="space-y-3 p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Add subject</h2>
        <SubjectCreateForm />
      </Card>

      {editing ? (
        <Card className="space-y-3 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Edit subject</h2>
            <Link href="/admin/subjects" className="text-xs font-medium text-primary hover:underline">
              Cancel
            </Link>
          </div>
          <SubjectEditForm row={editing} />
        </Card>
      ) : null}

      <Card className="space-y-4 p-5 shadow-card">
        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <SearchInput id="q" name="q" placeholder="Search subject…" defaultValue={sp.q ?? ""} />
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
            { key: "name", header: "Abbreviation" },
            {
              key: "full_name",
              header: "Full name",
              render: (r) => (r as { full_name: string | null }).full_name ?? "—",
            },
            { key: "teachersSummary", header: "Teachers" },
            {
              key: "notes",
              header: "Notes",
              render: (r) => (r as { notes: string | null }).notes ?? "—",
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
                return (
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link
                      href={`/admin/subjects?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), edit: row.id }).toString()}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    {row.is_active ? <SubjectDeactivateButton id={row.id} /> : <SubjectReactivateButton id={row.id} />}
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
