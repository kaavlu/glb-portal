import "server-only";

import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/session";
import type { Profile } from "@/types/domain";
import type { UserRole } from "@/types/domain";

/**
 * Ensures the user is authenticated, active, and has `role`.
 * Redirects to `/login` when unauthenticated or inactive.
 * Redirects to `/unauthorized` when the role does not match.
 */
export async function requireRole(expected: UserRole): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    redirect("/login");
  }

  if (profile.role !== expected) {
    redirect("/unauthorized");
  }

  return profile;
}
