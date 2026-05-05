import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-95 shadow-sm border border-primary/90",
  secondary:
    "bg-card text-foreground border border-border hover:bg-stone-50",
  ghost: "text-foreground hover:bg-black/5 border border-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-red-700",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-5 text-base rounded-lg",
} as const;

export function buttonClassName(options?: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const variant = options?.variant ?? "primary";
  const size = options?.size ?? "md";
  return cn(
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    options?.className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
