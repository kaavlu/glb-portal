"use server";

import { requireRole } from "@/lib/auth/require-role";
import { reviewExcuse } from "@/lib/data/teachers";
import { revalidatePath } from "next/cache";

export async function reviewTeacherExcuseAction(
  excuseId: string,
  decision: "approved" | "rejected",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const profile = await requireRole("teacher");
  const result = await reviewExcuse(excuseId, profile.id, decision);
  if (result.ok) {
    revalidatePath("/teacher/excuses");
    revalidatePath("/parent/attendance");
    revalidatePath("/parent/notifications");
    revalidatePath("/admin/excuses");
  }
  return result;
}
