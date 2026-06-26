"use client";

import { useActionState } from "react";
import { submitContactMessage, type ContactState } from "./actions";
import { Icon } from "@/components/ui/Icon";

const initialState: ContactState = { status: "idle" };

const inputClasses =
  "border-outline-variant focus:border-primary focus:ring-primary w-full rounded-md border bg-white px-md py-2.5 text-body-md outline-none focus:ring-1";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactMessage,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="border-outline-variant rounded-xl border bg-emerald-50 p-lg">
        <div className="mb-sm flex items-center gap-sm text-emerald-800">
          <Icon name="check_circle" filled className="text-[24px]" />
          <span className="text-headline-md">Message sent</span>
        </div>
        <p className="text-body-sm text-on-surface-variant">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg"
    >
      <div className="space-y-md">
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          <div>
            <label
              htmlFor="c-name"
              className="text-label-md text-on-surface-variant mb-xs block font-bold uppercase"
            >
              Full name
            </label>
            <input id="c-name" name="name" type="text" required minLength={2} className={inputClasses} placeholder="Jane Doe" />
          </div>
          <div>
            <label
              htmlFor="c-email"
              className="text-label-md text-on-surface-variant mb-xs block font-bold uppercase"
            >
              Email
            </label>
            <input id="c-email" name="email" type="email" required className={inputClasses} placeholder="jane@example.com" />
          </div>
        </div>
        <div>
          <label
            htmlFor="c-subject"
            className="text-label-md text-on-surface-variant mb-xs block font-bold uppercase"
          >
            Subject
          </label>
          <input id="c-subject" name="subject" type="text" className={inputClasses} placeholder="How can we help?" />
        </div>
        <div>
          <label
            htmlFor="c-body"
            className="text-label-md text-on-surface-variant mb-xs block font-bold uppercase"
          >
            Message
          </label>
          <textarea
            id="c-body"
            name="body"
            required
            minLength={10}
            rows={6}
            className={`${inputClasses} resize-y`}
            placeholder="Write your message…"
          />
        </div>
      </div>

      {state.status === "error" ? (
        <p className="text-on-error-container bg-error-container mt-md rounded-md px-md py-2 text-body-sm">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-on-primary mt-lg inline-flex items-center justify-center gap-sm rounded-lg px-xl py-3 text-body-md font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
