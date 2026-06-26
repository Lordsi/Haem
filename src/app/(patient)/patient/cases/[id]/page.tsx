import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePatient } from "@/lib/auth/session";
import {
  getPatientRecord,
  getPatientCaseDetail,
} from "@/lib/data/patient-portal";
import { StatusChip } from "@/components/ui/StatusChip";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { caseStatusTone, caseStatusLabel } from "@/lib/clinical-display";

export const metadata: Metadata = {
  title: "Case Detail | HEMA-Core Patient Portal",
  robots: { index: false },
};

export default async function PatientCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requirePatient();
  const patient = await getPatientRecord(profile.id);
  if (!patient) notFound();

  const { id } = await params;
  const caseDetail = await getPatientCaseDetail(id, patient.id);
  if (!caseDetail) notFound();

  return (
    <div className="space-y-xl">
      <div>
        <Link
          href="/patient/cases"
          className="text-primary text-body-sm mb-md inline-flex items-center gap-xs font-semibold hover:underline"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          All cases
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-md">
          <div>
            <h1 className="text-headline-lg text-primary">Your case</h1>
            <p className="text-body-sm text-on-surface-variant mt-xs">
              Opened {formatDate(caseDetail.created_at)}
              {caseDetail.clinician_name
                ? ` · ${caseDetail.clinician_name}`
                : null}
            </p>
          </div>
          <StatusChip tone={caseStatusTone(caseDetail.status)}>
            {caseStatusLabel(caseDetail.status)}
          </StatusChip>
        </div>
      </div>

      <div className="grid gap-xl lg:grid-cols-2">
        <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
          <h2 className="text-headline-md text-primary mb-md flex items-center gap-sm">
            <Icon name="diagnosis" className="text-[22px]" />
            Diagnosis
          </h2>
          <p className="text-body-md whitespace-pre-wrap">
            {caseDetail.diagnosis ?? "No diagnosis recorded yet."}
          </p>
        </section>

        <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
          <h2 className="text-headline-md text-primary mb-md flex items-center gap-sm">
            <Icon name="medication" className="text-[22px]" />
            Treatment plan
          </h2>
          <p className="text-body-md whitespace-pre-wrap">
            {caseDetail.treatment_plan ?? "No treatment plan recorded yet."}
          </p>
        </section>
      </div>

      <div className="bg-secondary-container text-on-secondary-container rounded-xl p-lg">
        <p className="text-body-sm">
          Detailed clinical review notes are kept in your medical record and are
          only visible to department staff. Use{" "}
          <Link href="/patient/messages" className="font-semibold underline">
            Messages
          </Link>{" "}
          to contact your care team with questions.
        </p>
      </div>
    </div>
  );
}
