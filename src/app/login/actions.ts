"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, getRoleHomePath, isStaffRole } from "@/lib/auth/session";
import type { UserRole } from "@/lib/auth/types";

export type LoginState = {
  status: "idle" | "error";
  message?: string;
};

/** Returns true when `next` points inside the area the role is allowed to use. */
function isAllowedNext(next: string, role: UserRole): boolean {
  if (!next.startsWith("/")) return false;
  // Never bounce back to a login route (avoids post-login redirect loops).
  if (next === "/login" || next.includes("/login")) return false;
  if (isStaffRole(role)) return next.startsWith("/staff");
  if (role === "patient") return next.startsWith("/patient");
  return false;
}

/**
 * Unified sign-in. Authenticates once, then routes by role:
 * staff/dept_head -> /staff, patient -> /patient. A `next` path is honoured
 * only when it belongs to the signed-in user's own area.
 */
export async function signIn(
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
  if (!profile) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "This account is not set up for access. Contact the department.",
    };
  }

  const destination = isAllowedNext(next, profile.role)
    ? next
    : getRoleHomePath(profile.role);

  redirect(destination);
}
