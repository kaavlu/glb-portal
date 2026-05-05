"use server";

import { requireRole } from "@/lib/auth/require-role";
import { submitExcuse } from "@/lib/data/parents";
import type { Database } from "@/types/database";
import { revalidatePath } from "next/cache";

type ReasonCategory = Database["public"]["Tables"]["excuse_requests"]["Row"]["reason_category"];

const ALLOWED_REASON_CATEGORIES = new Set<ReasonCategory>(["medical", "family", "travel", "other"]);

export async function submitExcuseAction(input: {
  studentId: string;
  attendanceRecordId: string;
  reasonCategory: string;
  description?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireRole("parent");
  if (!input.studentId) return { ok: false, error: "Student is required." };
  if (!input.attendanceRecordId) return { ok: false, error: "Absence is required." };
  if (!ALLOWED_REASON_CATEGORIES.has(input.reasonCategory as ReasonCategory)) {
    return { ok: false, error: "Reason category is required." };
  }

  const result = await submitExcuse({
    parentId: profile.id,
    studentId: input.studentId,
    attendanceRecordId: input.attendanceRecordId,
    reasonCategory: input.reasonCategory as ReasonCategory,
    description: input.description ?? "",
  });

  if (result.ok) {
    revalidatePath("/parent/submit-excuse");
    revalidatePath("/parent/attendance");
    revalidatePath("/parent/notifications");
    revalidatePath("/teacher/excuses");
    revalidatePath("/admin/excuses");
  }

  return result;
}
