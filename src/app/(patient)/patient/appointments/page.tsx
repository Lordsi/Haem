import type { Metadata } from "next";
import { requirePatient } from "@/lib/auth/session";
import {
  getPatientRecord,
  listPatientAppointments,
} from "@/lib/data/patient-portal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatDate, formatTime } from "@/lib/format";
import {
  appointmentStatusTone,
  appointmentStatusLabel,
} from "@/lib/clinical-display";

export const metadata: Metadata = {
  title: "Appointments | HEMA-Core Patient Portal",
  robots: { index: false },
};

export default async function PatientAppointmentsPage() {
  const profile = await requirePatient();
  const patient = await getPatientRecord(profile.id);

  if (!patient) {
    return (
      <p className="text-body-md text-on-surface-variant">
        No clinical record linked to your account.
      </p>
    );
  }

  const appointments = await listPatientAppointments(patient.id);
  const now = new Date().toISOString();
  const upcoming = appointments.filter(
    (a) => a.status === "scheduled" && a.appointment_date >= now,
  );
  const past = appointments.filter(
    (a) => !(a.status === "scheduled" && a.appointment_date >= now),
  );

  return (
    <div className="space-y-xl">
      <SectionHeader
        title="Appointments"
        description="Scheduled and past visits with the hematology department."
      />

      <section>
        <h2 className="text-headline-md text-primary mb-md">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            No upcoming appointments.
          </p>
        ) : (
          <ul className="space-y-md">
            {upcoming.map((appt) => (
              <AppointmentCard key={appt.id} appt={appt} />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 ? (
        <section>
          <h2 className="text-headline-md text-primary mb-md">
            Past & other ({past.length})
          </h2>
          <ul className="space-y-md">
            {past.map((appt) => (
              <AppointmentCard key={appt.id} appt={appt} muted />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function AppointmentCard({
  appt,
  muted = false,
}: {
  appt: {
    id: string;
    appointment_date: string;
    purpose: string | null;
    status: string;
    clinician_name: string | null;
  };
  muted?: boolean;
}) {
  return (
    <li
      className={`border-outline-variant rounded-xl border p-lg ${
        muted
          ? "bg-surface-container-low text-on-surface-variant"
          : "bg-surface-container-lowest"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <p className="text-body-md font-semibold">
            {formatDate(appt.appointment_date)} at{" "}
            {formatTime(appt.appointment_date)}
          </p>
          <p className="text-body-sm mt-xs">
            {appt.purpose ?? "Appointment"}
          </p>
          {appt.clinician_name ? (
            <p className="text-body-sm mt-xs">
              With {appt.clinician_name}
            </p>
          ) : null}
        </div>
        <StatusChip tone={appointmentStatusTone(appt.status)}>
          {appointmentStatusLabel(appt.status)}
        </StatusChip>
      </div>
    </li>
  );
}
