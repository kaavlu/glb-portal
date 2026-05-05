import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

export type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50/50 px-6 py-10 text-center">
      <AlertTriangle className="h-9 w-9 text-red-600" aria-hidden />
      <div className="space-y-1">
        <p className="text-base font-semibold text-red-900">{title}</p>
        <p className="max-w-md text-sm text-red-800/90">{message}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {onRetry ? (
          <Button type="button" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
