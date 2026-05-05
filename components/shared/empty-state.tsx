import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      {Icon ? <Icon className="h-10 w-10 text-muted" strokeWidth={1.5} aria-hidden /> : null}
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        {description ? <p className="max-w-md text-sm text-muted">{description}</p> : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
