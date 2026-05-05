/** Canonical period times for Komunitní skupina (display + inferring period from schedule start time). */
export const PERIOD_SLOT_TIMES: { period: number; start: string; end: string }[] = [
  { period: 1, start: "08:30", end: "09:15" },
  { period: 2, start: "09:20", end: "10:05" },
  { period: 3, start: "10:20", end: "11:05" },
  { period: 4, start: "11:10", end: "11:55" },
  { period: 5, start: "12:05", end: "12:50" },
  { period: 6, start: "12:55", end: "13:40" },
  { period: 7, start: "13:45", end: "14:30" },
  { period: 8, start: "14:35", end: "15:20" },
  { period: 9, start: "15:25", end: "16:10" },
];

export function trimTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export function inferPeriodFromStartTime(start: string): number | null {
  const t = trimTime(start);
  const slot = PERIOD_SLOT_TIMES.find((p) => p.start === t);
  return slot?.period ?? null;
}
