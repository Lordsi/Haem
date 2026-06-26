import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { PatientLoginForm } from "./PatientLoginForm";

export const metadata: Metadata = {
  title: "Patient Portal Login | HEMA-Core",
  robots: { index: false },
};

export default async function PatientLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-lg py-xl">
      <div className="bg-surface-container-lowest border-outline-variant w-full max-w-[26rem] rounded-2xl border p-xl">
        <div className="mb-lg text-center">
          <div className="bg-tertiary-fixed text-tertiary mx-auto mb-md flex h-14 w-14 items-center justify-center rounded-full">
            <Icon name="person" className="text-[28px]" />
          </div>
          <h1 className="text-headline-md text-primary mb-sm">Patient Portal</h1>
          <p className="text-body-sm text-on-surface-variant">
            View your appointments, cases, and messages from your hematology
            care team.
          </p>
        </div>
        <PatientLoginForm next={next} />
      </div>
    </main>
  );
}
