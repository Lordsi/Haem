"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserProfile } from "@/lib/auth/types";
import { Icon } from "@/components/ui/Icon";
import { signOut } from "@/app/auth/actions";

const NAV = [
  { href: "/patient", label: "Home", icon: "home" },
  { href: "/patient/cases", label: "Cases", icon: "folder_shared" },
  { href: "/patient/appointments", label: "Appointments", icon: "calendar_month" },
  { href: "/patient/messages", label: "Messages", icon: "mail" },
];

export function PatientShell({
  profile,
  children,
}: {
  profile: UserProfile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/patient"
      ? pathname === "/patient"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="bg-surface-bright min-h-full">
      <header className="bg-surface-container-lowest border-outline-variant border-b">
        <div className="container-max flex items-center justify-between px-lg py-md">
          <Link href="/patient" className="flex items-center gap-sm">
            <Icon name="biotech" className="text-primary text-[24px]" />
            <span className="text-body-md text-primary font-bold">
              HEMA-Core
            </span>
            <span className="text-on-surface-variant hidden text-body-sm sm:inline">
              Patient Portal
            </span>
          </Link>
          <div className="flex items-center gap-md">
            <span className="text-body-sm text-on-surface-variant hidden sm:inline">
              {profile.name ?? profile.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-primary text-body-sm font-semibold hover:underline"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="container-max flex gap-xs overflow-x-auto px-lg pb-md">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex shrink-0 items-center gap-xs rounded-full px-md py-2 text-body-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-secondary-container text-primary"
                  : "text-secondary hover:bg-surface-container-high"
              }`}
            >
              <Icon name={item.icon} className="text-[18px]" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container-max px-lg py-xl">{children}</main>
    </div>
  );
}
