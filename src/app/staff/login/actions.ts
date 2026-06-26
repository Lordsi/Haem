"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, isStaffRole } from "@/lib/auth/session";

export type LoginState = {
  status: "idle" | "error";
  message?: string;
};

/** Staff / department-head sign-in. Rejects non-staff roles. */
export async function signInStaff(
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
  if (!profile || !isStaffRole(profile.role)) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "This account is not authorized for staff access.",
    };
  }

  redirect(next && next.startsWith("/staff") ? next : "/staff");
}
