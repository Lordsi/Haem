import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listCases } from "@/lib/data/clinical";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatDate } from "@/lib/format";
import { caseStatusTone, caseStatusLabel } from "@/lib/clinical-display";

export const metadata: Metadata = {
  title: "Cases | HEMA-Core Staff",
  robots: { index: false },
};

export default async function StaffCasesPage() {
  const profile = await requireStaff();
  const cases = await listCases(profile.id);

  return (
    <div>
      <SectionHeader
        title="Patient cases"
        description={
          profile.role === "dept_head"
            ? "All department cases. Sensitive fields are encrypted at rest."
            : "Cases assigned to you. Access is logged for audit."
        }
      />

      {cases.length === 0 ? (
        <div className="bg-surface-container-lowest border-outline-variant rounded-xl border p-xl text-center">
          <p className="text-body-md text-on-surface-variant">
            No cases found in your scope.
          </p>
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
    </div>
  );
}
