import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Audit trail for sensitive records. For a medical-records system, "who looked
 * at this and when" matters as much as encryption. Every read/write to cases,
 * reviews, and patients by staff should record a row here.
 *
 * Writes go through a service-role client so the audit row is always recorded
 * regardless of the acting user's RLS scope. NEVER call this with a
 * browser/anon client.
 */

export type AuditAction =
  | "viewed_patient"
  | "created_patient"
  | "updated_patient"
  | "deleted_patient"
  | "viewed_case"
  | "created_case"
  | "updated_case"
  | "updated_diagnosis"
  | "updated_treatment_plan"
  | "deleted_case"
  | "viewed_review"
  | "created_review"
  | "updated_review"
  | "deleted_review";

export type AuditableTable = "patients" | "cases" | "reviews";

export interface AuditEntry {
  userId: string;
  action: AuditAction;
  tableName: AuditableTable;
  recordId: string;
}

/**
 * Record an audit log entry. Failures are logged but do not throw, so an audit
 * write can never break the primary operation — but they are surfaced for
 * monitoring.
 */
export async function recordAudit(
  adminClient: SupabaseClient,
  entry: AuditEntry,
): Promise<void> {
  const { error } = await adminClient.from("audit_logs").insert({
    user_id: entry.userId,
    action: entry.action,
    table_name: entry.tableName,
    record_id: entry.recordId,
  });

  if (error) {
    console.error("[audit] failed to record audit log entry", {
      action: entry.action,
      tableName: entry.tableName,
      recordId: entry.recordId,
      error: error.message,
    });
  }
}

/** Record many audit entries at once (e.g. a list view of several records). */
export async function recordAuditBatch(
  adminClient: SupabaseClient,
  entries: AuditEntry[],
): Promise<void> {
  if (entries.length === 0) return;

  const { error } = await adminClient.from("audit_logs").insert(
    entries.map((e) => ({
      user_id: e.userId,
      action: e.action,
      table_name: e.tableName,
      record_id: e.recordId,
    })),
  );

  if (error) {
    console.error("[audit] failed to record audit log batch", {
      count: entries.length,
      error: error.message,
    });
  }
}
