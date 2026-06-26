import type { CaseStatus } from "@/lib/data/clinical";
import type { TaskStatus } from "@/lib/data/tasks";

export function caseStatusLabel(status: CaseStatus): string {
  const labels: Record<CaseStatus, string> = {
    pending_review: "Pending consultant review",
    open: "Open",
    active: "Active",
    resolved: "Resolved",
    closed: "Closed",
  };
  return labels[status];
}

export function caseStatusTone(
  status: CaseStatus,
): "neutral" | "primary" | "success" | "critical" | "warning" {
  switch (status) {
    case "pending_review":
      return "warning";
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

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";

export function appointmentStatusLabel(status: string): string {
  const labels: Record<AppointmentStatus, string> = {
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No show",
  };
  return labels[status as AppointmentStatus] ?? status;
}

export function appointmentStatusTone(
  status: string,
): "neutral" | "primary" | "success" | "critical" {
  switch (status) {
    case "scheduled":
      return "primary";
    case "completed":
      return "success";
    case "cancelled":
    case "no_show":
      return "critical";
    default:
      return "neutral";
  }
}
