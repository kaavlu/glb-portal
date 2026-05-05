import { cn } from "@/lib/utils/cn";
import { getInitials } from "@/lib/utils/initials";

export type AvatarInitialsProps = {
  name: string;
  className?: string;
};

export function AvatarInitials({ name, className }: AvatarInitialsProps) {
  const initials = getInitials(name);
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/15",
        className,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
