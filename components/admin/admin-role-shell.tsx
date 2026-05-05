"use client";

import { ADMIN_NAV } from "@/components/admin/admin-nav";
import { RoleLayout } from "@/components/shared/role-layout";
import { signOut } from "@/lib/auth/browser";
import type { Profile } from "@/types/domain";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function AdminRoleShell({
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
    <RoleLayout role="admin" userName={profile.full_name} tabs={ADMIN_NAV} onLogout={handleLogout}>
      {children}
    </RoleLayout>
  );
}
