import { Card } from "@/components/shared/card";
import { getAdminDashboardStats, getAdminSeedHealth } from "@/lib/data/admin";
import { BookOpen, GraduationCap, Link2Off, Rows3, School, Users } from "lucide-react";

export const metadata = {
  title: "Admin dashboard",
};

export const dynamic = "force-dynamic";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: typeof Users;
}) {
  return (
    <Card className="flex items-start gap-3 p-4 shadow-card">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        {subtitle ? <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p> : null}
      </div>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const [stats, health] = await Promise.all([getAdminDashboardStats(), getAdminSeedHealth()]);

  const groupSubtitle =
    stats.totalGroups === 1 && stats.primaryGroupName
      ? stats.primaryGroupName
      : stats.totalGroups === 0
        ? "No active group"
        : `${stats.totalGroups} active groups`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Operational overview for the Komunitní skupina — Gymnázium Laury Bassi.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Total Students" value={stats.totalStudents} icon={GraduationCap} />
        <StatCard title="Total Teachers" value={stats.totalTeachers} icon={Users} />
        <StatCard title="Total Subjects" value={stats.totalSubjects} icon={BookOpen} />
        <StatCard title="Groups" value={stats.totalGroups} subtitle={groupSubtitle} icon={School} />
        <StatCard title="Weekly Sessions" value={stats.weeklySessions} icon={Rows3} />
        <StatCard title="Parent Links Missing" value={stats.parentLinksMissing} icon={Link2Off} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Seed data health</h2>
          <p className="mt-1 text-xs text-muted">Admin setup checks (not shown to parents or teachers).</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <dt className="text-muted">Parent data missing</dt>
              <dd className="font-medium text-foreground">{health.parentDataMissing ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <dt className="text-muted">Students without linked parents</dt>
              <dd className="font-medium tabular-nums text-foreground">{health.studentsWithoutLinkedParents}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <dt className="text-muted">FJ1 / JF1 normalized</dt>
              <dd className="font-medium text-foreground">{health.fj1Normalized ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <dt className="text-muted">Tech / ArtTech normalized</dt>
              <dd className="font-medium text-foreground">{health.techNormalized ? "Yes" : "No"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Single group mode</dt>
              <dd className="max-w-[60%] text-right font-medium text-foreground">
                {health.singleGroupMode ?? "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5 shadow-card">
          <h2 className="text-sm font-semibold text-foreground">Quick summaries</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Students by language group</p>
              <ul className="mt-2 space-y-1 text-foreground">
                <li className="flex justify-between">
                  <span className="text-muted">FJ1</span>
                  <span className="tabular-nums font-medium">{stats.studentsByLanguage.fj1}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted">ŠJ1</span>
                  <span className="tabular-nums font-medium">{stats.studentsByLanguage.sj1}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted">NJ1</span>
                  <span className="tabular-nums font-medium">{stats.studentsByLanguage.nj1}</span>
                </li>
                <li className="flex justify-between border-t border-border pt-2">
                  <span className="text-muted">All main classes</span>
                  <span className="tabular-nums font-medium">{stats.studentsByLanguage.allMainClasses}</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Co-taught subjects</p>
              <p className="mt-2 text-foreground">Hum, VaB, AJ</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Split language periods</p>
              <ul className="mt-2 list-inside list-disc text-foreground">
                <li>Thursday Period 5</li>
                <li>Friday Period 1</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
