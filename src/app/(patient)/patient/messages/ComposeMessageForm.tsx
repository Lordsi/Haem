"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import type { CareTeamMember } from "@/lib/data/patient-portal";
import {
  submitPatientMessage,
  type MessageActionState,
} from "./actions";

const INITIAL: MessageActionState = { status: "idle" };

export function ComposeMessageForm({
  careTeam,
}: {
  careTeam: CareTeamMember[];
}) {
  const [state, action, pending] = useActionState(
    submitPatientMessage,
    INITIAL,
  );

  if (careTeam.length === 0) {
    return (
      <p className="text-body-sm text-on-surface-variant">
        No care team members are assigned yet. Contact the department if you
        need to reach your clinician.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-md">
      <div>
        <label
          htmlFor="receiverId"
          className="text-label-md text-on-surface-variant mb-xs block uppercase"
        >
          To
        </label>
        <select
          id="receiverId"
          name="receiverId"
          required
          className="border-outline-variant bg-surface-container-lowest text-body-md w-full rounded-lg border px-md py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select care team member</option>
          {careTeam.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name ?? member.email ?? "Clinician"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="body"
          className="text-label-md text-on-surface-variant mb-xs block uppercase"
        >
          Message
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={4}
          placeholder="Ask a question about your care, appointments, or results…"
          className="border-outline-variant bg-surface-container-lowest text-body-md w-full resize-y rounded-lg border px-md py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="bg-error-container text-on-error-container text-body-sm rounded-lg px-md py-sm"
        >
          {state.message}
        </p>
      ) : null}

      {state.status === "success" && state.message ? (
        <p
          role="status"
          className="bg-emerald-100 text-emerald-800 text-body-sm rounded-lg px-md py-sm"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
