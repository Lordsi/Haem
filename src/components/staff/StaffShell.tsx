"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserProfile } from "@/lib/auth/types";
import { Icon } from "@/components/ui/Icon";
import { signOut } from "@/app/auth/actions";

const NAV = [
  { href: "/staff", label: "Dashboard", icon: "dashboard" },
  { href: "/staff/cases", label: "Cases", icon: "folder_shared" },
  { href: "/staff/tasks", label: "Tasks", icon: "task_alt" },
];

export function StaffShell({
  profile,
  children,
}: {
  profile: UserProfile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/staff"
      ? pathname === "/staff"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="bg-surface-bright flex min-h-full">
      <aside className="bg-primary text-on-primary hidden w-60 shrink-0 flex-col md:flex">
        <div className="border-on-primary/10 border-b px-lg py-lg">
          <Link
            href="/"
            className="flex items-center gap-sm"
            title="Back to HEMA-Core home"
          >
            <Icon name="biotech" className="text-[24px]" />
            <span className="text-body-md font-bold">HEMA-Core</span>
          </Link>
          <p className="text-on-primary/70 text-label-md mt-sm uppercase tracking-wide">
            Staff workspace
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-xs px-sm py-md">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-sm rounded-lg px-md py-2.5 text-body-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-on-primary/15 text-on-primary"
                  : "text-on-primary/80 hover:bg-on-primary/10"
              }`}
            >
              <Icon name={item.icon} className="text-[20px]" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-on-primary/10 border-t px-lg py-md">
          <p className="text-body-sm truncate font-medium">
            {profile.name ?? profile.email}
          </p>
          <p className="text-on-primary/60 text-label-md mt-xs uppercase">
            {profile.role === "dept_head" ? "Department head" : "Staff"}
          </p>
          <form action={signOut} className="mt-md">
            <button
              type="submit"
              className="text-on-primary/80 hover:text-on-primary text-body-sm inline-flex items-center gap-xs"
            >
              <Icon name="logout" className="text-[18px]" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-surface-container-lowest border-outline-variant border-b px-lg py-md md:hidden">
          <div className="flex items-center justify-between gap-md">
            <Link
              href="/"
              className="text-body-md text-primary font-bold"
              title="Back to HEMA-Core home"
            >
              HEMA-Core
            </Link>
            <nav className="flex gap-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-sm py-1 text-label-md ${
                    isActive(item.href)
                      ? "bg-secondary-container text-primary"
                      : "text-secondary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 px-lg py-xl">{children}</main>
      </div>
    </div>
  );
}
