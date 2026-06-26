import type { UserProfile } from "@/lib/auth/types";
import { AppShell, type AppNavItem } from "@/components/app/AppShell";

const NAV: AppNavItem[] = [
  { href: "/staff", label: "Dashboard", icon: "dashboard" },
  { href: "/staff/cases", label: "Cases", icon: "folder_shared" },
  { href: "/staff/calendar", label: "Calendar", icon: "calendar_month" },
  { href: "/staff/tasks", label: "Tasks", icon: "task_alt" },
  { href: "/staff/inbox", label: "Inbox", icon: "mail" },
];

export function StaffShell({
  profile,
  unreadCount = 0,
  children,
}: {
  profile: UserProfile;
  unreadCount?: number;
  children: React.ReactNode;
}) {
  const nav = NAV.map((item) =>
    item.href === "/staff/inbox" ? { ...item, badge: unreadCount } : item,
  );

  return (
    <AppShell
      profile={profile}
      nav={nav}
      rootHref="/staff"
      portalLabel="Staff workspace"
      roleLabel={profile.role === "dept_head" ? "Department head" : "Staff"}
    >
      {children}
    </AppShell>
  );
}
