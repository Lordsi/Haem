import type { Metadata } from "next";
import Link from "next/link";
import { requirePatient } from "@/lib/auth/session";
import {
  getPatientRecord,
  listPatientCases,
} from "@/lib/data/patient-portal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatDate } from "@/lib/format";
import { caseStatusTone, caseStatusLabel } from "@/lib/clinical-display";

export const metadata: Metadata = {
  title: "My Cases | HEMA-Core Patient Portal",
  robots: { index: false },
};

export default async function PatientCasesPage() {
  const profile = await requirePatient();
  const patient = await getPatientRecord(profile.id);

  if (!patient) {
    return (
      <p className="text-body-md text-on-surface-variant">
        No clinical record linked to your account.
      </p>
    );
  }

  const cases = await listPatientCases(patient.id);

  return (
    <div>
      <SectionHeader
        title="My cases"
        description="Your diagnosis and treatment plan. Internal clinical notes are only visible to your care team."
      />

      {cases.length === 0 ? (
        <div className="bg-surface-container-lowest border-outline-variant rounded-xl border p-xl text-center">
          <p className="text-body-md text-on-surface-variant">
            No cases on file.
          </p>
        </div>
      ) : (
        <ul className="space-y-md">
          {cases.map((c) => (
            <li key={c.id}>
              <Link
                href={`/patient/cases/${c.id}`}
                className="bg-surface-container-lowest border-outline-variant hover:bg-surface-container-low block rounded-xl border p-lg transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-md">
                  <div>
                    <p className="text-body-md font-semibold">
                      Hematology case
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      Updated {formatDate(c.updated_at)}
                      {c.clinician_name
                        ? ` · Clinician: ${c.clinician_name}`
                        : null}
                    </p>
                  </div>
                  <StatusChip tone={caseStatusTone(c.status)}>
                    {caseStatusLabel(c.status)}
                  </StatusChip>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
