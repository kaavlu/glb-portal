"use client";

import {
  createStudentAction,
  deactivateStudentAction,
  linkParentStudentAction,
  reactivateStudentAction,
  updateStudentAction,
} from "@/lib/actions/admin";
import { Button } from "@/components/shared/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/shared/input";
import { Select, type SelectOption } from "@/components/shared/select";
import type { StudentListRow } from "@/types/admin";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const LANGUAGE_GROUP_OPTIONS: SelectOption[] = [
  { value: "", label: "All classes" },
  { value: "FJ1", label: "FJ1" },
  { value: "ŠJ1", label: "ŠJ1" },
  { value: "NJ1", label: "NJ1" },
];

export function StudentCreateForm({ classes }: { classes: SelectOption[] }) {
  const [pending, start] = useTransition();
  const classOptions = [{ value: "", label: "No class" }, ...classes];

  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"
      action={(fd) =>
        start(async () => {
          const r = await createStudentAction(fd);
          if (r.ok) toast.success("Student created");
          else toast.error(r.error);
        })
      }
    >
      <Input name="full_name" label="Full name" required disabled={pending} />
      <Input name="initials" label="Initials (optional)" maxLength={6} disabled={pending} />
      <Select name="class_id" label="Class" options={classOptions} disabled={pending} />
      <Select name="language_group" label="Language group" options={LANGUAGE_GROUP_OPTIONS} disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          {pending ? "Saving…" : "Add student"}
        </Button>
      </div>
    </form>
  );
}

export function StudentEditForm({ student, classes }: { student: StudentListRow; classes: SelectOption[] }) {
  const [pending, start] = useTransition();
  const classOptions = [{ value: "", label: "No class" }, ...classes];

  return (
    <form
      className="grid gap-3 md:grid-cols-2 lg:grid-cols-5"
      action={(fd) =>
        start(async () => {
          const r = await updateStudentAction(student.id, fd);
          if (r.ok) toast.success("Student updated");
          else toast.error(r.error);
        })
      }
    >
      <Input name="full_name" label="Full name" required defaultValue={student.full_name} disabled={pending} />
      <Input name="initials" label="Initials" maxLength={6} defaultValue={student.initials ?? ""} disabled={pending} />
      <Select
        name="class_id"
        label="Class"
        options={classOptions}
        defaultValue={student.class_id ?? ""}
        disabled={pending}
      />
      <Select
        name="language_group"
        label="Language group"
        options={LANGUAGE_GROUP_OPTIONS}
        defaultValue={student.language_group ?? ""}
        disabled={pending}
      />
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export function StudentDeactivateButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [openConfirm, setOpenConfirm] = useState(false);
  return (
    <>
      <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => setOpenConfirm(true)}>
        Deactivate
      </Button>
      <ConfirmDialog
        open={openConfirm}
        title="Deactivate student?"
        description="This student will be hidden from active rosters until reactivated."
        confirmLabel={pending ? "Deactivating…" : "Deactivate"}
        variant="danger"
        onCancel={() => setOpenConfirm(false)}
        onConfirm={() =>
          start(async () => {
            const r = await deactivateStudentAction(id);
            if (r.ok) {
              toast.success("Student deactivated");
              setOpenConfirm(false);
            } else toast.error(r.error);
          })
        }
      />
    </>
  );
}

export function StudentReactivateButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await reactivateStudentAction(id);
          if (r.ok) toast.success("Student reactivated");
          else toast.error(r.error);
        })
      }
    >
      Reactivate
    </Button>
  );
}

export function StudentParentLinkForm({
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
      <Select name="student_id" label="Student" options={students} placeholder="Choose student" required disabled={pending} />
      <Select name="parent_id" label="Parent" options={parents} placeholder="Choose parent" required disabled={pending} />
      <div className="flex items-end">
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          {pending ? "Linking…" : "Link"}
        </Button>
      </div>
    </form>
  );
}
