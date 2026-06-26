import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth/session";
import { getCaseDetail, listReviewsForCase } from "@/lib/data/clinical";
import { StatusChip } from "@/components/ui/StatusChip";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { caseStatusTone, caseStatusLabel } from "@/lib/clinical-display";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Case Detail | HEMA-Core Staff",
    robots: { index: false },
  };
}

export default async function StaffCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireStaff();
  const { id } = await params;

  const [caseDetail, reviews] = await Promise.all([
    getCaseDetail(id, profile.id),
    listReviewsForCase(id, profile.id),
  ]);

  if (!caseDetail) notFound();

  const patient = caseDetail.patient;

  return (
    <div className="space-y-xl">
      <div>
        <Link
          href="/staff/cases"
          className="text-primary text-body-sm mb-md inline-flex items-center gap-xs font-semibold hover:underline"
        >
          <Icon name="arrow_back" className="text-[18px]" />
          All cases
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-md">
          <div>
            <h1 className="text-headline-lg text-primary">{patient.name}</h1>
            <p className="text-data-mono text-on-surface-variant mt-xs font-mono">
              {patient.patient_code}
              {patient.date_of_birth
                ? ` · DOB ${formatDate(patient.date_of_birth)}`
                : null}
              {patient.sex ? ` · ${patient.sex}` : null}
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
            {caseDetail.diagnosis ?? "No diagnosis recorded."}
          </p>
        </section>

        <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
          <h2 className="text-headline-md text-primary mb-md flex items-center gap-sm">
            <Icon name="medication" className="text-[22px]" />
            Treatment plan
          </h2>
          <p className="text-body-md whitespace-pre-wrap">
            {caseDetail.treatment_plan ?? "No treatment plan recorded."}
          </p>
        </section>
      </div>

      <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
        <h2 className="text-headline-md text-primary mb-md flex items-center gap-sm">
          <Icon name="clinical_notes" className="text-[22px]" />
          Clinical reviews
        </h2>
        {reviews.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            No review notes yet.
          </p>
        ) : (
          <ul className="space-y-md">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="bg-surface-container-low rounded-lg p-md"
              >
                <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                  <p className="text-body-sm font-semibold">
                    {review.author_name ?? "Unknown author"}
                  </p>
                  <time
                    dateTime={review.review_date}
                    className="text-body-sm text-on-surface-variant"
                  >
                    {formatDate(review.review_date)}
                  </time>
                </div>
                <p className="text-body-md whitespace-pre-wrap">
                  {review.notes ?? "No notes recorded."}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
