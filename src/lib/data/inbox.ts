import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Staff inbox: public form submissions (contact messages + event
 * registrations) surfaced to staff and the department head.
 *
 * Reads/writes go through the RLS-scoped session client; the underlying
 * policies (`*_select_staff`, `*_update_staff`) restrict access to staff and
 * department-head roles. An item is "unopened" while `read_at` is null.
 */

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface EventRegistrationItem {
  id: string;
  name: string;
  email: string;
  registered_at: string;
  read_at: string | null;
  event_id: string;
  event_title: string | null;
}

export interface InboxUnreadCounts {
  contact: number;
  registrations: number;
  total: number;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, subject, body, created_at, read_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ContactMessage[];
}

export async function getEventRegistrations(): Promise<EventRegistrationItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_registrations")
    .select(
      `
      id,
      name,
      email,
      registered_at,
      read_at,
      event_id,
      event:events ( title )
    `,
    )
    .order("registered_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const event = row.event as unknown as { title: string | null } | null;
    return {
      id: row.id as string,
      name: row.name as string,
      email: row.email as string,
      registered_at: row.registered_at as string,
      read_at: row.read_at as string | null,
      event_id: row.event_id as string,
      event_title: event?.title ?? null,
    };
  });
}

/** Combined unread counts for the inbox, used by the nav badge and page tabs. */
export async function getInboxUnreadCounts(): Promise<InboxUnreadCounts> {
  const supabase = await createClient();

  const [contactRes, regRes] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
    supabase
      .from("event_registrations")
      .select("id", { count: "exact", head: true })
      .is("read_at", null),
  ]);

  if (contactRes.error) throw contactRes.error;
  if (regRes.error) throw regRes.error;

  const contact = contactRes.count ?? 0;
  const registrations = regRes.count ?? 0;
  return { contact, registrations, total: contact + registrations };
}

/** Lightweight unread total; safe to call from the layout (never throws). */
export async function getInboxUnreadTotal(): Promise<number> {
  try {
    const counts = await getInboxUnreadCounts();
    return counts.total;
  } catch {
    return 0;
  }
}

type MarkResult = { ok: true } | { ok: false; message: string };

export async function markContactMessageRead(
  id: string,
  read: boolean,
): Promise<MarkResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contact_messages")
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function markEventRegistrationRead(
  id: string,
  read: boolean,
): Promise<MarkResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("event_registrations")
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/** Mark every currently-unopened item in both tables as read. */
export async function markAllInboxRead(): Promise<MarkResult> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [contactRes, regRes] = await Promise.all([
    supabase
      .from("contact_messages")
      .update({ read_at: now })
      .is("read_at", null),
    supabase
      .from("event_registrations")
      .update({ read_at: now })
      .is("read_at", null),
  ]);

  if (contactRes.error) return { ok: false, message: contactRes.error.message };
  if (regRes.error) return { ok: false, message: regRes.error.message };
  return { ok: true };
}
