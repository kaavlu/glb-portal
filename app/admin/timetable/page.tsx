import { WeeklyTimetable } from "@/components/admin/weekly-timetable";
import { Card } from "@/components/shared/card";
import { listClassSchedules } from "@/lib/data/admin";
import Link from "next/link";

export const metadata = {
  title: "Timetable",
};

export const dynamic = "force-dynamic";

export default async function AdminTimetablePage() {
  const rows = await listClassSchedules();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Weekly timetable</h1>
          <p className="mt-1 text-sm text-muted">
            Komunitní skupina — read-only grid. Split language periods show both sessions in one cell.
          </p>
        </div>
        <Link
          href="/admin/schedules"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Edit schedule entries
        </Link>
      </div>

      <Card className="p-5 shadow-card">
        <WeeklyTimetable rows={rows} />
      </Card>
    </div>
  );
}
