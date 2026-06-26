import type { CaseStatus } from "@/lib/data/clinical";
import type { TaskStatus } from "@/lib/data/tasks";

export function caseStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    open: "Open",
    active: "Active",
    resolved: "Resolved",
    closed: "Closed",
  };
  return labels[status];
}

export function caseStatusTone(
  status: CaseStatus,
): "neutral" | "primary" | "success" | "critical" {
  switch (status) {
    case "active":
      return "primary";
    case "resolved":
      return "success";
    case "closed":
      return "neutral";
    default:
      return "neutral";
  }
}

export function taskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    todo: "To do",
    in_progress: "In progress",
    done: "Done",
  };
  return labels[status];
}

export function taskStatusTone(
  status: TaskStatus,
): "neutral" | "primary" | "success" {
  switch (status) {
    case "in_progress":
      return "primary";
    case "done":
      return "success";
    default:
      return "neutral";
  }
}
