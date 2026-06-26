"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Handle a public contact form submission (anon insert is allowed by RLS). */
export async function submitContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (name.length < 2) {
    return { status: "error", message: "Please enter your full name." };
  }
  if (!isValidEmail(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (body.length < 10) {
    return {
      status: "error",
      message: "Please enter a message of at least 10 characters.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "success",
      message: `Thanks, ${name}! Your message has been received (demo mode; connect a database to persist it).`,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      subject: subject || null,
      body,
    });
    if (error) throw error;

    return {
      status: "success",
      message: `Thanks, ${name}! Your message has been sent. We'll get back to you at ${email}.`,
    };
  } catch (error) {
    console.error("[contact] submitContactMessage failed", error);
    return {
      status: "error",
      message: "Something went wrong. Please try again later.",
    };
  }
}
