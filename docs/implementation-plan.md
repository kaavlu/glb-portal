# GLB Portal — Implementation Plan

Maps [docs/project-spec.md](./project-spec.md) into execution phases. Follow [agents.md](../agents.md): one phase at a time; after each phase run lint, typecheck, and build; document MVP ambiguity in `docs/implementation-notes.md` only when needed.

**Current repo state:** Documentation only — no application scaffold yet. Phase 1 creates the Next.js project from scratch.

---

## Phase 1 — Project setup

**Goal:** Runnable Next.js shell, Tailwind, env wiring, shared UI primitives, no business data yet.

| Area | Files to create / edit |
|------|-------------------------|
| Tooling | `package.json`, `tsconfig.json`, `next.config.ts` (or `.js`), `postcss.config.mjs`, `tailwind.config.ts`, `eslint.config.mjs` (or `.eslintrc`), `.gitignore`, `.env.example` |
| App shell | `app/layout.tsx`, `app/page.tsx` (minimal landing or redirect stub), `app/globals.css` |
| Supabase stubs | `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts` (service role — **server-only**, unused until Phase 2) |
| Shared UI | Under `components/shared/`: `app-header.tsx`, `page-container.tsx`, `card.tsx`, `button.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `status-badge.tsx`, `avatar-initials.tsx`, `empty-state.tsx`, `loading-state.tsx`, `error-state.tsx`, `confirm-dialog.tsx`, `data-table.tsx`, `search-input.tsx`, `tab-navigation.tsx` |
| Layout primitives | `components/role-layout.tsx` (or per-role later); optional `components/shared/` re-exports |
| Utils | `lib/utils/dates.ts`, `lib/utils/statuses.ts`, `lib/utils/initials.ts` |
| Types (stubs) | `types/domain.ts`, `types/database.ts` (minimal until schema exists) |

**Main components / functions**

- Root layout: warm off-white background, centered max-width, English copy only.
- Design tokens: deep green primary, white cards, muted secondary text (per spec §6).
- Supabase clients: browser client, server client (cookies), admin client gated with `server-only` import where applicable.

**Acceptance checks**

- `pnpm dev` / `npm run dev` serves the app without errors.
- Tailwind styles apply; shared primitives render on a smoke page or Story-less dev route if added temporarily (optional).
- `.env.example` lists `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (no real secrets in git).

**Commands to run**

```bash
npm install
npm run lint
npm run build
```

*(Adjust for pnpm/yarn if chosen in scaffold.)*

---

## Phase 2 — Database + auth

**Goal:** Schema, RLS, helpers, seed users, login/logout, role redirects, route protection.

| Area | Files to create / edit |
|------|-------------------------|
| Migrations | `supabase/migrations/<timestamp>_init.sql` — tables: `profiles`, `classes`, `students`, `parent_students`, `subjects`, `teacher_assignments`, `class_schedules`, `class_sessions`, `attendance_records`, `lesson_logs`, `excuse_requests`, `notifications`; `current_user_role()`, `is_admin()`; RLS enabled + policies per spec §10 |
| Seed | `supabase/seed.sql` — demo users (§16); note Auth users must exist (seed documents SQL + Dashboard steps or script using service role server-side only) |
| Auth trigger | Migration or note: `profiles` row on `auth.users` insert (or post-signup hook) — document MVP choice in `implementation-notes.md` if using invite-only manual creation |
| Types | `types/database.ts` — row types / enums aligned with schema |
| Supabase | Finalize `lib/supabase/*`; ensure admin client never imported by Client Components |
| Auth lib | `lib/auth/require-auth.ts`, `lib/auth/require-role.ts`, `lib/auth/redirects.ts` |
| Data (minimal) | `lib/data/profiles.ts` — `getCurrentProfile()`, helpers used by middleware/layout |
| Routes | `app/login/page.tsx`, `app/forgot-password/page.tsx`, `app/unauthorized/page.tsx` |
| Middleware | `middleware.ts` — session refresh + coarse protection (or layout-only guards per Next pattern; document choice) |
| Placeholder layouts | Thin `app/admin/layout.tsx`, `app/teacher/layout.tsx`, `app/parent/layout.tsx` redirecting or showing “Coming next phase” only if needed to validate guards |

**Main components / functions**

