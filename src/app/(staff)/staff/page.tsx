import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import {
  getStaffDashboardStats,
  getCaseStatusCounts,
  listCases,
} from "@/lib/data/clinical";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusChip } from "@/components/ui/StatusChip";
import { Icon } from "@/components/ui/Icon";
import { formatTime } from "@/lib/format";
import { caseStatusTone, caseStatusLabel } from "@/lib/clinical-display";

export const metadata: Metadata = {
  title: "Staff Dashboard | HEMA-Core",
  robots: { index: false },
};

export default async function StaffDashboardPage() {
  const profile = await requireStaff();
  const [stats, statusCounts, recentCases] = await Promise.all([
    getStaffDashboardStats(profile.id, profile.role),
    getCaseStatusCounts(),
    listCases(profile.id),
  ]);

  const greeting = profile.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-xl">
      <SectionHeader
        title={`Good day, ${greeting}`}
        description={
          profile.role === "dept_head"
            ? "Department overview of all cases and team activity."
            : "Your assigned cases, tasks, and upcoming appointments."
        }
      />

      <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="folder_shared"
          label="Active cases"
          value={String(stats.activeCases)}
          href="/staff/cases"
        />
        <StatCard
          icon="task_alt"
          label="Open tasks"
          value={String(stats.openTasks)}
          href="/staff/tasks"
        />
        <StatCard
          icon="pending_actions"
          label="Open"
          value={String(statusCounts.open)}
        />
        <StatCard
          icon="check_circle"
          label="Resolved"
          value={String(statusCounts.resolved)}
        />
      </div>

      <div className="grid gap-xl lg:grid-cols-2">
        <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
          <div className="mb-md flex items-center justify-between">
            <h2 className="text-headline-md text-primary">Recent cases</h2>
            <Link
              href="/staff/cases"
              className="text-primary text-body-sm font-semibold hover:underline"
            >
              View all
            </Link>
          </div>
          {recentCases.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              No cases assigned yet.
            </p>
          ) : (
            <ul className="divide-outline-variant divide-y">
              {recentCases.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/staff/cases/${c.id}`}
                    className="hover:bg-surface-container-low -mx-sm flex items-center justify-between rounded-lg px-sm py-md transition-colors"
                  >
                    <div>
                      <p className="text-body-md font-semibold">
                        {c.patient.name}
                      </p>
                      <p className="text-data-mono text-on-surface-variant font-mono">
                        {c.patient.patient_code}
                      </p>
                    </div>
                    <StatusChip tone={caseStatusTone(c.status)}>
                      {caseStatusLabel(c.status)}
                    </StatusChip>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
          <h2 className="text-headline-md text-primary mb-md">
            Upcoming appointments
          </h2>
          {stats.upcomingAppointments.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              No scheduled appointments.
            </p>
          ) : (
            <ul className="space-y-md">
              {stats.upcomingAppointments.map((appt) => (
                <li
                  key={appt.id}
                  className="bg-surface-container-low flex gap-md rounded-lg p-md"
                >
                  <div className="bg-secondary-container text-primary flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg">
                    <span className="text-label-md leading-none">
                      {new Date(appt.appointment_date)
                        .toLocaleDateString("en-US", { month: "short" })
                        .toUpperCase()}
                    </span>
                    <span className="text-body-sm font-bold leading-none">
                      {new Date(appt.appointment_date).getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-body-md font-semibold">
                      {appt.patient_name}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {formatTime(appt.appointment_date)} ·{" "}
                      {appt.purpose ?? "Appointment"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({
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

  const className =
    "bg-surface-container-lowest border-outline-variant flex items-center gap-md rounded-xl border p-lg";

  if (href) {
    return (
      <Link href={href} className={`${className} hover:bg-surface-container-low transition-colors`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
