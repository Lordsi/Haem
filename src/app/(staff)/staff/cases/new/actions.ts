"use server";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { createCase } from "@/lib/data/clinical";

export type NewCaseState = {
  status: "idle" | "error";
  message?: string;
};

function generatePatientCode(): string {
  return `P-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/** Open a new case (status: pending consultant review). Staff only. */
export async function createCaseAction(
  _prev: NewCaseState,
  formData: FormData,
): Promise<NewCaseState> {
  const profile = await requireStaff();

  const mode = String(formData.get("patient_mode") ?? "existing");
  const diagnosis = String(formData.get("diagnosis") ?? "").trim();
  const treatmentPlan = String(formData.get("treatment_plan") ?? "").trim();
  const reviewDate = String(formData.get("review_date") ?? "").trim();

  let caseId: string;

  try {
    if (mode === "new") {
      const name = String(formData.get("new_name") ?? "").trim();
      const codeInput = String(formData.get("new_patient_code") ?? "").trim();
      const dob = String(formData.get("new_dob") ?? "").trim();
      const sex = String(formData.get("new_sex") ?? "").trim();
      const contact = String(formData.get("new_contact") ?? "").trim();

      if (name.length < 2) {
        return { status: "error", message: "Enter the patient's full name." };
      }

      caseId = await createCase({
        actorId: profile.id,
        newPatient: {
          name,
          patient_code: codeInput || generatePatientCode(),
          date_of_birth: dob || null,
          sex: sex || null,
          contact_info: contact || null,
        },
        diagnosis: diagnosis || null,
        treatmentPlan: treatmentPlan || null,
        reviewDate: reviewDate || null,
      });
    } else {
      const existingPatientId = String(formData.get("patient_id") ?? "").trim();
      if (!existingPatientId) {
        return {
          status: "error",
          message: "Select an existing patient or add a new one.",
        };
      }

      caseId = await createCase({
        actorId: profile.id,
        existingPatientId,
        diagnosis: diagnosis || null,
        treatmentPlan: treatmentPlan || null,
        reviewDate: reviewDate || null,
      });
    }
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("patients_patient_code")
        ? "That patient code is already in use. Use a different one."
        : "Could not open the case. Please try again.";
    console.error("[cases] createCaseAction failed", error);
    return { status: "error", message };
  }

  redirect(`/staff/cases/${caseId}`);
}
