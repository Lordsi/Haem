import type { ReactNode } from "react";
import { requireStaff } from "@/lib/auth/session";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireStaff();

  return <StaffShell profile={profile}>{children}</StaffShell>;
}
