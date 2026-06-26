import type { Metadata } from "next";
import { requirePatient } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatDate } from "@/lib/format";
import { caseStatusTone, caseStatusLabel } from "@/lib/clinical-display";

export const metadata: Metadata = {
  title: "Patient Portal | HEMA-Core",
  robots: { index: false },
};

export default async function PatientPortalPage() {
  const profile = await requirePatient();
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("id, patient_code, name")
    .eq("user_id", profile.id)
    .maybeSingle();

  const { data: cases } = patient
    ? await supabase
        .from("cases")
        .select("id, status, updated_at")
        .eq("patient_id", patient.id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  const { data: appointments } = patient
    ? await supabase
        .from("appointments")
        .select("id, appointment_date, purpose, status")
        .eq("patient_id", patient.id)
        .eq("status", "scheduled")
        .gte("appointment_date", new Date().toISOString())
        .order("appointment_date", { ascending: true })
        .limit(5)
    : { data: [] };

  return (
    <div className="space-y-xl">
      <div>
        <h1 className="text-headline-lg text-primary">
          Welcome, {profile.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-body-md text-on-surface-variant mt-sm">
          Your hematology care summary. Full messaging and document access
          arrive in a later phase.
        </p>
      </div>

      {!patient ? (
        <div className="bg-surface-container-lowest border-outline-variant rounded-xl border p-xl">
          <p className="text-body-md text-on-surface-variant">
            No clinical record is linked to your account yet. Contact the
            department if you believe this is an error.
          </p>
        </div>
      ) : (
        <>
          <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
            <h2 className="text-headline-md text-primary mb-md">Your record</h2>
            <p className="text-body-md font-semibold">{patient.name}</p>
            <p className="text-data-mono text-on-surface-variant font-mono">
              {patient.patient_code}
            </p>
          </section>

          <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
            <h2 className="text-headline-md text-primary mb-md">Your cases</h2>
            {(cases ?? []).length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">
                No active cases on file.
              </p>
            ) : (
              <ul className="space-y-md">
                {(cases ?? []).map((c) => (
                  <li
                    key={c.id}
                    className="bg-surface-container-low flex items-center justify-between rounded-lg p-md"
                  >
                    <span className="text-body-sm text-on-surface-variant">
                      Updated {formatDate(c.updated_at)}
                    </span>
                    <StatusChip tone={caseStatusTone(c.status)}>
                      {caseStatusLabel(c.status)}
                    </StatusChip>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
            <h2 className="text-headline-md text-primary mb-md">
              Upcoming appointments
            </h2>
            {(appointments ?? []).length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">
                No upcoming appointments scheduled.
              </p>
            ) : (
              <ul className="space-y-sm">
                {(appointments ?? []).map((appt) => (
                  <li key={appt.id} className="text-body-md">
                    <span className="font-semibold">
                      {formatDate(appt.appointment_date)}
                    </span>
                    {appt.purpose ? (
                      <span className="text-on-surface-variant">
                        {" "}
                        — {appt.purpose}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
