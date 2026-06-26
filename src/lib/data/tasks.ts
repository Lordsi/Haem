import "server-only";

import { createClient } from "@/lib/supabase/server";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  assigned_to: string | null;
  assigned_by: string | null;
  assigner_name: string | null;
}

/** List tasks assigned to the current user (RLS-scoped). */
export async function listTasksForUser(userId: string): Promise<TaskRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      description,
      status,
      due_date,
      created_at,
      assigned_to,
      assigned_by,
      assigner:users!tasks_assigned_by_fkey ( name )
    `,
    )
    .eq("assigned_to", userId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const assigner = row.assigner as unknown as { name: string | null } | null;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status as TaskStatus,
      due_date: row.due_date,
      created_at: row.created_at,
      assigned_to: row.assigned_to,
      assigned_by: row.assigned_by,
      assigner_name: assigner?.name ?? null,
    };
  });
}

/** Update a task's status (RLS ensures only assignee or dept head can update). */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

/** Create a task (staff can assign to themselves; dept_head can assign to anyone). */
export async function createTask(input: {
  title: string;
  description?: string;
  assignedTo: string;
  assignedBy: string;
  dueDate?: string;
}): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      description: input.description ?? null,
      assigned_to: input.assignedTo,
      assigned_by: input.assignedBy,
      due_date: input.dueDate ?? null,
      status: "todo",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, id: data.id };
}
