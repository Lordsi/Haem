"use server";

import { revalidatePath } from "next/cache";
import type { TaskStatus } from "@/lib/data/tasks";
import { updateTaskStatus } from "@/lib/data/tasks";

export type TaskActionState = {
  status: "idle" | "error";
  message?: string;
};

const VALID: TaskStatus[] = ["todo", "in_progress", "done"];

export async function setTaskStatus(
  _prev: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const taskId = String(formData.get("taskId") ?? "");
  const status = String(formData.get("status") ?? "") as TaskStatus;

  if (!taskId || !VALID.includes(status)) {
    return { status: "error", message: "Invalid task update." };
  }

  const result = await updateTaskStatus(taskId, status);
  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  revalidatePath("/staff/tasks");
  revalidatePath("/staff");
  return { status: "idle" };
}
