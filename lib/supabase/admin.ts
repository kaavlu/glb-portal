import "server-only";

import type { Database } from "@/types/database";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — server-only. Do not import from Client Components.
 * Used in Phase 2+ for privileged operations (never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
