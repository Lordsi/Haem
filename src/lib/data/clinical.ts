import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptFields } from "@/lib/crypto/fieldEncryption";
import { ENCRYPTED_FIELDS } from "@/lib/crypto/encryptedFields";
import { recordAudit, recordAuditBatch } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/types";

export type CaseStatus = "open" | "active" | "resolved" | "closed";

export interface PatientSummary {
  id: string;
  patient_code: string;
  name: string;
  date_of_birth: string | null;
  sex: string | null;
}

export interface CaseSummary {
  id: string;
  patient_id: string;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
  assigned_to: string | null;
  patient: PatientSummary;
}

export interface CaseDetail extends CaseSummary {
  diagnosis: string | null;
  treatment_plan: string | null;
}

export interface ReviewRecord {
  id: string;
  case_id: string;
  author_id: string | null;
  notes: string | null;
  review_date: string;
  created_at: string;
  author_name: string | null;
}

export interface AppointmentSummary {
  id: string;
  patient_id: string;
  appointment_date: string;
  purpose: string | null;
  status: string;
  patient_name: string;
}

async function getClients(): Promise<{
  supabase: SupabaseClient;
  admin: SupabaseClient;
}> {
  return {
    supabase: await createClient(),
    admin: createAdminClient(),
  };
}

function decryptPatient<T extends Record<string, unknown>>(row: T): T {
  return decryptFields(row, ENCRYPTED_FIELDS.patients);
}

function decryptCase<T extends Record<string, unknown>>(row: T): T {
  return decryptFields(row, ENCRYPTED_FIELDS.cases);
}

function decryptReview<T extends Record<string, unknown>>(row: T): T {
  return decryptFields(row, ENCRYPTED_FIELDS.reviews);
}

/** List cases visible to the current user (RLS-scoped). */
export async function listCases(userId: string): Promise<CaseSummary[]> {
  const { supabase, admin } = await getClients();

  const { data, error } = await supabase
    .from("cases")
    .select(
      `
      id,
      patient_id,
      status,
      created_at,
      updated_at,
      assigned_to,
      patient:patients (
        id,
        patient_code,
        name,
        date_of_birth,
        sex
      )
    `,
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const cases = (data ?? []) as unknown as CaseSummary[];

  await recordAuditBatch(
    admin,
    cases.map((c) => ({
      userId,
      action: "viewed_case" as const,
      tableName: "cases" as const,
      recordId: c.id,
    })),
  );

  return cases;
}

/** Fetch a single case with decrypted clinical fields. */
export async function getCaseDetail(
  caseId: string,
  userId: string,
): Promise<CaseDetail | null> {
  const { supabase, admin } = await getClients();

  const { data, error } = await supabase
    .from("cases")
    .select(
      `
      id,
      patient_id,
      status,
      diagnosis,
      treatment_plan,
      created_at,
      updated_at,
      assigned_to,
      patient:patients (
        id,
        patient_code,
        name,
        date_of_birth,
        sex,
        contact_info
      )
    `,
    )
    .eq("id", caseId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const decrypted = decryptCase(data as Record<string, unknown>);
  const patient = decrypted.patient as Record<string, unknown> | null;
  if (patient) {
    decrypted.patient = decryptPatient(patient);
  }

  await recordAudit(admin, {
    userId,
    action: "viewed_case",
    tableName: "cases",
    recordId: caseId,
  });

  return decrypted as unknown as CaseDetail;
}

/** List reviews for a case with decrypted notes. */
export async function listReviewsForCase(
  caseId: string,
  userId: string,
): Promise<ReviewRecord[]> {
  const { supabase, admin } = await getClients();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      case_id,
      author_id,
      notes,
      review_date,
      created_at,
      author:users ( name )
    `,
    )
    .eq("case_id", caseId)
    .order("review_date", { ascending: false });

  if (error) throw error;

  const reviews = (data ?? []).map((row) => {
    const decrypted = decryptReview(row as Record<string, unknown>);
    const author = decrypted.author as { name: string | null } | null;
    return {
      id: decrypted.id as string,
      case_id: decrypted.case_id as string,
      author_id: decrypted.author_id as string | null,
      notes: decrypted.notes as string | null,
      review_date: decrypted.review_date as string,
      created_at: decrypted.created_at as string,
      author_name: author?.name ?? null,
    };
  });

  await recordAuditBatch(
    admin,
    reviews.map((r) => ({
      userId,
      action: "viewed_review" as const,
      tableName: "reviews" as const,
      recordId: r.id,
    })),
  );

  return reviews;
}

/** Dashboard stats for the staff workspace. */
export async function getStaffDashboardStats(userId: string, role: UserRole) {
  const { supabase } = await getClients();

  const [casesResult, tasksResult, appointmentsResult] = await Promise.all([
    supabase
      .from("cases")
      .select("id, status", { count: "exact" })
      .in("status", ["open", "active"]),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("assigned_to", userId)
      .neq("status", "done"),
    supabase
      .from("appointments")
      .select(
        `
        id,
        patient_id,
        appointment_date,
        purpose,
        status,
        patient:patients ( name )
      `,
      )
      .eq("status", "scheduled")
      .gte("appointment_date", new Date().toISOString())
      .order("appointment_date", { ascending: true })
      .limit(5),
  ]);

  if (casesResult.error) throw casesResult.error;
  if (tasksResult.error) throw tasksResult.error;
  if (appointmentsResult.error) throw appointmentsResult.error;

  const activeCases = casesResult.count ?? 0;
  const openTasks = tasksResult.count ?? 0;

  const upcomingAppointments = (appointmentsResult.data ?? []).map((row) => {
    const patient = row.patient as unknown as { name: string } | null;
    return {
      id: row.id as string,
      patient_id: row.patient_id as string,
      appointment_date: row.appointment_date as string,
      purpose: row.purpose as string | null,
      status: row.status as string,
      patient_name: patient?.name ?? "Unknown",
    } satisfies AppointmentSummary;
  });

  return {
    activeCases,
    openTasks,
    upcomingAppointments,
    role,
  };
}

/** Count cases grouped by status for overview cards. */
export async function getCaseStatusCounts(): Promise<Record<CaseStatus, number>> {
  const supabase = await createClient();
  const statuses: CaseStatus[] = ["open", "active", "resolved", "closed"];
  const counts: Record<CaseStatus, number> = {
    open: 0,
    active: 0,
    resolved: 0,
    closed: 0,
  };

  const results = await Promise.all(
    statuses.map((status) =>
      supabase
        .from("cases")
        .select("id", { count: "exact", head: true })
        .eq("status", status),
    ),
  );

  statuses.forEach((status, i) => {
    counts[status] = results[i].count ?? 0;
  });

  return counts;
}
