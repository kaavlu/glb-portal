import type { ClassScheduleListRow } from "@/types/admin";
import { cn } from "@/lib/utils/cn";
import { inferPeriodFromStartTime, PERIOD_SLOT_TIMES, trimTime } from "@/lib/utils/periods";

const WEEK_ROWS: { dow: number; label: string }[] = [
  { dow: 1, label: "Monday" },
  { dow: 2, label: "Tuesday" },
  { dow: 3, label: "Wednesday" },
  { dow: 4, label: "Thursday" },
  { dow: 5, label: "Friday" },
];

function timetableDisplayTitle(row: ClassScheduleListRow): string {
  if (row.subject_name === "Tech") return "Technology and Informatics / ArtTech";
  return row.subject_full_name ?? row.subject_name;
}

export function WeeklyTimetable({ rows }: { rows: ClassScheduleListRow[] }) {
  const active = rows.filter((r) => r.is_active);
  const grid = new Map<string, ClassScheduleListRow[]>();

  for (const r of active) {
    if (r.day_of_week < 1 || r.day_of_week > 5) continue;
    const p = r.period_number ?? inferPeriodFromStartTime(r.start_time);
    if (!p) continue;
    const key = `${r.day_of_week}-${p}`;
    const list = grid.get(key) ?? [];
    list.push(r);
    grid.set(key, list);
  }

  for (const [, list] of grid) {
    list.sort((a, b) => a.subject_name.localeCompare(b.subject_name));
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
      <table className="w-full min-w-[960px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="w-28 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted">Day</th>
            {PERIOD_SLOT_TIMES.map((slot) => (
              <th key={slot.period} className="min-w-[110px] border-l border-border px-2 py-3 align-bottom">
                <div className="text-xs font-semibold text-foreground">Period {slot.period}</div>
                <div className="mt-0.5 text-[11px] font-normal tabular-nums text-muted">
                  {slot.start}–{slot.end}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WEEK_ROWS.map((day) => (
            <tr key={day.dow} className="border-b border-border last:border-b-0">
              <th className="whitespace-nowrap bg-muted/20 px-3 py-2 text-left text-sm font-medium text-foreground">
                {day.label}
              </th>
              {PERIOD_SLOT_TIMES.map((slot) => {
                const key = `${day.dow}-${slot.period}`;
                const sessions = grid.get(key) ?? [];
                return (
                  <td
                    key={slot.period}
                    className={cn(
                      "align-top border-l border-border px-2 py-2",
                      sessions.length === 0 && "bg-muted/10",
                    )}
                  >
                    {sessions.length === 0 ? (
                      <span className="text-xs text-muted">Free</span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {sessions.map((s) => (
                          <div
                            key={s.id}
                            className="rounded-lg border border-border/80 bg-background/80 px-2 py-1.5 shadow-sm"
                          >
                            <p className="font-semibold leading-tight text-foreground">{s.subject_name}</p>
                            <p className="mt-0.5 text-[11px] leading-snug text-muted">{timetableDisplayTitle(s)}</p>
                            <p className="mt-1 text-xs text-foreground">{s.teacher_name}</p>
                            <p className="mt-0.5 text-[11px] tabular-nums text-muted">
                              {trimTime(s.start_time)}–{trimTime(s.end_time)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
