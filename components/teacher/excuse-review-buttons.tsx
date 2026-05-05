"use client";

import { Button } from "@/components/shared/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { reviewTeacherExcuseAction } from "@/lib/actions/teacher-excuses";
import type { TeacherExcuseRow } from "@/lib/data/teachers";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function TeacherExcuseReviewButtons({ excuse }: { excuse: TeacherExcuseRow }) {
  const [pending, startTransition] = useTransition();
  const [openRejectConfirm, setOpenRejectConfirm] = useState(false);

  if (excuse.status !== "pending") {
    return <span className="text-xs text-muted">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      <Button
        type="button"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await reviewTeacherExcuseAction(excuse.id, "approved");
            if (result.ok) toast.success("Excuse approved");
            else toast.error(result.error);
          })
        }
      >
        Approve
      </Button>
      <Button
        type="button"
        variant="danger"
        size="sm"
        disabled={pending}
        onClick={() => setOpenRejectConfirm(true)}
      >
        Reject
      </Button>
      <ConfirmDialog
        open={openRejectConfirm}
        title="Reject excuse request?"
        description="The parent will receive a rejection notification."
        confirmLabel={pending ? "Rejecting…" : "Reject"}
        variant="danger"
        onCancel={() => setOpenRejectConfirm(false)}
        onConfirm={() =>
          startTransition(async () => {
            const result = await reviewTeacherExcuseAction(excuse.id, "rejected");
            if (result.ok) {
              toast.success("Excuse rejected");
              setOpenRejectConfirm(false);
            } else toast.error(result.error);
          })
        }
      />
    </div>
  );
}
