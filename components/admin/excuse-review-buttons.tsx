"use client";

import { reviewExcuseAction } from "@/lib/actions/admin";
import { Button } from "@/components/shared/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { AdminExcuseRow } from "@/types/admin";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function ExcuseReviewButtons({ excuse }: { excuse: AdminExcuseRow }) {
  const [pending, start] = useTransition();
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
          start(async () => {
            const r = await reviewExcuseAction(excuse.id, "approved");
            if (r.ok) toast.success("Excuse approved");
            else toast.error(r.error);
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
        description="The parent will be notified that this excuse was rejected."
        confirmLabel={pending ? "Rejecting…" : "Reject"}
        variant="danger"
        onCancel={() => setOpenRejectConfirm(false)}
        onConfirm={() =>
          start(async () => {
            const r = await reviewExcuseAction(excuse.id, "rejected");
            if (r.ok) {
              toast.success("Excuse rejected");
              setOpenRejectConfirm(false);
            } else toast.error(r.error);
          })
        }
      />
    </div>
  );
}
