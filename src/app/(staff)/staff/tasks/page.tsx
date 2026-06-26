import type { Metadata } from "next";
import { requireStaff } from "@/lib/auth/session";
import { listTasksForUser } from "@/lib/data/tasks";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusChip } from "@/components/ui/StatusChip";
import { formatDate } from "@/lib/format";
import { taskStatusTone, taskStatusLabel } from "@/lib/clinical-display";
import { TaskStatusSelect } from "./TaskStatusSelect";

export const metadata: Metadata = {
  title: "Tasks | HEMA-Core Staff",
  robots: { index: false },
};

export default async function StaffTasksPage() {
  const profile = await requireStaff();
  const tasks = await listTasksForUser(profile.id);

  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-xl">
      <SectionHeader
        title="Tasks"
        description="Your assigned work items. Status changes are saved immediately."
      />

      <section>
        <h2 className="text-headline-md text-primary mb-md">
          Open ({open.length})
        </h2>
        {open.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            No open tasks. You&apos;re all caught up.
          </p>
        ) : (
          <ul className="space-y-md">
            {open.map((task) => (
              <li
                key={task.id}
                className="bg-surface-container-lowest border-outline-variant rounded-xl border p-lg"
              >
                <div className="flex flex-wrap items-start justify-between gap-md">
                  <div className="min-w-0 flex-1">
                    <p className="text-body-md font-semibold">{task.title}</p>
                    {task.description ? (
                      <p className="text-body-sm text-on-surface-variant mt-xs">
                        {task.description}
                      </p>
                    ) : null}
                    <div className="mt-sm flex flex-wrap items-center gap-sm">
                      {task.due_date ? (
                        <span className="text-body-sm text-on-surface-variant">
                          Due {formatDate(task.due_date)}
                        </span>
                      ) : null}
                      {task.assigner_name ? (
                        <span className="text-body-sm text-on-surface-variant">
                          Assigned by {task.assigner_name}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-md">
                    <StatusChip tone={taskStatusTone(task.status)}>
                      {taskStatusLabel(task.status)}
                    </StatusChip>
                    <TaskStatusSelect taskId={task.id} current={task.status} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 ? (
        <section>
          <h2 className="text-headline-md text-primary mb-md">
            Completed ({done.length})
          </h2>
          <ul className="space-y-sm">
            {done.map((task) => (
              <li
                key={task.id}
                className="bg-surface-container-low text-on-surface-variant flex items-center justify-between rounded-lg px-lg py-md"
              >
                <span className="text-body-sm line-through">{task.title}</span>
                <TaskStatusSelect taskId={task.id} current={task.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
