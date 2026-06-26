import type { UserProfile } from "@/lib/auth/types";
import { AppShell, type AppNavItem } from "@/components/app/AppShell";

const NAV: AppNavItem[] = [
  { href: "/patient", label: "Home", icon: "home" },
  { href: "/patient/cases", label: "Cases", icon: "folder_shared" },
  {
    href: "/patient/appointments",
    label: "Appointments",
    icon: "calendar_month",
  },
  { href: "/patient/messages", label: "Messages", icon: "mail" },
];

export function PatientShell({
  profile,
  children,
}: {
  profile: UserProfile;
  children: React.ReactNode;
}) {
  return (
    <AppShell
      profile={profile}
      nav={NAV}
      rootHref="/patient"
      portalLabel="Patient portal"
      roleLabel="Patient"
    >
      {children}
    </AppShell>
  );
}
