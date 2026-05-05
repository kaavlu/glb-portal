# Demo Script + Final QA Checklist

Use this script for production-demo readiness checks.

## Demo Flow (Suggested)

1. Login as Admin (`/login`)
2. Open Admin dashboard (`/admin/dashboard`)
3. Show admin CRUD:
   - Teachers
   - Parents
   - Students
   - Classes
   - Subjects
   - Assignments
   - Schedules / Timetable
4. Open Teacher flow:
   - Attendance
   - Lesson Logs
   - Excuse review
5. Open Parent flow:
   - Notifications
   - Attendance summary
   - Submit Excuse
6. Return to Teacher/Admin and review submitted excuse
7. Return to Parent and confirm status/notification changes

## Final QA Checklist

### Auth

- [ ] Login works with valid credentials.
- [ ] Invalid login shows clear error.
- [ ] Role-based redirect is correct:
  - Admin -> `/admin/dashboard`
  - Teacher -> `/teacher/attendance`
  - Parent -> `/parent/notifications`
- [ ] Logout clears session and returns to `/login`.
- [ ] Unauthenticated access to protected routes redirects to `/login`.
- [ ] Wrong-role access redirects to `/unauthorized`.

### Admin CRUD

- [ ] Add/edit/deactivate/reactivate teachers.
- [ ] Add/edit/deactivate/reactivate parents.
- [ ] Add/edit/deactivate/reactivate students.
- [ ] Add/edit/deactivate/reactivate classes.
- [ ] Add/edit/deactivate/reactivate subjects.
- [ ] Create/edit/deactivate/reactivate assignments.
- [ ] Create/edit/deactivate/reactivate schedules.
- [ ] Link/unlink parent-student relations.

### Teacher Attendance

- [ ] Assigned classes appear correctly.
- [ ] Session/date selection works.
- [ ] Roster loads for selected class/session.
- [ ] Attendance state updates (present/absent/late) persist after refresh.
- [ ] Summary counters update correctly.

### Lesson Logs

- [ ] Teacher can create lesson log.
- [ ] Teacher can edit existing log.
- [ ] Duplicate session logs are prevented.
- [ ] Admin can view/edit/delete logs.

### Parent Notifications

- [ ] Parent sees only own notifications.
- [ ] Notifications are newest first.
- [ ] Status/date display is consistent and readable.

### Parent Attendance

- [ ] Parent sees only linked student records.
- [ ] Total absences and unexcused counts are correct.
- [ ] Status badges reflect attendance + excuse state.

### Excuse Workflow

- [ ] Parent can submit excuse for eligible absences only.
- [ ] Duplicate excuse submission is blocked.
- [ ] Teacher/Admin can approve/reject pending excuses.
- [ ] Parent receives notification after review.

### Security / RLS

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only used in server code.
- [ ] No client component imports server admin Supabase client.
- [ ] Teacher cannot access unrelated classes/students.
- [ ] Parent cannot access unrelated students.
- [ ] Non-admin cannot manage admin data.

## Pre-Release Commands

```bash
npm run lint
npm run typecheck
npm run build
```
