"use server";

import { revalidatePath } from "next/cache";
import { requirePatient } from "@/lib/auth/session";
import {
  getCareTeam,
  getPatientRecord,
  markMessageRead,
  sendPatientMessage,
} from "@/lib/data/patient-portal";

export type MessageActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function submitPatientMessage(
  _prev: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const profile = await requirePatient();
  const receiverId = String(formData.get("receiverId") ?? "");
  const body = String(formData.get("body") ?? "");

  if (!receiverId) {
    return { status: "error", message: "Please select a care team member." };
  }

  const patient = await getPatientRecord(profile.id);
  if (!patient) {
    return { status: "error", message: "No patient record found." };
  }

  const careTeam = await getCareTeam(patient.id);
  if (!careTeam.some((m) => m.id === receiverId)) {
    return { status: "error", message: "Invalid recipient." };
  }

  const result = await sendPatientMessage(profile.id, receiverId, body);
  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/patient/messages");
  revalidatePath("/patient");
  return { status: "success", message: "Message sent." };
}

export async function markPatientMessageRead(messageId: string): Promise<void> {
  const profile = await requirePatient();
  await markMessageRead(messageId, profile.id);
  revalidatePath("/patient/messages");
  revalidatePath("/patient");
}

export async function markPatientMessageReadAction(
  formData: FormData,
): Promise<void> {
  const messageId = String(formData.get("messageId") ?? "");
  if (messageId) await markPatientMessageRead(messageId);
}
