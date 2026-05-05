import { AppHeader } from "@/components/shared/app-header";
import { buttonClassName } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { PageContainer } from "@/components/shared/page-container";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        trailing={
          <Link href="/login" className={buttonClassName({ variant: "primary", size: "sm" })}>
            Sign in
          </Link>
        }
      />
      <PageContainer className="space-y-10 py-14">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">Gymnázium Laury Bassi</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            School Portal
          </h1>
          <p className="text-base text-muted">
            Central place for attendance, lesson logs, parent visibility, and school administration.
          </p>
        </div>
        <div className="mx-auto grid max-w-content gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Admin</h2>
            <p className="mt-2 text-sm text-muted">Manage teachers, parents, classes, schedules, and reviews.</p>
            <Link
              href="/admin/dashboard"
              className={buttonClassName({ variant: "secondary", size: "sm", className: "mt-4 w-full" })}
            >
              Open admin shell
            </Link>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Teacher</h2>
            <p className="mt-2 text-sm text-muted">Take attendance and record lessons for assigned classes.</p>
            <Link
              href="/teacher/attendance"
              className={buttonClassName({ variant: "secondary", size: "sm", className: "mt-4 w-full" })}
            >
              Open teacher shell
            </Link>
          </Card>
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-foreground">Parent</h2>
            <p className="mt-2 text-sm text-muted">View attendance and notifications for linked students.</p>
            <Link
              href="/parent/notifications"
              className={buttonClassName({ variant: "secondary", size: "sm", className: "mt-4 w-full" })}
            >
              Open parent shell
            </Link>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}
