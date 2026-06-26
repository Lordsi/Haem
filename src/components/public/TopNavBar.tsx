"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

const NAV_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function TopNavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="bg-surface-container-lowest border-outline-variant sticky top-0 z-50 border-b">
      <nav className="container-max flex items-center justify-between px-lg py-md">
        <Link href="/" className="flex items-center gap-sm">
          <Icon name="biotech" className="text-primary text-[28px]" />
          <span className="text-headline-md text-primary font-bold">
            HEMA-Core
          </span>
        </Link>

        <div className="hidden items-center gap-xl md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                isActive(link.href)
                  ? "text-body-md text-primary border-primary border-b-2 font-bold"
                  : "text-body-md text-secondary hover:text-primary transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-md">
          <Link
            href="/patient/login"
            className="text-secondary hover:text-primary hidden text-body-sm font-semibold transition-colors sm:inline"
          >
            Patient Portal
          </Link>
          <Link
            href="/staff/login"
            className="bg-primary text-on-primary rounded-full px-lg py-2 text-label-md font-bold transition-opacity hover:opacity-90"
          >
            Staff Login
          </Link>
          <button
            type="button"
            className="text-primary hover:bg-surface-container-high rounded-md p-1 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} className="text-[28px]" />
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-outline-variant border-t md:hidden">
          <div className="container-max flex flex-col px-lg py-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-sm py-3 text-body-md ${
                  isActive(link.href)
                    ? "text-primary font-bold"
                    : "text-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
