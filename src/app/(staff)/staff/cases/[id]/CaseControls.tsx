"use client";

import { useActionState } from "react";
import {
  addReviewAction,
  updateStatusAction,
  type CaseActionState,
} from "./actions";
import { Icon } from "@/components/ui/Icon";
import { caseStatusLabel } from "@/lib/clinical-display";
import type { CaseStatus } from "@/lib/data/clinical";

const initialState: CaseActionState = { status: "idle" };

const SELECTABLE_STATUSES: CaseStatus[] = [
  "pending_review",
  "active",
  "resolved",
  "closed",
];

const inputClasses =
  "border-outline-variant focus:border-primary focus:ring-primary w-full rounded-md border bg-white px-md py-2.5 text-body-md outline-none focus:ring-1";

export function CaseStatusControl({
  caseId,
  current,
}: {
  caseId: string;
  current: CaseStatus;
}) {
  const [state, formAction, isPending] = useActionState(
    updateStatusAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-sm"
    >
      <input type="hidden" name="case_id" value={caseId} />
      <div>
        <label htmlFor="status" className="text-label-md text-on-surface-variant mb-xs block font-bold uppercase">
          Update status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={current}
          className={inputClasses}
        >
          {SELECTABLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {caseStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-on-primary inline-flex items-center justify-center gap-xs rounded-lg px-lg py-2.5 text-body-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        <Icon name="check" className="text-[18px]" />
        {isPending ? "Saving…" : "Save"}
      </button>
      {state.status === "error" ? (
        <span className="text-on-error-container text-body-sm">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}

export function AddReviewForm({ caseId }: { caseId: string }) {
  const [state, formAction, isPending] = useActionState(
    addReviewAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-sm">
      <input type="hidden" name="case_id" value={caseId} />
      <label htmlFor="notes" className="text-label-md text-on-surface-variant block font-bold uppercase">
        Add a review note
      </label>
      <textarea
        id="notes"
        name="notes"
        rows={3}
        required
        minLength={2}
        className={`${inputClasses} resize-y`}
        placeholder="Consultant comment, progress note, or sign-off…"
      />
      <div className="flex items-center gap-md">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary text-on-primary inline-flex items-center justify-center gap-xs rounded-lg px-lg py-2.5 text-body-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          <Icon name="add_comment" className="text-[18px]" />
          {isPending ? "Saving…" : "Post note"}
        </button>
        {state.status === "error" ? (
          <span className="text-on-error-container text-body-sm">
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
