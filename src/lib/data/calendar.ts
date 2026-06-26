import "server-only";

import { createClient } from "@/lib/supabase/server";

export type CalendarEntryType = "event" | "review";

export interface CalendarEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: CalendarEntryType;
  category: string | null;
  href: string | null;
}

export interface CreateCalendarEventInput {
  actorId: string;
  title: string;
  description?: string | null;
  category?: string | null;
  eventDate: string; // YYYY-MM-DD
}

/**
 * All calendar entries between two dates (inclusive). Combines department-shared
 * calendar events with case review dates the user can see (RLS-scoped: staff see
 * their own cases' reviews, a dept head sees all).
 */
export async function listCalendarEntries(
  from: string,
  to: string,
): Promise<CalendarEntry[]> {
  const supabase = await createClient();

  const [eventsRes, casesRes] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("id, title, category, event_date")
      .gte("event_date", from)
      .lte("event_date", to)
      .order("event_date", { ascending: true }),
    supabase
      .from("cases")
      .select("id, review_date, patient:patients ( name )")
      .not("review_date", "is", null)
      .gte("review_date", from)
      .lte("review_date", to),
  ]);

  if (eventsRes.error) throw eventsRes.error;
  if (casesRes.error) throw casesRes.error;

  const entries: CalendarEntry[] = [];

  for (const e of eventsRes.data ?? []) {
    entries.push({
      id: `event-${e.id}`,
      date: e.event_date as string,
      title: e.title as string,
      type: "event",
      category: (e.category as string | null) ?? null,
      href: null,
    });
  }

  for (const c of casesRes.data ?? []) {
    const patient = c.patient as unknown as { name: string } | null;
    entries.push({
      id: `review-${c.id}`,
      date: c.review_date as string,
      title: patient?.name ?? "Case review",
      type: "review",
      category: null,
      href: `/staff/cases/${c.id as string}`,
    });
  }

  return entries;
}

/** Add a department calendar event (RLS: staff/head only). */
export async function createCalendarEvent(
  input: CreateCalendarEventInput,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("calendar_events").insert({
    title: input.title,
    description: input.description ?? null,
    category: input.category ?? null,
    event_date: input.eventDate,
    created_by: input.actorId,
  });

  if (error) throw error;
}
