import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listCalendarEntries, type CalendarEntry } from "@/lib/data/calendar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { CalendarAddForm } from "./CalendarAddForm";

export const metadata: Metadata = {
  title: "Calendar | HEMA-Core Staff",
  robots: { index: false },
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function ymd(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function parseMonth(m?: string): { year: number; month: number } {
  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [y, mo] = m.split("-").map(Number);
    if (mo >= 1 && mo <= 12) return { year: y, month: mo };
  }
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function chipClass(entry: CalendarEntry): string {
  if (entry.type === "review") {
    return "bg-tertiary-fixed text-on-tertiary-container";
  }
  switch (entry.category) {
    case "clinic":
      return "bg-secondary-container text-on-secondary-container";
    case "meeting":
      return "bg-primary/10 text-primary";
    case "training":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-surface-container-highest text-on-surface-variant";
  }
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  await requireStaff();
  const { m } = await searchParams;
  const { year, month } = parseMonth(m);

  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leadOffset = (firstOfMonth.getUTCDay() + 6) % 7; // Monday-start grid
  const totalCells = Math.ceil((leadOffset + daysInMonth) / 7) * 7;

  const gridStart = new Date(firstOfMonth);
  gridStart.setUTCDate(gridStart.getUTCDate() - leadOffset);
  const gridEnd = new Date(gridStart);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + totalCells - 1);

  const entries = await listCalendarEntries(ymd(gridStart), ymd(gridEnd));
  const byDate = new Map<string, CalendarEntry[]>();
  for (const e of entries) {
    const arr = byDate.get(e.date) ?? [];
    arr.push(e);
    byDate.set(e.date, arr);
  }

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(gridStart);
    d.setUTCDate(d.getUTCDate() + i);
    const key = ymd(d);
    return {
      key,
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month - 1,
      entries: byDate.get(key) ?? [],
    };
  });

  const todayKey = ymd(new Date());
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(firstOfMonth);

  const prev = month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const prevHref = `/staff/calendar?m=${prev.year}-${pad(prev.month)}`;
  const nextHref = `/staff/calendar?m=${next.year}-${pad(next.month)}`;

  const now = new Date();
  const isCurrentMonth =
    year === now.getUTCFullYear() && month === now.getUTCMonth() + 1;
  const defaultDate = isCurrentMonth ? todayKey : ymd(firstOfMonth);

  return (
    <div>
      <SectionHeader
        title="Department calendar"
        description="Shared schedule of clinic days, meetings, training, and case review dates."
      />

      <div className="grid gap-xl lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-surface-container-lowest border-outline-variant overflow-hidden rounded-xl border">
            <div className="border-outline-variant flex items-center justify-between gap-md border-b px-lg py-md">
              <h2 className="text-headline-md text-primary">{monthLabel}</h2>
              <div className="flex items-center gap-xs">
                <Link
                  href="/staff/calendar"
                  className="text-body-sm text-primary hover:bg-surface-container-high rounded-md px-md py-1.5 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Today
                </Link>
                <Link
                  href={prevHref}
                  aria-label="Previous month"
                  className="text-on-surface-variant hover:bg-surface-container-high inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icon name="chevron_left" className="text-[22px]" />
                </Link>
                <Link
                  href={nextHref}
                  aria-label="Next month"
                  className="text-on-surface-variant hover:bg-surface-container-high inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Icon name="chevron_right" className="text-[22px]" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-outline-variant">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-label-md text-on-surface-variant px-xs py-sm text-center uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {cells.map((cell) => {
                const isToday = cell.key === todayKey;
                const extra = cell.entries.length - 3;
                return (
                  <div
                    key={cell.key}
                    className={`border-outline-variant min-h-20 border-b border-r p-xs sm:min-h-24 ${
                      cell.inMonth
                        ? "bg-surface-container-lowest"
                        : "bg-surface-container-low/40"
                    }`}
                  >
                    <div className="flex justify-end">
                      <span
                        className={`text-label-md inline-flex h-6 w-6 items-center justify-center rounded-full ${
                          isToday
                            ? "bg-primary text-on-primary font-bold"
                            : cell.inMonth
                              ? "text-on-surface"
                              : "text-on-surface-variant/50"
                        }`}
                      >
                        {cell.day}
                      </span>
                    </div>
                    <div className="mt-xs space-y-0.5">
                      {cell.entries.slice(0, 3).map((entry) => {
                        const className = `block truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${chipClass(entry)}`;
                        const label =
                          entry.type === "review"
                            ? `Review: ${entry.title}`
                            : entry.title;
                        return entry.href ? (
                          <Link
                            key={entry.id}
                            href={entry.href}
                            title={label}
                            className={`${className} transition-opacity hover:opacity-80`}
                          >
                            {label}
                          </Link>
                        ) : (
                          <span key={entry.id} title={label} className={className}>
                            {label}
                          </span>
                        );
                      })}
                      {extra > 0 ? (
                        <p className="text-on-surface-variant px-1.5 text-[11px]">
                          +{extra} more
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-md flex flex-wrap items-center gap-md">
            <LegendDot className="bg-secondary-container" label="Clinic day" />
            <LegendDot className="bg-primary/30" label="Meeting" />
            <LegendDot className="bg-amber-200" label="Training" />
            <LegendDot className="bg-tertiary-fixed" label="Case review" />
          </div>
        </div>

        <div className="lg:col-span-1">
          <CalendarAddForm defaultDate={defaultDate} />
        </div>
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="text-body-sm text-on-surface-variant inline-flex items-center gap-xs">
      <span className={`inline-block h-3 w-3 rounded-sm ${className}`} />
      {label}
    </span>
  );
}
