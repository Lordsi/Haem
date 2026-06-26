import { SectionHeader } from "@/components/ui/SectionHeader";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-surface-container-high mb-md h-5 w-24 rounded motion-safe:animate-pulse" />
      <SectionHeader
        title="Open a new case"
        description="Register a case for a patient. It enters the queue for consultant review before going active."
      />
      <div className="bg-surface-container-lowest border-outline-variant space-y-lg rounded-xl border p-lg">
        <div className="flex gap-sm">
          <div className="bg-surface-container-high h-10 w-40 rounded-lg motion-safe:animate-pulse" />
          <div className="bg-surface-container-high h-10 w-36 rounded-lg motion-safe:animate-pulse" />
        </div>
        <div className="bg-surface-container-high h-11 w-full rounded-md motion-safe:animate-pulse" />
        <div className="bg-surface-container-high h-20 w-full rounded-md motion-safe:animate-pulse" />
        <div className="bg-surface-container-high h-20 w-full rounded-md motion-safe:animate-pulse" />
        <div className="bg-surface-container-high h-11 w-40 rounded-lg motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