- `signIn`, `signOut`, `getCurrentUser`, `getCurrentProfile`, `requireAuth`, `requireRole` (spec §14.1).
- Login: email, password, forgot password link, redirect: admin → `/admin/dashboard`, teacher → `/teacher/attendance`, parent → `/parent/notifications`.
- Logout clears session → `/login`.

**Acceptance checks**

- Demo admin / teacher / parent (§16) can sign in; wrong credentials fail gracefully.
- Unauthenticated access to `/admin/*`, `/teacher/*`, `/parent/*` → `/login`.
- Wrong role → `/unauthorized`.
- RLS: smoke-test with anon key that cross-role reads fail (manual SQL or minimal integration test optional).

**Commands to run**

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Apply migrations locally via Supabase CLI or Dashboard; document chosen workflow in `implementation-notes.md` if not scripted.

---

## Phase 3 — Admin portal

**Goal:** Full admin CRUD UI for core entities, dashboard metrics, no teacher/parent feature parity required beyond admin visibility lists where specified.

| Area | Files to create / edit |
|------|-------------------------|
| Layout / nav | `app/admin/layout.tsx`, `components/admin/admin-nav.tsx`, reuse `AppHeader`, `TabNavigation` |
| Pages | `app/admin/dashboard/page.tsx`, `teachers`, `parents`, `students`, `classes`, `subjects`, `schedules`, `assignments`, `attendance`, `lessons`, `excuses` |
| Admin components | `admin-dashboard-cards.tsx`, `teacher-form.tsx`, `parent-form.tsx`, `student-form.tsx`, `class-form.tsx`, `subject-form.tsx`, `schedule-form.tsx`, `assignment-form.tsx`, `excuse-review-table.tsx` |
| Data layer | `lib/data/admin.ts`, `profiles.ts`, `teachers.ts`, `parents.ts`, `students.ts`, `classes.ts`, `subjects.ts`, `schedules.ts`, `assignments.ts`, `sessions.ts` (read for filters), `attendance.ts`, `lessons.ts`, `excuses.ts`, `notifications.ts` — implement admin-facing list/create/update/deactivate + link/unlink |

**Main components / functions**

- Spec §14.2: dashboard stats, CRUD + soft deactivate for teachers, parents, students, classes, subjects, schedules, assignments; `linkParentToStudent` / `unlinkParentFromStudent`.
- Teacher/parent **creation**: server-only route handlers or server actions using service role for Auth user creation; never expose service key (spec §11.3).

**Acceptance checks**

- Admin dashboard cards: totals, today’s sessions, pending excuses, lesson logs today, absences today; recent lists (§11.2).
- Each admin route supports search/filter where specified; tables show required columns.
- All mutations respect `is_active` soft delete.

**Commands to run**

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

## Phase 4 — Teacher attendance

**Goal:** Today’s attendance flow: assignments, session selection, roster, initialize records, persist statuses.

| Area | Files to create / edit |
|------|-------------------------|
| Layout / nav | `app/teacher/layout.tsx`, `components/teacher/teacher-nav.tsx` |
| Page | `app/teacher/attendance/page.tsx` |
| Components | `attendance-summary.tsx`, `student-attendance-row.tsx` |
| Data | `lib/data/teachers.ts`, `lib/data/sessions.ts`, `lib/data/attendance.ts` — `getTeacherAssignments`, `getTodaySessionsForTeacher` (or `getTeacherSchedulesForDate`), `getOrCreateClassSession`, `initializeAttendanceRecords`, `getAttendanceRecords`, `updateAttendanceRecord` |

**Main components / functions**

- Class + session selectors; summary counts (total / present / absent / late).
- Status toggles: present (green), absent (red), late (yellow) per spec §12.2.

**Acceptance checks**

- Teacher sees only assigned classes/sessions.
- First load creates `class_sessions` + `attendance_records` as needed; refresh retains data.
- Optional: marking absent triggers notification logic — **defer to Phase 7** if excuses/notifications are centralized there; otherwise stub and document.

**Commands to run**

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

## Phase 5 — Teacher lesson logs

**Goal:** Select session for date, load/upsert single `lesson_logs` row per session.

| Area | Files to create / edit |
|------|-------------------------|
| Page | `app/teacher/lessons/page.tsx` |
| Components | `lesson-log-form.tsx` |
| Data | `lib/data/lessons.ts` — `getLessonLog`, `upsertLessonLog`, `getTeacherLessonSessions` |

