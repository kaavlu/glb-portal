# GLB Portal Cursor Instructions

You are building the Gymnázium Laury Bassi School Portal inside this repository.

Primary source of truth:
- docs/project-spec.md

Tech stack:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase RLS
- Vercel deployment

Product roles:
- Admin
- Teacher
- Parent

Rules:
- Keep all UI text in English.
- Do not add Czech/Slovak localization yet.
- Do not expose SUPABASE_SERVICE_ROLE_KEY to client-side code.
- Prefer server-only code for privileged Supabase operations.
- Use soft delete with is_active=false where applicable.
- Implement one phase at a time.
- After every phase, run lint/typecheck/build and fix issues.
- Do not invent features outside docs/project-spec.md.
- If the spec is ambiguous, make the simplest reasonable MVP decision and document it in docs/implementation-notes.md.

Architecture:
- app/ for routes
- components/ for UI
- lib/supabase/ for Supabase clients
- lib/auth/ for auth guards
- lib/data/ for data access functions
- types/ for domain/database types
- supabase/migrations/ for schema/RLS
- supabase/seed.sql for demo data