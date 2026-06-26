import type { ReactNode } from "react";
import { TopNavBar } from "@/components/public/TopNavBar";
import { Footer } from "@/components/public/Footer";
import {
  getUserProfile,
  getRoleHomePath,
  isStaffRole,
} from "@/lib/auth/session";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getUserProfile();

  // Only staff and patients have a portal to jump into.
  const hasPortal =
    profile != null &&
    (isStaffRole(profile.role) || profile.role === "patient");
  const dashboardHref = hasPortal ? getRoleHomePath(profile!.role) : null;

  return (
    <>
      <TopNavBar
        dashboardHref={dashboardHref}
        userName={profile?.name ?? profile?.email ?? null}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
