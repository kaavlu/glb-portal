# Implementation notes (GLB Portal)

## Phase 2 — Database + Auth

- **Demo auth in `supabase/seed.sql`:** The seed inserts into `auth.users` and `auth.identities` with fixed UUIDs so `public.profiles` can reference the same ids. If a host rejects direct `auth` inserts, create the three users in the Supabase Auth UI and then insert/upsert matching `profiles` rows (or re-run only the `public` section of the seed with ids that match the created `auth.users` rows).
- **RLS + teacher → parent profile reads:** An extra `profiles` select policy allows teachers to read `parent` profiles that are linked to students in the teacher’s assigned classes, so policies that reference parent recipients (e.g. `notifications` insert for teachers) can be evaluated under RLS.
- **Supabase project health:** MCP `execute_sql` / `list_migrations` / `generate_typescript_types` require the hosted project to be **active** (not paused). If calls time out or return “Project must be active and healthy”, open the Supabase dashboard and **restore / unpause** the project, then re-run migrations or `generate_typescript_types`.
- **RLS helper functions + policy cycles (May 2026):** `current_user_role()` / `is_admin()` must restore `row_security` after reading `profiles`; otherwise teacher queries can appear empty because policy evaluation fails. Also avoid parent `subjects`/`class_sessions` policies that recurse through `attendance_records` + `class_sessions` joins.

## Phase 3 — Admin portal

- **Creating teachers/parents from the UI** uses `SUPABASE_SERVICE_ROLE_KEY` on the server (`auth.admin.createUser` + `profiles` insert). Without the service role env var, “Add teacher/parent” returns an error; create users in Supabase Auth first and insert matching `profiles` rows (same approach as Phase 2 seed notes).
- **Supabase client typing:** `@supabase/ssr`’s `createServerClient` return type does not align with our generated `Database` schema generics (extra schema type parameter). `lib/data/admin.ts` wraps the server client as `SupabaseClient<Database>` via `as unknown as` so queries/inserts type-check against `types/database.ts`.
