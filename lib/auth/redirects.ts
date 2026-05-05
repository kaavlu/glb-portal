import type { UserRole } from "@/types/domain";

/** Post-login landing paths per role (spec §4.1). */
export const ROLE_HOME: Record<"admin" | "teacher" | "parent", string> = {
  admin: "/admin/dashboard",
  teacher: "/teacher/attendance",
  parent: "/parent/notifications",
};

/** Alias used by auth helpers and login redirects. */
export function roleRedirectPath(role: UserRole): string {
  return ROLE_HOME[role];
}
