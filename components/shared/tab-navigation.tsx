"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type TabItem = { href: string; label: string };

export type TabNavigationProps = {
  items: TabItem[];
  className?: string;
};

export function TabNavigation({ items, className }: TabNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex flex-wrap gap-2 border-b border-border pb-2",
        className,
      )}
      aria-label="Section navigation"
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted hover:bg-white hover:text-foreground ring-1 ring-transparent hover:ring-border",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
