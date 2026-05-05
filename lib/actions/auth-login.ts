"use server";

import { roleRedirectPath } from "@/lib/auth/redirects";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/domain";
import { redirect } from "next/navigation";

function isUserRole(value: string): value is UserRole {
  return value === "admin" || value === "teacher" || value === "parent";
}

export type LoginResult = { error: string } | undefined;

/**
 * Signs in with email/password on the server so Supabase session cookies are
 * applied through Next.js (Server Action). Client-only sign-in often leaves
 * server components without a session.
 */
export async function loginWithPasswordAction(data: { email: string; password: string }): Promise<LoginResult> {
  const email = data.email.trim();
  const password = data.password;
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
  if (authError) {
    return { error: authError.message || "Could not sign in" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Could not load session" };
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, initials, phone, is_active, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  const profile = profileRow as Profile | null;

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return { error: "Your account has no profile yet. Contact an administrator." };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return { error: "This account is inactive." };
  }

  if (!isUserRole(profile.role)) {
    await supabase.auth.signOut();
    return { error: "Invalid account role." };
  }

  redirect(roleRedirectPath(profile.role));
}
