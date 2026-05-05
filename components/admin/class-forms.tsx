"use client";

import {
  createClassAction,
  deactivateClassAction,
  reactivateClassAction,
  updateClassAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/shared/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/shared/input";
import type { ClassListRow } from "@/types/admin";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function ClassCreateForm() {
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      action={(fd) =>
        start(async () => {
          const r = await createClassAction(fd);
          if (r.ok) toast.success("Class created");
          else toast.error(r.error);
        })
      }
    >
      <Input name="name" label="Name" required disabled={pending} />
      <Input name="school_year" label="School year (optional)" disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add class"}
        </Button>
      </div>
    </form>
  );
}

export function ClassEditForm({ row }: { row: ClassListRow }) {
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-3 md:grid-cols-2"
      action={(fd) =>
        start(async () => {
          const r = await updateClassAction(row.id, fd);
          if (r.ok) toast.success("Class updated");
          else toast.error(r.error);
        })
      }
    >
      <Input name="name" label="Name" required defaultValue={row.name} disabled={pending} />
      <Input name="school_year" label="School year" defaultValue={row.school_year ?? ""} disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function ClassDeactivateButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [openConfirm, setOpenConfirm] = useState(false);
  return (
    <>
      <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => setOpenConfirm(true)}>
        Deactivate
      </Button>
      <ConfirmDialog
        open={openConfirm}
        title="Deactivate class?"
        description="This class will be removed from active selections."
        confirmLabel={pending ? "Deactivating…" : "Deactivate"}
        variant="danger"
        onCancel={() => setOpenConfirm(false)}
        onConfirm={() =>
          start(async () => {
            const r = await deactivateClassAction(id);
            if (r.ok) {
              toast.success("Class deactivated");
              setOpenConfirm(false);
            } else toast.error(r.error);
          })
        }
      />
    </>
  );
}

export function ClassReactivateButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await reactivateClassAction(id);
          if (r.ok) toast.success("Class reactivated");
          else toast.error(r.error);
        })
      }
    >
      Reactivate
    </Button>
  );
}
