"use client";

import {
  createTeacherAssignmentAction,
  deactivateTeacherAssignmentAction,
  reactivateTeacherAssignmentAction,
  updateTeacherAssignmentAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/shared/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Select, type SelectOption } from "@/components/shared/select";
import type { TeacherAssignmentListRow } from "@/types/admin";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function AssignmentCreateForm({
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
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
      action={(fd) =>
        start(async () => {
          const r = await createTeacherAssignmentAction(fd);
          if (r.ok) {
            toast.success("Assignment created");
            router.refresh();
          } else toast.error(r.error);
        })
      }
    >
      <Select name="teacher_id" label="Teacher" options={teachers} placeholder="Teacher" required disabled={pending} />
      <Select name="class_id" label="Class" options={classes} placeholder="Class" required disabled={pending} />
      <Select name="subject_id" label="Subject" options={subjects} placeholder="Subject" required disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          {pending ? "Saving…" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export function AssignmentEditForm({
  row,
  teachers,
  classes,
  subjects,
}: {
  row: TeacherAssignmentListRow;
  teachers: SelectOption[];
  classes: SelectOption[];
  subjects: SelectOption[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
      action={(fd) =>
        start(async () => {
          const r = await updateTeacherAssignmentAction(row.id, fd);
          if (r.ok) {
            toast.success("Assignment updated");
            router.refresh();
          } else toast.error(r.error);
        })
      }
    >
      <Select
        name="teacher_id"
        label="Teacher"
        options={teachers}
        defaultValue={row.teacher_id}
        required
        disabled={pending}
      />
      <Select name="class_id" label="Class" options={classes} defaultValue={row.class_id} required disabled={pending} />
      <Select
        name="subject_id"
        label="Subject"
        options={subjects}
        defaultValue={row.subject_id}
        required
        disabled={pending}
      />
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function AssignmentDeactivateButton({ id }: { id: string }) {
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
        title="Deactivate assignment?"
        description="The teacher will lose access to this class-subject assignment."
        confirmLabel={pending ? "Deactivating…" : "Deactivate"}
        variant="danger"
        onCancel={() => setOpenConfirm(false)}
        onConfirm={() =>
          start(async () => {
            const r = await deactivateTeacherAssignmentAction(id);
            if (r.ok) {
              toast.success("Assignment deactivated");
              setOpenConfirm(false);
              router.refresh();
            } else toast.error(r.error);
          })
        }
      />
    </>
  );
}

export function AssignmentReactivateButton({ id }: { id: string }) {
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
          const r = await reactivateTeacherAssignmentAction(id);
          if (r.ok) {
            toast.success("Assignment reactivated");
            router.refresh();
          } else toast.error(r.error);
        })
      }
    >
      Reactivate
    </Button>
  );
}
