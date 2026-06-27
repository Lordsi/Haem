import type { ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { dateParts } from "@/lib/format";

/**
 * Shared dashboard building blocks used by BOTH the staff and patient portals.
 * Keep portal home pages visually identical by composing these primitives
 * rather than re-styling cards/lists per portal.
 */

const CARD = "bg-surface-container-lowest border-outline-variant rounded-xl border";
const ROW = "bg-surface-container-low rounded-lg p-md";

/** Compact metric tile (icon + value + label), optionally linking somewhere. */
export function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon name={icon} className="text-primary text-[24px]" />
      <div>
        <p className="text-data-mono text-primary font-mono text-2xl font-bold">
          {value}
        </p>
        <p className="text-body-sm text-on-surface-variant">{label}</p>
      </div>
    </>
  );

  const className = `${CARD} flex items-center gap-md p-lg`;

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} hover:bg-surface-container-low transition-colors`}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

/** Titled content card with an optional "View all" action in the header. */
export function DashboardCard({
  title,
  viewAllHref,
  children,
  className = "",
}: {
  title: string;
  viewAllHref?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${CARD} p-lg ${className}`}>
      <div className="mb-md flex items-center justify-between gap-md">
        <h2 className="text-headline-md text-primary">{title}</h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-primary text-body-sm font-semibold hover:underline"
          >
            View all
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-body-sm text-on-surface-variant">{children}</p>;
}

export function DashboardList({ children }: { children: ReactNode }) {
  return <ul className="space-y-sm">{children}</ul>;
}

/** Generic list row: title + subtitle on the left, trailing slot on the right. */
export function DashboardRow({
  href,
  title,
  subtitle,
  trailing,
}: {
  href?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}) {
  const content = (
    <>
      <div className="min-w-0">
        <p className="text-body-md truncate font-semibold">{title}</p>
        {subtitle ? (
          <div className="text-body-sm text-on-surface-variant">{subtitle}</div>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className={`${ROW} hover:bg-surface-container flex items-center justify-between gap-md transition-colors`}
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li className={`${ROW} flex items-center justify-between gap-md`}>
      {content}
    </li>
  );
}

/** Appointment list row with a month/day date pill, shared across portals. */
export function AppointmentItem({
  date,
  title,
  subtitle,
  trailing,
}: {
  date: string;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}) {
  const { month, day } = dateParts(date);
  return (
    <li className={`${ROW} flex items-start gap-md`}>
      <div className="bg-secondary-container text-primary flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg">
        <span className="text-label-md leading-none">{month}</span>
        <span className="text-body-sm font-bold leading-none">{day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body-md font-semibold">{title}</p>
        {subtitle ? (
          <p className="text-body-sm text-on-surface-variant">{subtitle}</p>
        ) : null}
        {trailing ? <div className="mt-sm">{trailing}</div> : null}
      </div>
    </li>
  );
}
