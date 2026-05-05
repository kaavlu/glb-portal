import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export function PageContainer({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={cn("mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8", className)} {...props}>
      {children}
    </div>
  );
}
