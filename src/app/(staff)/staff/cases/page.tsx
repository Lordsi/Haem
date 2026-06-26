import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listCases } from "@/lib/data/clinical";
import { StatusChip } from "@/components/ui/StatusChip";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";
import { caseStatusTone, caseStatusLabel } from "@/lib/clinical-display";

export const metadata: Metadata = {
  title: "Cases | HEMA-Core Staff",
  robots: { index: false },
};

export default async function StaffCasesPage() {
  const profile = await requireStaff();
  const cases = await listCases(profile.id);
  const isEmpty = cases.length === 0;

  return (
    <div>
      <div className="mb-xl max-w-[42rem]">
        <h2 className="text-headline-lg text-primary">Patient cases</h2>
        <p className="text-body-md text-on-surface-variant mt-sm">
          {profile.role === "dept_head"
            ? "All department cases. Sensitive fields are encrypted at rest."
            : "Cases assigned to you. Access is logged for audit."}
        </p>
      </div>

      {isEmpty ? (
        <div className="bg-surface-container-lowest border-outline-variant rounded-xl border px-lg py-xl text-center">
          <div className="bg-secondary-container text-primary mx-auto mb-md flex h-14 w-14 items-center justify-center rounded-full">
            <Icon name="folder_open" className="text-[28px]" />
          </div>
          <h3 className="text-headline-md text-primary">No cases yet</h3>
          <p className="text-body-md text-on-surface-variant mx-auto mt-sm max-w-md">
            {profile.role === "dept_head"
              ? "No cases have been opened in the department yet."
              : "You have no cases assigned yet."}{" "}
            Open a new case to start tracking a patient through review.
          </p>
          <div className="mt-lg flex justify-center">
            <Button href="/staff/cases/new">
              <Icon name="add" className="text-[20px]" />
              Open a new case
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border-outline-variant overflow-hidden rounded-xl border">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-outline-variant border-b">
              <tr>
                <th className="text-label-md text-on-surface-variant px-lg py-md uppercase">
                  Patient
                </th>
                <th className="text-label-md text-on-surface-variant hidden px-lg py-md uppercase sm:table-cell">
                  Code
                </th>
                <th className="text-label-md text-on-surface-variant px-lg py-md uppercase">
                  Status
                </th>
                <th className="text-label-md text-on-surface-variant hidden px-lg py-md uppercase md:table-cell">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-outline-variant divide-y">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-low">
                  <td className="px-lg py-md">
                    <Link
                      href={`/staff/cases/${c.id}`}
                      className="text-body-md text-primary font-semibold hover:underline"
                    >
                      {c.patient.name}
                    </Link>
                  </td>
                  <td className="text-data-mono text-on-surface-variant hidden px-lg py-md font-mono sm:table-cell">
                    {c.patient.patient_code}
                  </td>
                  <td className="px-lg py-md">
                    <StatusChip tone={caseStatusTone(c.status)}>
                      {caseStatusLabel(c.status)}
                    </StatusChip>
                  </td>
                  <td className="text-body-sm text-on-surface-variant hidden px-lg py-md md:table-cell">
                    {formatDate(c.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isEmpty ? (
        <Link
          href="/staff/cases/new"
          aria-label="Open a new case"
          className="bg-primary text-on-primary fixed bottom-6 right-6 z-30 inline-flex items-center gap-sm rounded-full px-lg py-3 text-body-md font-semibold shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Icon name="add" className="text-[22px]" />
          New case
        </Link>
      ) : null}
    </div>
  );
}
