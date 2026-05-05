import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

const toneStyles = {
  success: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  warning: "bg-amber-50 text-amber-900 ring-amber-100",
  error: "bg-red-50 text-red-800 ring-red-100",
  neutral: "bg-stone-100 text-stone-700 ring-stone-200",
  info: "bg-sky-50 text-sky-900 ring-sky-100",
} as const;

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof toneStyles;
  children: ReactNode;
};

export function StatusBadge({ tone = "neutral", className, children, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
