import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole, UserProfile } from "./types";

export type { UserRole, UserProfile };

/** Returns the authenticated Supabase Auth user, or null. */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/** Load the extended profile from `public.users` for the current session. */
export async function getUserProfile(): Promise<UserProfile | null> {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", authUser.id)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export function isStaffRole(role: UserRole): boolean {
  return role === "staff" || role === "dept_head";
}

/** Post-login landing path for each role. */
export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "staff":
    case "dept_head":
      return "/staff";
    case "patient":
      return "/patient";
    default:
      return "/";
  }
}

/** Require an authenticated session with one of the allowed roles. */
export async function requireRole(
  allowed: UserRole[],
): Promise<UserProfile> {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/staff/login");
  }
  if (!allowed.includes(profile.role)) {
    redirect(getRoleHomePath(profile.role));
  }
  return profile;
}

/** Require staff or department-head access. */
export async function requireStaff(): Promise<UserProfile> {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/staff/login");
  }
  if (!isStaffRole(profile.role)) {
    redirect(getRoleHomePath(profile.role));
  }
  return profile;
}

/** Require a patient account. */
export async function requirePatient(): Promise<UserProfile> {
  const profile = await getUserProfile();
  if (!profile) {
    redirect("/patient/login");
  }
  if (profile.role !== "patient") {
    redirect(getRoleHomePath(profile.role));
  }
  return profile;
}
