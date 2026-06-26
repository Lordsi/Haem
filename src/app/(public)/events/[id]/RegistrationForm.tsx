"use client";

import { useActionState } from "react";
import { registerForEvent, type RegistrationState } from "../actions";
import { Icon } from "@/components/ui/Icon";

const initialState: RegistrationState = { status: "idle" };

export function RegistrationForm({ eventId }: { eventId: string }) {
  const [state, formAction, isPending] = useActionState(
    registerForEvent,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="border-outline-variant rounded-xl border bg-emerald-50 p-lg">
        <div className="mb-sm flex items-center gap-sm text-emerald-800">
          <Icon name="check_circle" filled className="text-[24px]" />
          <span className="text-headline-md">Registration confirmed</span>
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
      <h3 className="text-headline-md text-primary mb-md">Register to attend</h3>
      <input type="hidden" name="eventId" value={eventId} />

      <div className="space-y-md">
        <div>
          <label
            htmlFor="reg-name"
            className="text-label-md text-on-surface-variant mb-xs block font-bold uppercase"
          >
            Full name
          </label>
          <input
            id="reg-name"
            name="name"
            type="text"
            required
            minLength={2}
            className="border-outline-variant focus:border-primary focus:ring-primary w-full rounded-md border bg-white px-md py-2.5 text-body-md outline-none focus:ring-1"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label
            htmlFor="reg-email"
            className="text-label-md text-on-surface-variant mb-xs block font-bold uppercase"
          >
            Email address
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            required
            className="border-outline-variant focus:border-primary focus:ring-primary w-full rounded-md border bg-white px-md py-2.5 text-body-md outline-none focus:ring-1"
            placeholder="jane@example.com"
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
        className="bg-primary text-on-primary mt-lg inline-flex w-full items-center justify-center gap-sm rounded-lg px-lg py-3 text-body-md font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        {isPending ? "Registering…" : "Confirm registration"}
      </button>
    </form>
  );
}
