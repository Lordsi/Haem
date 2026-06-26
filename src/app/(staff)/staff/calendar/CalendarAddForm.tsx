"use client";

import { useActionState, useEffect, useRef } from "react";
import { createEventAction, type CalendarFormState } from "./actions";
import { Icon } from "@/components/ui/Icon";

const initialState: CalendarFormState = { status: "idle" };

const inputClasses =
  "border-outline-variant focus:border-primary focus:ring-primary w-full rounded-md border bg-white px-md py-2.5 text-body-md outline-none focus:ring-1";

const labelClasses =
  "text-label-md text-on-surface-variant mb-xs block font-bold uppercase";

export function CalendarAddForm({ defaultDate }: { defaultDate: string }) {
  const [state, formAction, isPending] = useActionState(
    createEventAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-surface-container-lowest border-outline-variant space-y-md rounded-xl border p-lg"
    >
      <h2 className="text-headline-md text-primary flex items-center gap-sm">
        <Icon name="event_available" className="text-[22px]" />
        Add event
      </h2>

      <div>
        <label htmlFor="title" className={labelClasses}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={2}
          className={inputClasses}
          placeholder="e.g. Outpatient clinic day"
        />
      </div>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <div>
          <label htmlFor="event_date" className={labelClasses}>
            Date
          </label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            required
            defaultValue={defaultDate}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="category" className={labelClasses}>
            Type
          </label>
          <select
            id="category"
            name="category"
            defaultValue="clinic"
            className={inputClasses}
          >
            <option value="clinic">Clinic day</option>
            <option value="meeting">Meeting</option>
            <option value="training">Training</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClasses}>
          Notes (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className={`${inputClasses} resize-y`}
          placeholder="Location, attendees, agenda…"
        />
      </div>

      {state.status === "error" ? (
        <p className="text-on-error-container bg-error-container rounded-md px-md py-2 text-body-sm">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p className="flex items-center gap-xs rounded-md bg-emerald-50 px-md py-2 text-body-sm text-emerald-800">
          <Icon name="check_circle" filled className="text-[18px]" />
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-on-primary inline-flex w-full items-center justify-center gap-sm rounded-lg px-lg py-3 text-body-md font-semibold transition-all hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
      >
        <Icon name="add" className="text-[20px]" />
        {isPending ? "Adding…" : "Add to calendar"}
      </button>
    </form>
  );
}
