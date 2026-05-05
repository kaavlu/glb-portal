import { ParentSubmitExcuseForm } from "@/components/parent/submit-excuse-form";
import { requireRole } from "@/lib/auth/require-role";
import { getExcusableAbsences, getLinkedStudents } from "@/lib/data/parents";

export const metadata = {
  title: "Submit Excuse",
};

export default async function ParentSubmitExcusePage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const profile = await requireRole("parent");
  const linkedStudents = await getLinkedStudents(profile.id);
  const sp = await searchParams;

  const selectedStudent =
    linkedStudents.find((student) => student.id === sp.studentId) ?? linkedStudents[0] ?? null;
  const selectedStudentId = selectedStudent?.id ?? null;
  const absences = selectedStudentId
    ? await getExcusableAbsences(profile.id, selectedStudentId)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Submit Excuse</h1>
        <p className="mt-1 text-sm text-muted">
          Select an absent record and submit a reason for teacher/admin review.
        </p>
      </div>
      <ParentSubmitExcuseForm
        linkedStudents={linkedStudents}
        selectedStudentId={selectedStudentId}
        absences={absences}
      />
    </div>
  );
}
