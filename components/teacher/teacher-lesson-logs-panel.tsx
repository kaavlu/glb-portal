"use client";

import {
  listTeacherLessonSessionsAction,
  loadTeacherLessonLogAction,
  saveTeacherLessonLogAction,
} from "@/lib/actions/teacher-lessons";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Input } from "@/components/shared/input";
import { LoadingState } from "@/components/shared/loading-state";
import { Select, type SelectOption } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import type { TeacherLessonSessionListItem } from "@/types/teacher-sessions";
import { formatDisplayDate } from "@/lib/utils/dates";
import { BookOpen } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

function sessionPickerValue(item: TeacherLessonSessionListItem): string {
  return JSON.stringify({ assignmentId: item.assignmentId, slotKey: item.slotKey });
}

function parseSessionPickerValue(raw: string): { assignmentId: string; slotKey: string } | null {
  try {
    const v = JSON.parse(raw) as unknown;
    if (!v || typeof v !== "object") return null;
    const o = v as Record<string, unknown>;
    const assignmentId = o.assignmentId;
    const slotKey = o.slotKey;
    if (typeof assignmentId === "string" && typeof slotKey === "string") {
      return { assignmentId, slotKey };
    }
    return null;
  } catch {
    return null;
  }
}

export function TeacherLessonLogsPanel() {
  const [sessionDate, setSessionDate] = useState("");
  const [sessions, setSessions] = useState<TeacherLessonSessionListItem[]>([]);
  const [selectedPickerValue, setSelectedPickerValue] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [homework, setHomework] = useState("");
  const [hasSavedLog, setHasSavedLog] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingList, startList] = useTransition();
  const [pendingLoad, startLoad] = useTransition();
  const [pendingSave, startSave] = useTransition();

  useEffect(() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    setSessionDate(`${y}-${m}-${d}`);
  }, []);

  const refreshSessionList = useCallback(
    (date: string, preferPicker?: string) => {
      if (!date) return;
      setListError(null);
      startList(async () => {
        const res = await listTeacherLessonSessionsAction(date);
        if (!res.ok) {
          setListError(res.error);
          setSessions([]);
          setSelectedPickerValue("");
          return;
        }
        setSessions(res.sessions);
        const next =
          preferPicker && res.sessions.some((s) => sessionPickerValue(s) === preferPicker)
            ? preferPicker
            : res.sessions[0]
              ? sessionPickerValue(res.sessions[0])
              : "";
        setSelectedPickerValue(next);
      });
    },
    [],
  );

  useEffect(() => {
    refreshSessionList(sessionDate);
  }, [sessionDate, refreshSessionList]);

  const loadLogForSelection = useCallback(
    (pickerValue: string, date: string) => {
      const parsed = parseSessionPickerValue(pickerValue);
      if (!parsed || !date) return;
      setLoadError(null);
      startLoad(async () => {
        const res = await loadTeacherLessonLogAction({
          assignmentId: parsed.assignmentId,
          sessionDate: date,
          slotKey: parsed.slotKey,
        });
        if (!res.ok) {
          setLoadError(res.error);
          setSessionId(null);
          setClassName("");
          setSubjectName("");
          setTopic("");
          setContent("");
          setHomework("");
          setHasSavedLog(false);
          return;
        }
        setSessionId(res.sessionId);
        setClassName(res.className);
        setSubjectName(res.subjectName);
        const log = res.log;
        setTopic(log?.topic ?? "");
        setContent(log?.content ?? "");
        setHomework(log?.homework ?? "");
        setHasSavedLog(!!log);
        setContentError(null);
      });
    },
    [],
  );

  useEffect(() => {
    if (!selectedPickerValue || !sessionDate) return;
    loadLogForSelection(selectedPickerValue, sessionDate);
  }, [selectedPickerValue, sessionDate, loadLogForSelection]);

  const titleDate =
    sessionDate && !Number.isNaN(Date.parse(`${sessionDate}T12:00:00`))
      ? formatDisplayDate(`${sessionDate}T12:00:00`, "MMMM d, yyyy")
      : "";

  const sessionSelectOptions: SelectOption[] = useMemo(
    () =>
      sessions.map((s) => ({
        value: sessionPickerValue(s),
        label: `${s.subjectName} — Class ${s.className} — ${s.slotLabel}`,
      })),
    [sessions],
  );

  function handleSave() {
    setContentError(null);
    const trimmed = content.trim();
    if (!trimmed) {
      setContentError("Lesson description is required.");
      return;
    }
    if (!sessionId) {
      toast.error("Select a class session first.");
      return;
    }
    startSave(async () => {
      const res = await saveTeacherLessonLogAction({
        sessionId,
        topic,
        content,
        homework,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setHasSavedLog(true);
      toast.success("Lesson log saved.");
    });
  }

  const busy = pendingList || pendingLoad;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Lesson Logs</h1>
        {titleDate ? <p className="mt-1 text-sm text-muted">{titleDate}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <label htmlFor="lesson-session-date" className="block text-sm font-medium text-foreground">
            Date
          </label>
          <input
            id="lesson-session-date"
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary"
          />
        </div>
        {sessions.length > 0 ? (
          <Select
            label="Class session"
            name="classSession"
            options={sessionSelectOptions}
            value={selectedPickerValue}
            onChange={(e) => setSelectedPickerValue(e.target.value)}
            disabled={pendingList}
          />
        ) : null}
      </div>

      {listError ? <ErrorState title="Could not load sessions" message={listError} /> : null}
      {loadError ? <ErrorState title="Could not load lesson log" message={loadError} /> : null}

      {!pendingList && sessions.length === 0 && !listError ? (
        <Card className="p-6">
          <EmptyState
            icon={BookOpen}
            title="No class sessions"
            description="You have no assigned class sessions on this date. Choose another date or contact an administrator."
          />
        </Card>
      ) : null}

      {sessions.length > 0 ? (
        <>
          <Card className="p-4 sm:p-6">
            <p className="text-sm font-medium text-foreground">Session summary</p>
            {busy && !className ? (
              <div className="mt-4">
                <LoadingState label="Loading session…" />
              </div>
            ) : (
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-xs text-muted">Subject</dt>
                  <dd className="font-medium text-foreground">{subjectName || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Class</dt>
                  <dd className="font-medium text-foreground">{className || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Date</dt>
                  <dd className="font-medium text-foreground">{titleDate || "—"}</dd>
                </div>
              </dl>
            )}
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-foreground">Record today&apos;s lesson</h2>
            <div className="mt-4 space-y-4">
              <Input
                name="topic"
                label="Lesson topic (recommended)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={busy || !sessionId}
                placeholder="e.g. Quadratic equations"
              />
              <Textarea
                name="content"
                label="Lesson description"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={busy || !sessionId}
                placeholder="What was covered in class?"
                error={contentError ?? undefined}
                required
              />
              <Textarea
                name="homework"
                label="Homework (optional)"
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                disabled={busy || !sessionId}
                placeholder="Optional reading or exercises"
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                disabled={busy || !sessionId || pendingSave}
                onClick={handleSave}
              >
                {hasSavedLog ? "Update Lesson Log" : "Save Lesson Log"}
              </Button>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
