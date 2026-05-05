import { cn } from "@/lib/utils/cn";
import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ id, label, error, className, ...props }: TextareaProps) {
  const areaId = id ?? props.name;
  return (
    <div className="w-full space-y-1.5">
      {label ? (
        <label htmlFor={areaId} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <textarea
        id={areaId}
        className={cn(
          "min-h-[96px] w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:outline-red-500",
          className,
        )}
        {...props}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
