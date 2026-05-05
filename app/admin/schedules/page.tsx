import {
  ScheduleCreateForm,
  ScheduleDeactivateButton,
  ScheduleEditForm,
  ScheduleReactivateButton,
} from "@/components/admin/schedule-forms";
import { Card } from "@/components/shared/card";
import { DataTable } from "@/components/shared/data-table";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  listClassSchedules,
  listClassesForSelect,
  listSubjectsForSelect,
  listTeachersForSelect,
} from "@/lib/data/admin";
import Link from "next/link";

export const metadata = {
  title: "Schedules",
};

/** Ensure schedule lists and subject dropdowns always refetch (admin uses service DB client when configured). */
export const dynamic = "force-dynamic";

function formatTime(t: string) {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function AdminSchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const rows = await listClassSchedules(sp.q);

  const teachers = (await listTeachersForSelect()).map((t) => ({ value: t.id, label: t.full_name }));
  const classes = (await listClassesForSelect()).map((c) => ({ value: c.id, label: c.name }));
  const subjects = (await listSubjectsForSelect()).map((s) => ({
    value: s.id,
    label: s.full_name ? `${s.name} — ${s.full_name}` : s.name,
  }));

  const editing = rows.find((r) => r.id === sp.edit);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Class schedules</h1>
          <p className="mt-1 text-sm text-muted">Recurring weekly rows (also shown on the Timetable grid).</p>
        </div>
        <Link href="/admin/timetable" className="text-sm font-medium text-primary hover:underline">
          View weekly timetable
        </Link>
      </div>

      <Card className="space-y-3 p-5 shadow-card">
        <h2 className="text-sm font-semibold text-foreground">Create schedule</h2>
        <ScheduleCreateForm teachers={teachers} classes={classes} subjects={subjects} />
      </Card>

      {editing ? (
        <Card className="space-y-3 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Edit schedule</h2>
            <Link href="/admin/schedules" className="text-xs font-medium text-primary hover:underline">
              Cancel
            </Link>
          </div>
          <ScheduleEditForm row={editing} teachers={teachers} classes={classes} subjects={subjects} />
        </Card>
      ) : null}

      <Card className="space-y-4 p-5 shadow-card">
        <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <SearchInput id="q" name="q" placeholder="Filter schedules…" defaultValue={sp.q ?? ""} />
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
            { key: "class_name", header: "Class" },
            { key: "subject_name", header: "Subject" },
            { key: "teacher_name", header: "Teacher" },
            {
              key: "day_of_week",
              header: "Day",
              render: (r) => DAY_LABEL[(r as { day_of_week: number }).day_of_week] ?? "—",
            },
            {
              key: "period_number",
              header: "Period",
              render: (r) => {
                const pn = (r as { period_number: number | null }).period_number;
                return pn != null ? String(pn) : "—";
              },
            },
            {
              key: "start_time",
              header: "Start",
              render: (r) => formatTime(String((r as { start_time: string }).start_time)),
            },
            {
              key: "end_time",
              header: "End",
              render: (r) => formatTime(String((r as { end_time: string }).end_time)),
            },
            { key: "room", header: "Room" },
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
                      href={`/admin/schedules?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), edit: row.id }).toString()}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    {row.is_active ? <ScheduleDeactivateButton id={row.id} /> : <ScheduleReactivateButton id={row.id} />}
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
