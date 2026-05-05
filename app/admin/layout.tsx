import { AdminRoleShell } from "@/components/admin/admin-role-shell";
import { requireRole } from "@/lib/auth/require-role";
import type { ReactNode } from "react";

/** Admin lists and selects must reflect writes immediately; avoid stale RSC caches. */
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole("admin");
  return <AdminRoleShell profile={profile}>{children}</AdminRoleShell>;
}
