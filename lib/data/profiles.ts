import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/domain";

/** Loads a single profile row by Supabase Auth user id. */
export async function fetchProfileByUserId(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error || !data) return null;

  return data as Profile;
}
