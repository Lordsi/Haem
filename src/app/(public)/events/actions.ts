"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type RegistrationState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Register a member of the public for an event.
 *
 * Capacity enforcement requires reading the current registration count, which
 * RLS restricts to staff. So when a service-role key is available we perform the
 * count + insert through a trusted admin client (server-only). Without it, we
 * fall back to an anon insert (RLS permits public inserts) without capacity
 * enforcement, and when Supabase isn't configured at all we simulate success.
 */
export async function registerForEvent(
  _prev: RegistrationState,
  formData: FormData,
): Promise<RegistrationState> {
  const eventId = String(formData.get("eventId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!eventId) {
    return { status: "error", message: "Missing event reference." };
  }
  if (name.length < 2) {
    return { status: "error", message: "Please enter your full name." };
  }
  if (!isValidEmail(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "success",
      message: `Thanks, ${name}! Your registration has been recorded (demo mode; connect a database to persist it).`,
    };
  }

  try {
    const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (hasServiceRole) {
      const admin = createAdminClient();

      const { data: event, error: eventError } = await admin
        .from("events")
        .select("id, registration_limit")
        .eq("id", eventId)
        .maybeSingle();
      if (eventError) throw eventError;
      if (!event) return { status: "error", message: "Event not found." };

      if (event.registration_limit) {
        const { count, error: countError } = await admin
          .from("event_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", eventId);
        if (countError) throw countError;
        if ((count ?? 0) >= event.registration_limit) {
          return {
            status: "error",
            message: "Sorry, this event is fully booked.",
          };
        }
      }

      const { error: insertError } = await admin
        .from("event_registrations")
        .insert({ event_id: eventId, name, email });
      if (insertError) throw insertError;
    } else {
      const supabase = await createClient();
      const { error } = await supabase
        .from("event_registrations")
        .insert({ event_id: eventId, name, email });
      if (error) throw error;
    }

    return {
      status: "success",
      message: `Thanks, ${name}! Your registration is confirmed. A confirmation will be sent to ${email}.`,
    };
  } catch (error) {
    console.error("[events] registerForEvent failed", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again later.",
    };
  }
}
