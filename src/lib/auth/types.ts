/** Mirrors `public.user_role` in the database. */
export type UserRole = "public_user" | "patient" | "staff" | "dept_head";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}
