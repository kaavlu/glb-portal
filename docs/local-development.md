# Local Development

This guide runs the GLB Portal locally with Supabase.

## Prerequisites

- Node.js 20+
- npm 10+
- Supabase project (or local Supabase CLI stack)

## Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public client values.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed in client code.

## Install and Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` (or the next available port shown in terminal).

## Database Setup

Apply SQL migrations in order from `supabase/migrations/`.

If using Supabase CLI:

```bash
supabase db push
```

Seed demo data:

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

Use your project connection string for `SUPABASE_DB_URL`.

## Verification Commands

Run before opening a PR or deploying:

```bash
npm run lint
npm run typecheck
npm run build
```

## Demo Credentials

From the project seed/spec:

- Admin: `admin@gybassi.cz` / `GLBAdmin2026!`
- Teacher: `jana.bielikova@gybassi.cz` / `GLBPortal2026!`
- Parent: `parent@glb.sk` / `GLBParent2026!`

If your local seed differs, use the credentials from your active `supabase/seed.sql`.
