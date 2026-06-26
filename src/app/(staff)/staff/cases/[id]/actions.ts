"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/session";
import {
  addCaseReview,
  updateCaseStatus,
  type CaseStatus,
} from "@/lib/data/clinical";

export type CaseActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const SELECTABLE_STATUSES: CaseStatus[] = [
  "pending_review",
  "active",
  "resolved",
  "closed",
];

/** Move a case to a new lifecycle status. Assigned staff / dept head (RLS). */
export async function updateStatusAction(
  _prev: CaseActionState,
  formData: FormData,
): Promise<CaseActionState> {
  const profile = await requireStaff();
  const caseId = String(formData.get("case_id") ?? "").trim();
  const next = String(formData.get("status") ?? "") as CaseStatus;

  if (!caseId) {
    return { status: "error", message: "Missing case reference." };
  }
  if (!SELECTABLE_STATUSES.includes(next)) {
    return { status: "error", message: "Invalid status." };
  }

  try {
    await updateCaseStatus(caseId, profile.id, next);
  } catch (error) {
    console.error("[cases] updateStatusAction failed", error);
    return {
      status: "error",
      message: "Could not update the status. You may not have permission.",
    };
  }

  revalidatePath(`/staff/cases/${caseId}`);
  return { status: "success", message: "Status updated." };
}

/** Add a consultation / review note to a case. */
export async function addReviewAction(
  _prev: CaseActionState,
  formData: FormData,
): Promise<CaseActionState> {
  const profile = await requireStaff();
  const caseId = String(formData.get("case_id") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!caseId) {
    return { status: "error", message: "Missing case reference." };
  }
  if (notes.length < 2) {
    return { status: "error", message: "Please enter a note." };
  }

  try {
    await addCaseReview(caseId, profile.id, notes);
  } catch (error) {
    console.error("[cases] addReviewAction failed", error);
    return { status: "error", message: "Could not save your note. Try again." };
  }

  revalidatePath(`/staff/cases/${caseId}`);
  return { status: "success", message: "Review note added." };
}
