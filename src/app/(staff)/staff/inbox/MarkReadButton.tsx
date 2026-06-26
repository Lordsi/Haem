"use client";

import { useActionState } from "react";
import { Icon } from "@/components/ui/Icon";
import { toggleInboxItemRead, type InboxActionState } from "./actions";

const INITIAL: InboxActionState = { status: "idle" };

export function MarkReadButton({
  kind,
  id,
  isRead,
}: {
  kind: "contact" | "registration";
  id: string;
  isRead: boolean;
}) {
  const [state, action, pending] = useActionState(toggleInboxItemRead, INITIAL);
  const label = isRead ? "Mark as unopened" : "Mark as read";

  return (
    <form action={action} className="flex shrink-0 items-center gap-xs">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="read" value={(!isRead).toString()} />
      {state.status === "error" && state.message ? (
        <span className="text-error text-label-md normal-case">
          {state.message}
        </span>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        title={label}
        aria-label={label}
        className="text-on-surface-variant hover:bg-surface-container-high hover:text-primary focus-visible:ring-primary inline-flex size-9 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon
          name={isRead ? "mark_email_unread" : "check"}
          className="text-[20px]"
        />
      </button>
    </form>
  );
}
