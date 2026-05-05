import { TeacherRoleShell } from "@/components/teacher/teacher-role-shell";
import { requireRole } from "@/lib/auth/require-role";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("teacher");
  return <TeacherRoleShell profile={profile}>{children}</TeacherRoleShell>;
}
