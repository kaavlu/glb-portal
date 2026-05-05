import { format } from "date-fns";

export function formatDisplayDate(
  date: Date | string | number,
  pattern = "MMMM d, yyyy",
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return format(d, pattern);
}

export function formatShortDate(date: Date | string | number): string {
  return formatDisplayDate(date, "MMM d, yyyy");
}

export function formatDateTime(date: Date | string | number): string {
  return formatDisplayDate(date, "MMM d, yyyy HH:mm");
}
