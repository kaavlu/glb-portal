import "server-only";

import { fetchProfileByUserId } from "@/lib/data/profiles";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/domain";
import type { User } from "@supabase/supabase-js";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return fetchProfileByUserId(user.id);
}
