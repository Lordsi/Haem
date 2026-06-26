"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/session";
import {
  markAllInboxRead,
  markContactMessageRead,
  markEventRegistrationRead,
} from "@/lib/data/inbox";

export type InboxActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function refresh() {
  revalidatePath("/staff/inbox");
  // Refresh the staff layout so the nav unread badge updates everywhere.
  revalidatePath("/staff", "layout");
}

export async function toggleInboxItemRead(
  _prev: InboxActionState,
  formData: FormData,
): Promise<InboxActionState> {
  await requireStaff();

  const kind = String(formData.get("kind") ?? "");
  const id = String(formData.get("id") ?? "");
  const read = String(formData.get("read") ?? "true") === "true";

  if (!id) return { status: "error", message: "Missing item reference." };

  const result =
    kind === "registration"
      ? await markEventRegistrationRead(id, read)
      : kind === "contact"
        ? await markContactMessageRead(id, read)
        : ({ ok: false, message: "Unknown item type." } as const);

  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  refresh();
  return { status: "success" };
}

export async function markAllReadAction(): Promise<void> {
  await requireStaff();
  await markAllInboxRead();
  refresh();
}
