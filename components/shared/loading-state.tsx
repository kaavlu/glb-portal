import { Loader2 } from "lucide-react";

export type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-12 text-muted"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}
