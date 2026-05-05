import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes, ReactNode } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  /** Rendered inside the field on the right (e.g. password visibility toggle). */
  suffix?: ReactNode;
};

export function Input({ id, label, error, className, suffix, ...props }: InputProps) {
  const inputId = id ?? props.name;
  return (
    <div className="w-full space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground shadow-sm placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50",
            suffix && "pr-10",
            error && "border-red-500 focus-visible:outline-red-500",
            className,
          )}
          {...props}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-1 top-1/2 flex -translate-y-1/2 items-center [&_button]:pointer-events-auto">
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
