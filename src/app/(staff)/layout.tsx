import type { ReactNode } from "react";
import { requireStaff } from "@/lib/auth/session";
import { getInboxUnreadTotal } from "@/lib/data/inbox";
import { StaffShell } from "@/components/staff/StaffShell";

export default async function StaffLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireStaff();
  const unreadCount = await getInboxUnreadTotal();

  return (
    <StaffShell profile={profile} unreadCount={unreadCount}>
      {children}
    </StaffShell>
  );
}
