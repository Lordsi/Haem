import type { Metadata } from "next";
import Link from "next/link";
import { requirePatient } from "@/lib/auth/session";
import { getPatientDashboard } from "@/lib/data/patient-portal";
import { StatusChip } from "@/components/ui/StatusChip";
import { Icon } from "@/components/ui/Icon";
import { formatDate, formatTime } from "@/lib/format";
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
  const greeting = profile.name?.split(" ")[0] ?? "there";

  if (!dashboard.patient) {
    return (
      <div className="space-y-md">
        <h1 className="text-headline-lg text-primary">Welcome, {greeting}</h1>
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
      <div>
        <h1 className="text-headline-lg text-primary">Welcome, {greeting}</h1>
        <p className="text-body-md text-on-surface-variant mt-sm">
          Your hematology care overview — cases, appointments, and messages with
          your care team.
        </p>
      </div>

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

      <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
        <h2 className="text-headline-md text-primary mb-md">Your record</h2>
        <p className="text-body-md font-semibold">{patient.name}</p>
        <p className="text-data-mono text-on-surface-variant font-mono">
          {patient.patient_code}
        </p>
        {patient.date_of_birth ? (
          <p className="text-body-sm text-on-surface-variant mt-xs">
            Date of birth: {formatDate(patient.date_of_birth)}
          </p>
        ) : null}
      </section>

      <div className="grid gap-xl lg:grid-cols-2">
        <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
          <div className="mb-md flex items-center justify-between">
            <h2 className="text-headline-md text-primary">Your cases</h2>
            <Link
              href="/patient/cases"
              className="text-primary text-body-sm font-semibold hover:underline"
            >
              View all
            </Link>
          </div>
          {recentCases.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              No cases on file.
            </p>
          ) : (
            <ul className="space-y-md">
              {recentCases.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/patient/cases/${c.id}`}
                    className="bg-surface-container-low hover:bg-surface-container flex items-center justify-between rounded-lg p-md transition-colors"
                  >
                    <div>
                      <p className="text-body-md font-semibold">
                        {caseStatusLabel(c.status)} case
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        Updated {formatDate(c.updated_at)}
                        {c.clinician_name ? ` · ${c.clinician_name}` : null}
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
          <div className="mb-md flex items-center justify-between">
            <h2 className="text-headline-md text-primary">Upcoming appointments</h2>
            <Link
              href="/patient/appointments"
              className="text-primary text-body-sm font-semibold hover:underline"
            >
              View all
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="text-body-sm text-on-surface-variant">
              No upcoming appointments scheduled.
            </p>
          ) : (
            <ul className="space-y-md">
              {upcomingAppointments.map((appt) => (
                <li
                  key={appt.id}
                  className="bg-surface-container-low rounded-lg p-md"
                >
                  <p className="text-body-md font-semibold">
                    {formatDate(appt.appointment_date)} at{" "}
                    {formatTime(appt.appointment_date)}
                  </p>
                  <p className="text-body-sm text-on-surface-variant">
                    {appt.purpose ?? "Appointment"}
                    {appt.clinician_name ? ` · ${appt.clinician_name}` : null}
                  </p>
                  <StatusChip
                    tone={appointmentStatusTone(appt.status)}
                    className="mt-sm"
                  >
                    {appointmentStatusLabel(appt.status)}
                  </StatusChip>
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
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low flex items-center gap-md rounded-xl border p-lg transition-colors"
    >
      <Icon name={icon} className="text-primary text-[24px]" />
      <div>
        <p className="text-data-mono text-primary font-mono text-2xl font-bold">
          {value}
        </p>
        <p className="text-body-sm text-on-surface-variant">{label}</p>
      </div>
    </Link>
  );
}
