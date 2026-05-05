"use client";

import { deleteLessonLogAction, updateLessonLogAction } from "@/lib/actions/admin";
import { Button } from "@/components/shared/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Textarea } from "@/components/shared/textarea";
import type { AdminLessonLogRow } from "@/types/admin";
import { formatDisplayDate } from "@/lib/utils/dates";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function LessonLogActions({ log }: { log: AdminLessonLogRow }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(log.topic ?? "");
  const [content, setContent] = useState(log.content);
  const [homework, setHomework] = useState(log.homework ?? "");
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        View / edit
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-5 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Lesson log</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatDisplayDate(log.sessionDate, "MMMM d, yyyy")} · {log.subjectName} · {log.className}
                </p>
                <p className="text-sm text-muted">
                  Teacher: {log.teacherName} · Updated {formatDisplayDate(log.updatedAt, "MMM d, yyyy HH:mm")}
                </p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor={`topic-${log.id}`}>
                  Topic
                </label>
                <input
                  id={`topic-${log.id}`}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  disabled={pending}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor={`content-${log.id}`}>
                  Description
                </label>
                <Textarea
                  id={`content-${log.id}`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  disabled={pending}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor={`hw-${log.id}`}>
                  Homework
                </label>
                <Textarea
                  id={`hw-${log.id}`}
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  rows={3}
                  disabled={pending}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 sm:gap-4">
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await updateLessonLogAction(log.id, {
                        topic: topic.trim() || null,
                        content,
                        homework: homework.trim() || null,
                      });
                      if (r.ok) toast.success("Lesson log saved");
                      else toast.error(r.error);
                    })
                  }
                >
                  {pending ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  disabled={pending}
                  onClick={() => setOpenDeleteConfirm(true)}
                >
                  Delete
                </Button>
                <ConfirmDialog
                  open={openDeleteConfirm}
                  title="Delete lesson log?"
                  description="This action cannot be undone."
                  confirmLabel={pending ? "Deleting…" : "Delete"}
                  variant="danger"
                  onCancel={() => setOpenDeleteConfirm(false)}
                  onConfirm={() =>
                    start(async () => {
                      const r = await deleteLessonLogAction(log.id);
                      if (r.ok) {
                        toast.success("Lesson log deleted");
                        setOpenDeleteConfirm(false);
                        setOpen(false);
                      } else toast.error(r.error);
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
