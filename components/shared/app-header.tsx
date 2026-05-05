import { AvatarInitials } from "@/components/shared/avatar-initials";
import { Button } from "@/components/shared/button";
import { PageContainer } from "@/components/shared/page-container";
import { GraduationCap, LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type AppHeaderProps = {
  userName?: string;
  roleLabel?: string;
  showAuthSection?: boolean;
  onLogout?: () => void;
  /** Extra right-side actions (e.g. Sign in on public pages) */
  trailing?: ReactNode;
};

export function AppHeader({
  userName,
  roleLabel,
  showAuthSection = false,
  onLogout,
  trailing,
}: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <PageContainer className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <GraduationCap className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <Link href="/" className="block hover:opacity-90">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Gymnázium Laury Bassi
              </span>
            </Link>
            <p className="text-sm text-muted">School Portal</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {trailing}
          {showAuthSection && userName && roleLabel ? (
            <>
              <div className="hidden h-8 w-px bg-border sm:block" aria-hidden />
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                  <p className="text-xs text-muted">{roleLabel}</p>
                </div>
                <AvatarInitials name={userName} />
                {onLogout ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    Log out
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </PageContainer>
    </header>
  );
}
