import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import {
  getStaffDashboardStats,
  getCaseStatusCounts,
  listCases,
} from "@/lib/data/clinical";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusChip } from "@/components/ui/StatusChip";
import {
  StatCard,
  DashboardCard,
  DashboardList,
  DashboardRow,
  AppointmentItem,
  EmptyState,
} from "@/components/app/dashboard";
import { formatTime, greetingName } from "@/lib/format";
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

  const greeting = greetingName(profile.name);

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
          label="Pending review"
          value={String(statusCounts.pending_review)}
          href="/staff/cases"
        />
        <StatCard
          icon="check_circle"
          label="Resolved"
          value={String(statusCounts.resolved)}
        />
      </div>

      <div className="grid gap-xl lg:grid-cols-2">
        <DashboardCard title="Recent cases" viewAllHref="/staff/cases">
          {recentCases.length === 0 ? (
            <EmptyState>No cases assigned yet.</EmptyState>
          ) : (
            <DashboardList>
              {recentCases.slice(0, 5).map((c) => (
                <DashboardRow
                  key={c.id}
                  href={`/staff/cases/${c.id}`}
                  title={c.patient.name}
                  subtitle={
                    <span className="text-data-mono font-mono">
                      {c.patient.patient_code}
                    </span>
                  }
                  trailing={
                    <StatusChip tone={caseStatusTone(c.status)}>
                      {caseStatusLabel(c.status)}
                    </StatusChip>
                  }
                />
              ))}
            </DashboardList>
          )}
        </DashboardCard>

        <DashboardCard
          title="Upcoming appointments"
          viewAllHref="/staff/calendar"
        >
          {stats.upcomingAppointments.length === 0 ? (
            <EmptyState>No scheduled appointments.</EmptyState>
          ) : (
            <DashboardList>
              {stats.upcomingAppointments.map((appt) => (
                <AppointmentItem
                  key={appt.id}
                  date={appt.appointment_date}
                  title={appt.patient_name}
                  subtitle={`${formatTime(appt.appointment_date)} · ${
                    appt.purpose ?? "Appointment"
                  }`}
                />
              ))}
            </DashboardList>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
