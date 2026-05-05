"use client";

import {
  createClassScheduleAction,
  deactivateClassScheduleAction,
  reactivateClassScheduleAction,
  updateClassScheduleAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/shared/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/shared/input";
import { Select, type SelectOption } from "@/components/shared/select";
import type { ClassScheduleListRow } from "@/types/admin";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export const DAY_OPTIONS: SelectOption[] = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export const PERIOD_OPTIONS: SelectOption[] = [
  { value: "", label: "Infer from time" },
  ...Array.from({ length: 9 }, (_, i) => ({
    value: String(i + 1),
    label: `Period ${i + 1}`,
  })),
];

function trimTime(t: string) {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export function ScheduleCreateForm({
  teachers,
  classes,
  subjects,
}: {
  teachers: SelectOption[];
  classes: SelectOption[];
  subjects: SelectOption[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
      action={(fd) =>
        start(async () => {
          const r = await createClassScheduleAction(fd);
          if (r.ok) {
            toast.success("Schedule created");
            router.refresh();
          } else toast.error(r.error);
        })
      }
    >
      <Select name="class_id" label="Class" options={classes} placeholder="Class" required disabled={pending} />
      <Select name="subject_id" label="Subject" options={subjects} placeholder="Subject" required disabled={pending} />
      <Select name="teacher_id" label="Teacher" options={teachers} placeholder="Teacher" required disabled={pending} />
      <Select name="day_of_week" label="Day" options={DAY_OPTIONS} defaultValue="1" disabled={pending} />
      <Select name="period_number" label="Period" options={PERIOD_OPTIONS} disabled={pending} />
      <Input name="start_time" label="Start time" type="time" required disabled={pending} />
      <Input name="end_time" label="End time" type="time" required disabled={pending} />
      <Input name="room" label="Room (optional)" disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          {pending ? "Saving…" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export function ScheduleEditForm({
  row,
  teachers,
  classes,
  subjects,
}: {
  row: ClassScheduleListRow;
  teachers: SelectOption[];
  classes: SelectOption[];
  subjects: SelectOption[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
      action={(fd) =>
        start(async () => {
          const r = await updateClassScheduleAction(row.id, fd);
          if (r.ok) {
            toast.success("Schedule updated");
            router.refresh();
          } else toast.error(r.error);
        })
      }
    >
      <Select name="class_id" label="Class" options={classes} defaultValue={row.class_id} required disabled={pending} />
      <Select name="subject_id" label="Subject" options={subjects} defaultValue={row.subject_id} required disabled={pending} />
      <Select name="teacher_id" label="Teacher" options={teachers} defaultValue={row.teacher_id} required disabled={pending} />
      <Select
        name="day_of_week"
        label="Day"
        options={DAY_OPTIONS}
        defaultValue={String(row.day_of_week)}
        disabled={pending}
      />
      <Select
        name="period_number"
        label="Period"
        options={PERIOD_OPTIONS}
        defaultValue={row.period_number != null ? String(row.period_number) : ""}
        disabled={pending}
      />
      <Input
        name="start_time"
        label="Start time"
        type="time"
        required
        defaultValue={trimTime(row.start_time)}
        disabled={pending}
      />
      <Input name="end_time" label="End time" type="time" required defaultValue={trimTime(row.end_time)} disabled={pending} />
      <Input name="room" label="Room" defaultValue={row.room ?? ""} disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function ScheduleDeactivateButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [openConfirm, setOpenConfirm] = useState(false);
  return (
    <>
      <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => setOpenConfirm(true)}>
        Deactivate
      </Button>
      <ConfirmDialog
        open={openConfirm}
        title="Deactivate schedule?"
        description="This recurring timetable slot will stop being used for future sessions."
        confirmLabel={pending ? "Deactivating…" : "Deactivate"}
        variant="danger"
        onCancel={() => setOpenConfirm(false)}
        onConfirm={() =>
          start(async () => {
            const r = await deactivateClassScheduleAction(id);
            if (r.ok) {
              toast.success("Schedule deactivated");
              setOpenConfirm(false);
              router.refresh();
            } else toast.error(r.error);
          })
        }
      />
    </>
  );
}

export function ScheduleReactivateButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await reactivateClassScheduleAction(id);
          if (r.ok) {
            toast.success("Schedule reactivated");
            router.refresh();
          } else toast.error(r.error);
        })
      }
    >
      Reactivate
    </Button>
  );
}
