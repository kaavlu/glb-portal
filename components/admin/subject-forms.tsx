"use client";

import {
  createSubjectAction,
  deactivateSubjectAction,
  reactivateSubjectAction,
  updateSubjectAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/shared/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/shared/input";
import { Textarea } from "@/components/shared/textarea";
import type { SubjectListRow } from "@/types/admin";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function SubjectCreateForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
      action={(fd) =>
        start(async () => {
          const r = await createSubjectAction(fd);
          if (r.ok) {
            toast.success("Subject created");
            router.refresh();
          } else toast.error(r.error);
        })
      }
    >
      <Input name="name" label="Abbreviation" required disabled={pending} placeholder="e.g. Hum" />
      <Input name="full_name" label="Full name" disabled={pending} placeholder="e.g. Humanities" />
      <div className="md:col-span-2 lg:col-span-2">
        <Textarea name="notes" label="Notes (optional)" disabled={pending} rows={2} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add subject"}
        </Button>
      </div>
    </form>
  );
}

export function SubjectEditForm({ row }: { row: SubjectListRow }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-4"
      action={(fd) =>
        start(async () => {
          const r = await updateSubjectAction(row.id, fd);
          if (r.ok) {
            toast.success("Subject updated");
            router.refresh();
          } else toast.error(r.error);
        })
      }
    >
      <Input name="name" label="Abbreviation" required defaultValue={row.name} disabled={pending} />
      <Input name="full_name" label="Full name" defaultValue={row.full_name ?? ""} disabled={pending} />
      <div className="md:col-span-2 lg:col-span-2">
        <Textarea name="notes" label="Notes" defaultValue={row.notes ?? ""} disabled={pending} rows={2} />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}

export function SubjectDeactivateButton({ id }: { id: string }) {
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
        title="Deactivate subject?"
        description="Inactive subjects cannot be used in new schedules or assignments."
        confirmLabel={pending ? "Deactivating…" : "Deactivate"}
        variant="danger"
        onCancel={() => setOpenConfirm(false)}
        onConfirm={() =>
          start(async () => {
            const r = await deactivateSubjectAction(id);
            if (r.ok) {
              toast.success("Subject deactivated");
              setOpenConfirm(false);
              router.refresh();
            } else toast.error(r.error);
          })
        }
      />
    </>
  );
}

export function SubjectReactivateButton({ id }: { id: string }) {
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
          const r = await reactivateSubjectAction(id);
          if (r.ok) {
            toast.success("Subject reactivated");
            router.refresh();
          } else toast.error(r.error);
        })
      }
    >
      Reactivate
    </Button>
  );
}
