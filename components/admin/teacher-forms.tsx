"use client";

import {
  createTeacherAction,
  deactivateTeacherAction,
  reactivateTeacherAction,
  updateTeacherAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/shared/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/shared/input";
import type { TeacherListRow } from "@/types/admin";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function TeacherCreateForm() {
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
      action={(fd) =>
        start(async () => {
          const r = await createTeacherAction(fd);
          if (r.ok) toast.success("Teacher created");
          else toast.error(r.error);
        })
      }
    >
      <Input name="full_name" label="Full name" required autoComplete="name" disabled={pending} />
      <Input name="email" label="Email" type="email" required autoComplete="email" disabled={pending} />
      <Input name="password" label="Password" type="password" required autoComplete="new-password" disabled={pending} />
      <Input name="initials" label="Initials (optional)" maxLength={6} disabled={pending} />
      <Input name="phone" label="Phone (optional)" type="tel" disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          {pending ? "Saving…" : "Add teacher"}
        </Button>
      </div>
    </form>
  );
}

export function TeacherEditForm({ teacher }: { teacher: TeacherListRow }) {
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
      action={(fd) =>
        start(async () => {
          const r = await updateTeacherAction(teacher.id, fd);
          if (r.ok) toast.success("Teacher updated");
          else toast.error(r.error);
        })
      }
    >
      <Input
        name="full_name"
        label="Full name"
        required
        defaultValue={teacher.full_name}
        disabled={pending}
      />
      <Input name="email" label="Email" type="email" required defaultValue={teacher.email} disabled={pending} />
      <Input name="initials" label="Initials" maxLength={6} defaultValue={teacher.initials ?? ""} disabled={pending} />
      <Input name="phone" label="Phone" type="tel" defaultValue={teacher.phone ?? ""} disabled={pending} />
      <div className="flex items-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function TeacherDeactivateButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [openConfirm, setOpenConfirm] = useState(false);
  return (
    <>
      <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => setOpenConfirm(true)}>
        Deactivate
      </Button>
      <ConfirmDialog
        open={openConfirm}
        title="Deactivate teacher?"
        description="The teacher will lose access until reactivated."
        confirmLabel={pending ? "Deactivating…" : "Deactivate"}
        variant="danger"
        onCancel={() => setOpenConfirm(false)}
        onConfirm={() =>
          start(async () => {
            const r = await deactivateTeacherAction(id);
            if (r.ok) {
              toast.success("Teacher deactivated");
              setOpenConfirm(false);
            } else toast.error(r.error);
          })
        }
      />
    </>
  );
}

export function TeacherReactivateButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await reactivateTeacherAction(id);
          if (r.ok) toast.success("Teacher reactivated");
          else toast.error(r.error);
        })
      }
    >
      Reactivate
    </Button>
  );
}
