"use client";

import { useActionState } from "react";
import type { TaskStatus } from "@/lib/data/tasks";
import { taskStatusLabel } from "@/lib/clinical-display";
import { setTaskStatus, type TaskActionState } from "./actions";

const INITIAL: TaskActionState = { status: "idle" };

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export function TaskStatusSelect({
  taskId,
  current,
}: {
  taskId: string;
  current: TaskStatus;
}) {
  const [state, action, pending] = useActionState(setTaskStatus, INITIAL);

  return (
    <form action={action} className="inline">
      <input type="hidden" name="taskId" value={taskId} />
      <select
        name="status"
        defaultValue={current}
        disabled={pending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="border-outline-variant bg-surface-container-lowest text-body-sm rounded-lg border px-sm py-1.5 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        aria-label="Update task status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {taskStatusLabel(s)}
          </option>
        ))}
      </select>
      {state.status === "error" && state.message ? (
        <span className="text-error text-body-sm ml-sm">{state.message}</span>
      ) : null}
    </form>
  );
}
