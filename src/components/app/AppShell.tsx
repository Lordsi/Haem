"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserProfile } from "@/lib/auth/types";
import { Icon } from "@/components/ui/Icon";
import { signOut } from "@/app/auth/actions";

export interface AppNavItem {
  href: string;
  label: string;
  icon: string;
  /** Optional count rendered as a badge (e.g. unread inbox items). */
  badge?: number;
}

/**
 * Shared application shell for every authenticated portal (staff, department
 * head, patient). This is the SINGLE place that owns the workspace chrome —
 * sidebar, gradient, nav styling/active states, badges, mobile nav, the faint
 * microscope watermark, and sign-out. Make portal-wide styling changes here so
 * they apply everywhere; the per-portal wrappers only supply nav config.
 */
export function AppShell({
  profile,
  nav,
  rootHref,
  portalLabel,
  roleLabel,
  children,
}: {
  profile: UserProfile;
  nav: AppNavItem[];
  /** The portal's home route, matched exactly for the active state. */
  rootHref: string;
  /** Subtitle under the HEMA-Core mark, e.g. "Staff workspace". */
  portalLabel: string;
  /** Footer role caption, e.g. "Department head" / "Patient". */
  roleLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === rootHref
      ? pathname === rootHref
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="bg-surface-bright flex min-h-dvh">
      <aside className="from-secondary via-primary to-[#0b1119] text-on-primary sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-gradient-to-b md:flex">
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
            {portalLabel}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-xs px-sm py-md">
          {nav.map((item) => {
            const active = isActive(item.href);
            const badge = item.badge ?? 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-sm rounded-lg px-md py-2.5 text-body-sm font-medium transition-all duration-200 motion-safe:hover:translate-x-0.5 ${
                  active
                    ? "bg-on-tertiary-container/10 text-on-primary"
                    : "text-on-primary/80 hover:bg-on-primary/10"
                }`}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="bg-on-tertiary-container absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full"
                  />
                ) : null}
                <Icon
                  name={item.icon}
                  className={`text-[20px] ${active ? "text-on-tertiary-container" : ""}`}
                />
                {item.label}
                {badge > 0 ? (
                  <span className="bg-on-tertiary-container text-on-tertiary ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-on-primary/10 border-t px-lg py-md">
          <p className="text-body-sm truncate font-medium">
            {profile.name ?? profile.email}
          </p>
          <p className="text-on-primary/60 text-label-md mt-xs uppercase">
            {roleLabel}
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
            <form action={signOut}>
              <button
                type="submit"
                className="text-primary text-body-sm inline-flex items-center gap-xs font-semibold"
              >
                <Icon name="logout" className="text-[18px]" />
                Sign out
              </button>
            </form>
          </div>
          <nav className="mt-sm flex gap-sm overflow-x-auto">
            {nav.map((item) => {
              const active = isActive(item.href);
              const badge = item.badge ?? 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative shrink-0 rounded-md px-sm py-1 text-label-md ${
                    active
                      ? "bg-secondary-container text-primary"
                      : "text-secondary"
                  }`}
                >
                  {item.label}
                  {badge > 0 ? (
                    <span className="bg-tertiary text-on-tertiary absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                      {badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="relative flex-1 overflow-hidden px-lg py-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-6 -right-6 w-[70%] max-w-[26rem] sm:w-[55%]"
          >
            <Image
              src="/login-microscope.png"
              alt=""
              width={520}
              height={520}
              sizes="(min-width: 768px) 26rem, 60vw"
              className="h-auto w-full object-contain opacity-[0.06] mix-blend-multiply"
            />
          </div>
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
