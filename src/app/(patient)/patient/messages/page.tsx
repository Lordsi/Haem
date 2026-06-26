import type { Metadata } from "next";
import { requirePatient } from "@/lib/auth/session";
import {
  getCareTeam,
  getPatientRecord,
  listPatientMessages,
} from "@/lib/data/patient-portal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ComposeMessageForm } from "./ComposeMessageForm";
import { MessageList } from "./MessageList";

export const metadata: Metadata = {
  title: "Messages | HEMA-Core Patient Portal",
  robots: { index: false },
};

export default async function PatientMessagesPage() {
  const profile = await requirePatient();
  const patient = await getPatientRecord(profile.id);

  if (!patient) {
    return (
      <p className="text-body-md text-on-surface-variant">
        No clinical record linked to your account.
      </p>
    );
  }

  const [messages, careTeam] = await Promise.all([
    listPatientMessages(profile.id),
    getCareTeam(patient.id),
  ]);

  return (
    <div className="space-y-xl">
      <SectionHeader
        title="Messages"
        description="Secure messages between you and your hematology care team."
      />

      <section className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg">
        <h2 className="text-headline-md text-primary mb-md">New message</h2>
        <ComposeMessageForm careTeam={careTeam} />
      </section>

      <section>
        <h2 className="text-headline-md text-primary mb-md">Conversation</h2>
        <MessageList messages={messages} />
      </section>
    </div>
  );
}
