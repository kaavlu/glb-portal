"use client";

import {
  createParentAction,
  deactivateParentAction,
  linkParentStudentAction,
  reactivateParentAction,
  unlinkParentStudentAction,
  updateParentAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/shared/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/shared/input";
import { Select, type SelectOption } from "@/components/shared/select";
import type { ParentListRow } from "@/types/admin";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function ParentCreateForm() {
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
      action={(fd) =>
        start(async () => {
          const r = await createParentAction(fd);
          if (r.ok) toast.success("Parent created");
          else toast.error(r.error);
        })
      }
    >
      <Input name="full_name" label="Full name" required disabled={pending} />
      <Input name="email" label="Email" type="email" required disabled={pending} />
      <Input name="password" label="Password" type="password" required disabled={pending} />
      <Input name="initials" label="Initials (optional)" maxLength={6} disabled={pending} />
      <Input name="phone" label="Phone (optional)" type="tel" disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          {pending ? "Saving…" : "Add parent"}
        </Button>
      </div>
    </form>
  );
}

export function ParentEditForm({ parent }: { parent: ParentListRow }) {
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
      action={(fd) =>
        start(async () => {
          const r = await updateParentAction(parent.id, fd);
          if (r.ok) toast.success("Parent updated");
          else toast.error(r.error);
        })
      }
    >
      <Input name="full_name" label="Full name" required defaultValue={parent.full_name} disabled={pending} />
      <Input name="email" label="Email" type="email" required defaultValue={parent.email} disabled={pending} />
      <Input name="initials" label="Initials" maxLength={6} defaultValue={parent.initials ?? ""} disabled={pending} />
      <Input name="phone" label="Phone" type="tel" defaultValue={parent.phone ?? ""} disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function ParentDeactivateButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [openConfirm, setOpenConfirm] = useState(false);
  return (
    <>
      <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => setOpenConfirm(true)}>
        Deactivate
      </Button>
      <ConfirmDialog
        open={openConfirm}
        title="Deactivate parent?"
        description="The parent will no longer be able to sign in until reactivated."
        confirmLabel={pending ? "Deactivating…" : "Deactivate"}
        variant="danger"
        onCancel={() => setOpenConfirm(false)}
        onConfirm={() =>
          start(async () => {
            const r = await deactivateParentAction(id);
            if (r.ok) {
              toast.success("Parent deactivated");
              setOpenConfirm(false);
            } else toast.error(r.error);
          })
        }
      />
    </>
  );
}

export function ParentReactivateButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await reactivateParentAction(id);
          if (r.ok) toast.success("Parent reactivated");
          else toast.error(r.error);
        })
      }
    >
      Reactivate
    </Button>
  );
}

export function ParentStudentLinkForm({
  parents,
  students,
}: {
  parents: SelectOption[];
  students: SelectOption[];
}) {
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 md:grid-cols-3"
      action={(fd) =>
        start(async () => {
          const r = await linkParentStudentAction(fd);
          if (r.ok) toast.success("Linked parent to student");
          else toast.error(r.error);
        })
      }
    >
      <Select name="parent_id" label="Parent" options={parents} placeholder="Choose parent" required disabled={pending} />
      <Select name="student_id" label="Student" options={students} placeholder="Choose student" required disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          {pending ? "Linking…" : "Link"}
        </Button>
      </div>
    </form>
  );
}

export function ParentStudentUnlinkForm({
  parents,
  students,
}: {
  parents: SelectOption[];
  students: SelectOption[];
}) {
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3 md:grid-cols-3"
      action={(fd) =>
        start(async () => {
          const r = await unlinkParentStudentAction(fd);
          if (r.ok) toast.success("Unlinked");
          else toast.error(r.error);
        })
      }
    >
      <Select name="parent_id" label="Parent" options={parents} placeholder="Choose parent" required disabled={pending} />
      <Select name="student_id" label="Student" options={students} placeholder="Choose student" required disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" variant="secondary" disabled={pending} className="w-full md:w-auto">
          {pending ? "Removing…" : "Unlink"}
        </Button>
      </div>
    </form>
  );
}
