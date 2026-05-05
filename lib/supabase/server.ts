import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { cookies } from "next/headers";

/**
 * Server Supabase client (cookie session). Use from Server Components / Route Handlers in Phase 2.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* set from Server Component — middleware refresh applies in Phase 2 */
        }
      },
    },
  });
}
