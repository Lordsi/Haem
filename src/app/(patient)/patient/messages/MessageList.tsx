"use client";

import { markPatientMessageReadAction } from "./actions";
import type { PatientMessage } from "@/lib/data/patient-portal";
import { formatDate, formatTime } from "@/lib/format";

export function MessageList({ messages }: { messages: PatientMessage[] }) {
  if (messages.length === 0) {
    return (
      <p className="text-body-sm text-on-surface-variant">
        No messages yet. Send your care team a question using the form above.
      </p>
    );
  }

  return (
    <ul className="space-y-md">
      {messages.map((msg) => (
        <li
          key={msg.id}
          className={`rounded-xl border p-lg ${
            msg.is_mine
              ? "bg-secondary-container border-outline-variant ml-md"
              : !msg.read_at
                ? "bg-surface-container-lowest border-primary"
                : "bg-surface-container-lowest border-outline-variant"
          }`}
        >
          <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
            <p className="text-body-sm font-semibold">
              {msg.is_mine ? "You" : (msg.sender_name ?? "Care team")}
            </p>
            <time
              dateTime={msg.created_at}
              className="text-body-sm text-on-surface-variant"
            >
              {formatDate(msg.created_at)} {formatTime(msg.created_at)}
            </time>
          </div>
          <p className="text-body-md whitespace-pre-wrap">{msg.body}</p>
          {!msg.is_mine && !msg.read_at ? (
            <form action={markPatientMessageReadAction} className="mt-md">
              <input type="hidden" name="messageId" value={msg.id} />
              <button
                type="submit"
                className="text-primary text-body-sm font-semibold hover:underline"
              >
                Mark as read
              </button>
            </form>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
