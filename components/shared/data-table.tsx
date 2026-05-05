import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
};

export type DataTableProps<T extends Record<string, unknown>> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  empty?: ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowKey,
  empty,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted">
        {empty ?? "No rows to display."}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-stone-50/80 text-xs font-semibold uppercase tracking-wide text-muted">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn("px-4 py-3", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="hover:bg-stone-50/60">
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-foreground", col.className)}>
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
