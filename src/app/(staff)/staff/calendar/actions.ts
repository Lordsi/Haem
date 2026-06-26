"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/session";
import { createCalendarEvent } from "@/lib/data/calendar";

export type CalendarFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const CATEGORIES = ["clinic", "meeting", "training", "other"];

/** Add a department-shared calendar event. Staff/head only. */
export async function createEventAction(
  _prev: CalendarFormState,
  formData: FormData,
): Promise<CalendarFormState> {
  const profile = await requireStaff();

  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = CATEGORIES.includes(categoryRaw) ? categoryRaw : null;

  if (title.length < 2) {
    return { status: "error", message: "Enter an event title." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return { status: "error", message: "Choose a date for the event." };
  }

  try {
    await createCalendarEvent({
      actorId: profile.id,
      title,
      eventDate,
      category,
      description: description || null,
    });
  } catch (error) {
    console.error("[calendar] createEventAction failed", error);
    return { status: "error", message: "Could not add the event. Try again." };
  }

  revalidatePath("/staff/calendar");
  return { status: "success", message: `"${title}" added to the calendar.` };
}
