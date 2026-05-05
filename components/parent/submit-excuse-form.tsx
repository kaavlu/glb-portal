"use client";

import { submitExcuseAction } from "@/lib/actions/parents";
import type { ExcusableAbsence, LinkedStudent } from "@/lib/data/parents";
import { formatDisplayDate } from "@/lib/utils/dates";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Select } from "@/components/shared/select";
import { Textarea } from "@/components/shared/textarea";
import { FilePlus2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

const REASON_OPTIONS = [
  { value: "medical", label: "Medical" },
  { value: "family", label: "Family" },
  { value: "travel", label: "Travel" },
  { value: "other", label: "Other" },
];

export function ParentSubmitExcuseForm({
  linkedStudents,
  selectedStudentId,
  absences,
}: {
  linkedStudents: LinkedStudent[];
  selectedStudentId: string | null;
  absences: ExcusableAbsence[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [attendanceRecordId, setAttendanceRecordId] = useState(absences[0]?.attendanceRecordId ?? "");
  const [reasonCategory, setReasonCategory] = useState(REASON_OPTIONS[0]?.value ?? "medical");
  const [description, setDescription] = useState("");

  const studentOptions = useMemo(
    () =>
      linkedStudents.map((student) => ({
        value: student.id,
        label: `${student.fullName}${student.className ? ` — Class ${student.className}` : ""}`,
      })),
    [linkedStudents],
  );

  const absenceOptions = useMemo(
    () =>
      absences.map((absence) => ({
        value: absence.attendanceRecordId,
        label: `${formatDisplayDate(absence.sessionDate, "MMMM d, yyyy")} — ${absence.subjectName}`,
      })),
    [absences],
  );

  function changeStudent(studentId: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("studentId", studentId);
    router.push(`${pathname}?${next.toString()}`);
  }

  function onSubmit() {
    if (!selectedStudentId) {
      toast.error("Select a linked student first.");
      return;
    }
    if (!attendanceRecordId) {
      toast.error("Select an absence to excuse.");
      return;
    }

    startTransition(async () => {
      const result = await submitExcuseAction({
        studentId: selectedStudentId,
        attendanceRecordId,
        reasonCategory,
        description,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Excuse submitted.");
      setDescription("");
      router.refresh();
    });
  }

  return (
    <Card className="space-y-4 p-5 shadow-card">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          name="studentId"
          label="Student"
          options={studentOptions}
          value={selectedStudentId ?? ""}
          onChange={(event) => changeStudent(event.target.value)}
          disabled={pending || linkedStudents.length === 0}
        />
        <Select
          name="attendanceRecordId"
          label="Absence"
          options={absenceOptions}
          value={attendanceRecordId}
          onChange={(event) => setAttendanceRecordId(event.target.value)}
          disabled={pending || absenceOptions.length === 0}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          name="reasonCategory"
          label="Reason Category"
          options={REASON_OPTIONS}
          value={reasonCategory}
          onChange={(event) => setReasonCategory(event.target.value)}
          disabled={pending || absenceOptions.length === 0}
        />
      </div>

      <Textarea
        name="description"
        label="Description"
        placeholder="Optional details for the reviewer"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        disabled={pending || absenceOptions.length === 0}
      />

      {selectedStudentId && absences.length === 0 ? (
        <EmptyState
          icon={FilePlus2}
          title="No excusable absences"
          description="Only absent records without a pending or approved excuse can be submitted."
        />
      ) : null}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={pending || !selectedStudentId || !attendanceRecordId}
        >
          Submit Excuse
        </Button>
      </div>
    </Card>
  );
}
