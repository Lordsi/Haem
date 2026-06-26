"use client";

import { useActionState, useState } from "react";
import { createCaseAction, type NewCaseState } from "./actions";
import { Icon } from "@/components/ui/Icon";
import type { PatientSummary } from "@/lib/data/clinical";

const initialState: NewCaseState = { status: "idle" };

const inputClasses =
  "border-outline-variant focus:border-primary focus:ring-primary w-full rounded-md border bg-white px-md py-2.5 text-body-md outline-none focus:ring-1";

const labelClasses =
  "text-label-md text-on-surface-variant mb-xs block font-bold uppercase";

export function NewCaseForm({ patients }: { patients: PatientSummary[] }) {
  const [state, formAction, isPending] = useActionState(
    createCaseAction,
    initialState,
  );
  const hasPatients = patients.length > 0;
  const [mode, setMode] = useState<"existing" | "new">(
    hasPatients ? "existing" : "new",
  );

  return (
    <form
      action={formAction}
      className="bg-surface-container-lowest border-outline-variant space-y-lg rounded-xl border p-lg"
    >
      <fieldset className="space-y-md">
        <legend className={labelClasses}>Patient</legend>
        <div className="flex flex-wrap gap-sm">
          <ModeToggle
            active={mode === "existing"}
            disabled={!hasPatients}
            onClick={() => setMode("existing")}
            icon="person_search"
            label="Existing patient"
          />
          <ModeToggle
            active={mode === "new"}
            onClick={() => setMode("new")}
            icon="person_add"
            label="New patient"
          />
        </div>
        <input type="hidden" name="patient_mode" value={mode} />

        {mode === "existing" ? (
          <div>
            <label htmlFor="patient_id" className={labelClasses}>
              Select patient
            </label>
            <select
              id="patient_id"
              name="patient_id"
              className={inputClasses}
              defaultValue=""
            >
              <option value="" disabled>
                Choose a patient…
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.patient_code}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <div>
              <label htmlFor="new_name" className={labelClasses}>
                Full name
              </label>
              <input
                id="new_name"
                name="new_name"
                type="text"
                minLength={2}
                className={inputClasses}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label htmlFor="new_patient_code" className={labelClasses}>
                Patient code (optional)
              </label>
              <input
                id="new_patient_code"
                name="new_patient_code"
                type="text"
                className={inputClasses}
                placeholder="Auto-generated if blank"
              />
            </div>
            <div>
              <label htmlFor="new_dob" className={labelClasses}>
                Date of birth
              </label>
              <input
                id="new_dob"
                name="new_dob"
                type="date"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="new_sex" className={labelClasses}>
                Sex
              </label>
              <select
                id="new_sex"
                name="new_sex"
                className={inputClasses}
                defaultValue=""
              >
                <option value="">Not specified</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="new_contact" className={labelClasses}>
                Contact info (encrypted)
              </label>
              <input
                id="new_contact"
                name="new_contact"
                type="text"
                className={inputClasses}
                placeholder="Phone or email"
              />
            </div>
          </div>
        )}
      </fieldset>

      <div>
        <label htmlFor="diagnosis" className={labelClasses}>
          Diagnosis (optional)
        </label>
        <textarea
          id="diagnosis"
          name="diagnosis"
          rows={3}
          className={`${inputClasses} resize-y`}
          placeholder="Provisional diagnosis or presenting findings…"
        />
      </div>

      <div>
        <label htmlFor="treatment_plan" className={labelClasses}>
          Treatment plan (optional)
        </label>
        <textarea
          id="treatment_plan"
          name="treatment_plan"
          rows={3}
          className={`${inputClasses} resize-y`}
          placeholder="Proposed workup or management…"
        />
      </div>

      <div className="sm:max-w-xs">
        <label htmlFor="review_date" className={labelClasses}>
          Review date
        </label>
        <input
          id="review_date"
          name="review_date"
          type="date"
          className={inputClasses}
        />
        <p className="text-body-sm text-on-surface-variant mt-xs">
          Shows on the shared department calendar.
        </p>
      </div>

      <div className="bg-amber-50 border-amber-200 text-amber-800 flex items-start gap-sm rounded-lg border p-md">
        <Icon name="pending_actions" className="text-[20px]" />
        <p className="text-body-sm">
          New cases open as <strong>Pending consultant review</strong>. A
          department head signs off before the case becomes active.
        </p>
      </div>

      {state.status === "error" ? (
        <p className="text-on-error-container bg-error-container rounded-md px-md py-2 text-body-sm">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-on-primary inline-flex items-center justify-center gap-sm rounded-lg px-xl py-3 text-body-md font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        <Icon name="add" className="text-[20px]" />
        {isPending ? "Opening case…" : "Open case"}
      </button>
    </form>
  );
}

function ModeToggle({
  active,
  disabled = false,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-xs rounded-lg border px-md py-2 text-body-sm font-semibold transition-colors disabled:opacity-40 ${
        active
          ? "border-primary bg-secondary-container text-on-secondary-container"
          : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
      }`}
    >
      <Icon name={icon} className="text-[18px]" />
      {label}
    </button>
  );
}
