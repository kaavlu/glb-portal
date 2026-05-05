import { ParentRoleShell } from "@/components/parent/parent-role-shell";
import { requireRole } from "@/lib/auth/require-role";
import { getLinkedStudents } from "@/lib/data/parents";
import type { ReactNode } from "react";

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("parent");
  const linkedStudents = await getLinkedStudents(profile.id);
  return (
    <ParentRoleShell profile={profile} linkedStudents={linkedStudents}>
      {children}
    </ParentRoleShell>
  );
}
