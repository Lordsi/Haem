import type { Metadata } from "next";
import { requirePatient } from "@/lib/auth/session";
import { getPatientDashboard } from "@/lib/data/patient-portal";
import { StatusChip } from "@/components/ui/StatusChip";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  StatCard,
  DashboardCard,
  DashboardList,
  DashboardRow,
  AppointmentItem,
  EmptyState,
} from "@/components/app/dashboard";
import { formatDate, formatTime, greetingName } from "@/lib/format";
import {
  caseStatusTone,
  caseStatusLabel,
  appointmentStatusTone,
  appointmentStatusLabel,
} from "@/lib/clinical-display";

export const metadata: Metadata = {
  title: "Patient Portal | HEMA-Core",
  robots: { index: false },
};

export default async function PatientPortalPage() {
  const profile = await requirePatient();
  const dashboard = await getPatientDashboard(profile.id);
  const greeting = greetingName(profile.name);

  if (!dashboard.patient) {
    return (
      <div className="space-y-xl">
        <SectionHeader
          title={`Welcome, ${greeting}`}
          description="Your hematology care overview."
        />
        <div className="bg-surface-container-lowest border-outline-variant rounded-xl border p-xl">
          <p className="text-body-md text-on-surface-variant">
            No clinical record is linked to your account yet. Contact the
            hematology department if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  const { patient, activeCases, recentCases, upcomingAppointments, unreadMessages } =
    dashboard;

  return (
    <div className="space-y-xl">
      <SectionHeader
        title={`Welcome, ${greeting}`}
        description="Your hematology care overview: cases, appointments, and messages with your care team."
      />

      <div className="grid gap-md sm:grid-cols-3">
        <StatCard
          icon="folder_shared"
          label="Active cases"
          value={String(activeCases)}
          href="/patient/cases"
        />
        <StatCard
          icon="calendar_month"
          label="Upcoming visits"
          value={String(upcomingAppointments.length)}
          href="/patient/appointments"
        />
        <StatCard
          icon="mail"
          label="Unread messages"
          value={String(unreadMessages)}
          href="/patient/messages"
        />
      </div>

      <DashboardCard title="Your record">
        <p className="text-body-md font-semibold">{patient.name}</p>
        <p className="text-data-mono text-on-surface-variant font-mono">
          {patient.patient_code}
        </p>
        {patient.date_of_birth ? (
          <p className="text-body-sm text-on-surface-variant mt-xs">
            Date of birth: {formatDate(patient.date_of_birth)}
          </p>
        ) : null}
      </DashboardCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <DashboardCard title="Your cases" viewAllHref="/patient/cases">
          {recentCases.length === 0 ? (
            <EmptyState>No cases on file.</EmptyState>
          ) : (
            <DashboardList>
              {recentCases.map((c) => (
                <DashboardRow
                  key={c.id}
                  href={`/patient/cases/${c.id}`}
                  title={`${caseStatusLabel(c.status)} case`}
                  subtitle={
                    <>
                      Updated {formatDate(c.updated_at)}
                      {c.clinician_name ? ` · ${c.clinician_name}` : null}
                    </>
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
          viewAllHref="/patient/appointments"
        >
          {upcomingAppointments.length === 0 ? (
            <EmptyState>No upcoming appointments scheduled.</EmptyState>
          ) : (
            <DashboardList>
              {upcomingAppointments.map((appt) => (
                <AppointmentItem
                  key={appt.id}
                  date={appt.appointment_date}
                  title={appt.purpose ?? "Appointment"}
                  subtitle={
                    <>
                      {formatTime(appt.appointment_date)}
                      {appt.clinician_name ? ` · ${appt.clinician_name}` : null}
                    </>
                  }
                  trailing={
                    <StatusChip tone={appointmentStatusTone(appt.status)}>
                      {appointmentStatusLabel(appt.status)}
                    </StatusChip>
                  }
                />
              ))}
            </DashboardList>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}
