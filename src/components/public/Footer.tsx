import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const NAV = [
  { href: "/services", label: "Services" },
  { href: "/news", label: "Research & News" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About Us" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/accessibility", label: "Accessibility" },
];

export function Footer() {
  return (
    <footer className="bg-surface-dim border-outline-variant mt-auto w-full border-t py-xl">
      <div className="container-max flex flex-col gap-xl px-lg md:flex-row md:justify-between">
        <div className="md:w-1/3">
          <div className="mb-md flex items-center gap-sm">
            <Icon name="biotech" className="text-primary text-[28px]" />
            <span className="text-headline-md text-primary font-bold">
              HEMA-Core
            </span>
          </div>
          <p className="text-body-sm text-secondary mb-md leading-relaxed">
            The hematology department&apos;s diagnostic and management
            information system, combining clinical care, research, and patient
            management with a focus on precision and reliability.
          </p>
          <div className="flex gap-md">
            <a
              href="#"
              aria-label="Website"
              className="bg-surface-container text-primary hover:bg-primary hover:text-white flex h-8 w-8 items-center justify-center rounded-full transition-all"
            >
              <Icon name="public" className="text-[18px]" />
            </a>
            <a
              href="#"
              aria-label="Share"
              className="bg-surface-container text-primary hover:bg-primary hover:text-white flex h-8 w-8 items-center justify-center rounded-full transition-all"
            >
              <Icon name="share" className="text-[18px]" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-xl md:w-1/2">
          <div>
            <h5 className="text-label-md text-primary mb-md font-bold uppercase">
              Navigation
            </h5>
            <ul className="space-y-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-secondary hover:text-primary transition-all hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="text-label-md text-primary mb-md font-bold uppercase">
              Legal &amp; Compliance
            </h5>
            <ul className="space-y-sm">
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-secondary hover:text-primary transition-all hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="container-max border-outline-variant mt-xl flex flex-col items-center gap-md border-t px-lg pt-lg md:flex-row md:justify-between">
        <p className="text-body-sm text-secondary text-center md:text-left">
          © {new Date().getFullYear()} Hematology Department. All rights
          reserved.
        </p>
        <div className="flex items-center gap-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-label-md text-secondary">
            SYSTEM STATUS: OPERATIONAL
          </span>
        </div>
      </div>
    </footer>
  );
}
