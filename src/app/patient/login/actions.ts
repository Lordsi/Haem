"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/auth/session";
import type { LoginState } from "@/app/staff/login/actions";

/** Patient portal sign-in. Rejects non-patient roles. */
export async function signInPatient(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();

  if (!email || !password) {
    return { status: "error", message: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      status: "error",
      message: "Invalid email or password. Please try again.",
    };
  }

  const profile = await getUserProfile();
  if (!profile || profile.role !== "patient") {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "This account is not registered as a patient portal user.",
    };
  }

  redirect(next && next.startsWith("/patient") ? next : "/patient");
}
