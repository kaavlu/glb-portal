# Deployment (Vercel + Supabase)

This document describes production-demo deployment for GLB Portal.

## 1) Required Vercel Environment Variables

Set these in Vercel Project Settings -> Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Rules:

- `NEXT_PUBLIC_*` values are safe for browser exposure.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be used in client components.

## 2) Deploy Application

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

Push to your deployment branch (for example `main`) and deploy through Vercel.

## 3) Supabase Migration Instructions

Before first deployment, apply all migrations from `supabase/migrations/`.

With Supabase CLI:

```bash
supabase db push
```

Or execute migration SQL files manually in order in Supabase SQL Editor.

## 4) Seed Instructions

Seed demo data after migrations:

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

Use your target environment database connection string.

## 5) Demo User Credentials

Spec-defined demo accounts:

- Admin: `admin@gybassi.cz` / `GLBAdmin2026!`
- Teacher: `jana.bielikova@gybassi.cz` / `GLBPortal2026!`
- Parent: `parent@glb.sk` / `GLBParent2026!`

If you changed seed data, update this section and `docs/demo-script.md`.

## 6) Known Limitations (MVP)

- Admin create-teacher/create-parent requires `SUPABASE_SERVICE_ROLE_KEY`.
- There is no i18n yet (English-only UI by spec).
- CSV export/reporting is not implemented.
- No background jobs/cron for reminders yet.
- Authentication hardening beyond MVP (MFA/session management UI) is not implemented.

## 7) Post-Deploy Smoke Test

- Login works for all three roles.
- Role redirects are correct.
- Admin CRUD pages load and save.
- Teacher attendance and lesson logs persist.
- Parent notifications and attendance render correctly.
- Excuse submit/review flow sends updates to parent views.
