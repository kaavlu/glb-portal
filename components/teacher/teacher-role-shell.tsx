"use client";

import { RoleLayout } from "@/components/shared/role-layout";
import { TEACHER_NAV } from "@/components/teacher/teacher-nav";
import { signOut } from "@/lib/auth/browser";
import type { Profile } from "@/types/domain";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function TeacherRoleShell({
  profile,
  children,
}: {
  profile: Profile;
  children: ReactNode;
}) {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <RoleLayout role="teacher" userName={profile.full_name} tabs={TEACHER_NAV} onLogout={handleLogout}>
      {children}
    </RoleLayout>
  );
}
