"use client";

import { RoleLayout } from "@/components/shared/role-layout";
import { Select } from "@/components/shared/select";
import type { LinkedStudent } from "@/lib/data/parents";
import { PARENT_NAV } from "@/components/parent/parent-nav";
import { signOut } from "@/lib/auth/browser";
import type { Profile } from "@/types/domain";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo } from "react";

export function ParentRoleShell({
  profile,
  linkedStudents,
  children,
}: {
  profile: Profile;
  linkedStudents: LinkedStudent[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const selectedStudentId = searchParams.get("studentId") ?? linkedStudents[0]?.id ?? null;
  const selectedStudent =
    linkedStudents.find((student) => student.id === selectedStudentId) ?? linkedStudents[0] ?? null;

  const tabs = useMemo(
    () =>
      PARENT_NAV.map((tab) => ({
        ...tab,
        href: selectedStudentId ? `${tab.href}?studentId=${selectedStudentId}` : tab.href,
      })),
    [selectedStudentId],
  );

  function handleStudentChange(studentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("studentId", studentId);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <RoleLayout role="parent" userName={profile.full_name} tabs={tabs} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Parent Dashboard</h1>
          {selectedStudent ? (
            <p className="mt-1 text-sm text-muted">
              Student: {selectedStudent.fullName}
              {selectedStudent.className ? ` — Class ${selectedStudent.className}` : ""}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">No linked students found.</p>
          )}
          {linkedStudents.length > 1 ? (
            <div className="mt-4 max-w-md">
              <Select
                label="Linked student"
                name="studentId"
                value={selectedStudent?.id ?? ""}
                onChange={(event) => handleStudentChange(event.target.value)}
                options={linkedStudents.map((student) => ({
                  value: student.id,
                  label: `${student.fullName}${student.className ? ` — Class ${student.className}` : ""}`,
                }))}
              />
            </div>
          ) : null}
        </div>
        {children}
      </div>
    </RoleLayout>
  );
}
