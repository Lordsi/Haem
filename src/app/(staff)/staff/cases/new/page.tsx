import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/auth/session";
import { listPatientsForSelection } from "@/lib/data/clinical";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { NewCaseForm } from "./NewCaseForm";

export const metadata: Metadata = {
  title: "New Case | HEMA-Core Staff",
  robots: { index: false },
};

export default async function NewCasePage() {
  const [, patients] = await Promise.all([
    requireStaff(),
    listPatientsForSelection(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/staff/cases"
        className="text-primary text-body-sm mb-md inline-flex items-center gap-xs font-semibold hover:underline"
      >
        <Icon name="arrow_back" className="text-[18px]" />
        All cases
      </Link>

      <SectionHeader
        title="Open a new case"
        description="Register a case for a patient. It enters the queue for consultant review before going active."
      />

      <NewCaseForm patients={patients} />
    </div>
  );
}
