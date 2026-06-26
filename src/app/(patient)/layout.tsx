import type { ReactNode } from "react";
import { requirePatient } from "@/lib/auth/session";
import { PatientShell } from "@/components/patient/PatientShell";

export default async function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requirePatient();
  return <PatientShell profile={profile}>{children}</PatientShell>;
}