**Acceptance checks**

- One log per session; update shows existing topic/content/homework.
- Teacher only sees own assigned sessions.

**Commands to run**

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

## Phase 6 — Parent portal

**Goal:** Notifications feed + attendance history + summary math + parent display status (§9.1).

| Area | Files to create / edit |
|------|-------------------------|
| Layout / nav | `app/parent/layout.tsx`, `components/parent/parent-nav.tsx` |
| Pages | `app/parent/notifications/page.tsx`, `app/parent/attendance/page.tsx` |
| Components | `notification-list.tsx`, `notification-row.tsx`, `attendance-summary-cards.tsx`, `attendance-record-list.tsx` |
| Data | `lib/data/parents.ts`, `lib/data/notifications.ts`, `lib/data/attendance.ts` (parent-scoped joins) — `getLinkedStudents`, `getParentNotifications`, `getStudentAttendanceForParent`, `getAbsenceSummaryForParent` |

**Main components / functions**

- Multi-student selector; dashboard heading with student + class (§13.1).
- `getParentDisplayStatus` in `lib/utils/statuses.ts` (or dedicated helper).

**Acceptance checks**

- Parent sees only linked students’ data; notifications newest first; optional mark-as-read.
- Absence / unexcused counts match §9.2 rules.

**Commands to run**

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

## Phase 7 — Excuse workflow

**Goal:** Parent submit excuse; teacher/admin review; notifications on submit/review and on absent (§15).

| Area | Files to create / edit |
|------|-------------------------|
| Parent page | `app/parent/submit-excuse/page.tsx`, `components/parent/submit-excuse-form.tsx` |
| Teacher page | `app/teacher/excuses/page.tsx`, `components/teacher/excuse-review-list.tsx` |
| Admin | Wire `/admin/excuses` actions if not completed in Phase 3 |
| Data | `lib/data/excuses.ts` — `getExcusableAbsences`, `submitExcuse`, `getExcusesForTeacher`, `reviewExcuse`; admin variants |
| Notifications | Insert rows on: absent recorded (dedupe per §15.1), excuse submitted, approved, rejected |

**Acceptance checks**

- Submit: only absent, linked student, no duplicate pending/approved excuse for same record.
- Teacher sees excuses only for assigned classes; admin sees all.
- Approve/reject sets `reviewed_by`, `reviewed_at`, notifies parent.

**Commands to run**

```bash
npm run lint
npx tsc --noEmit
npm run build
```

---

## Phase 8 — Polish + deployment

**Goal:** Production-ready UX, responsiveness, E2E demo path, Vercel.

| Area | Files to create / edit |
|------|-------------------------|
| UX | Consistent loading/empty/error states on all major pages; `ConfirmDialog` for destructive actions |
| A11y / mobile | Touch targets, responsive tables (horizontal scroll or card fallback) |
| SEO / meta | Root metadata in `app/layout.tsx` |
| Deploy | `vercel.json` only if needed; README deploy section optional (user-requested docs only) |
| Env | Vercel project env vars matching §18 |

**Acceptance checks**

- Full demo path on production: login as each role → admin seed data intact → teacher attendance + lesson → parent views + excuse → reviewer approves.
- No `SUPABASE_SERVICE_ROLE_KEY` in client bundle (verify build output / Next analyzer or grep).

**Commands to run**

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Plus Vercel deploy (CLI or dashboard) after linking the project.

---

## Dependency notes (cross-phase)

| Topic | Recommendation |
|-------|----------------|
| Forms | `react-hook-form` + `zod` (spec §1.4) |
| Dates | `date-fns` or `Intl.DateTimeFormat` |
| Toasts | `sonner` or shadcn toast |
| Icons | `lucide-react` |
| Duplicate notification on absent | Implement in Phase 7 or when absent marking lands — align with §15.1 |

---

## Phase summary checklist

| # | Phase | Blocks |
|---|--------|--------|
| 1 | Project setup | — |
| 2 | Database + auth | 1 |
| 3 | Admin portal | 2 |
| 4 | Teacher attendance | 2–3 (reference data) |
| 5 | Teacher lesson logs | 4 (sessions) |
| 6 | Parent portal | 2–4 (attendance data) |
| 7 | Excuse workflow | 4–6 |
| 8 | Polish + deployment | 1–7 |
