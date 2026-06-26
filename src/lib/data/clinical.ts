import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  decryptFields,
  encryptField,
  encryptFields,
} from "@/lib/crypto/fieldEncryption";
import { ENCRYPTED_FIELDS } from "@/lib/crypto/encryptedFields";
import { recordAudit, recordAuditBatch } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/types";

export type CaseStatus =
  | "pending_review"
  | "open"
  | "active"
  | "resolved"
  | "closed";

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
  review_date: string | null;
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
      review_date,
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
  const statuses: CaseStatus[] = [
    "pending_review",
    "open",
    "active",
    "resolved",
    "closed",
  ];
  const counts: Record<CaseStatus, number> = {
    pending_review: 0,
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

/** Patients the current user can attach a new case to (RLS-scoped). */
export async function listPatientsForSelection(): Promise<PatientSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("id, patient_code, name, date_of_birth, sex")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PatientSummary[];
}

export interface NewPatientInput {
  name: string;
  patient_code: string;
  date_of_birth?: string | null;
  sex?: string | null;
  contact_info?: string | null;
}

export interface CreateCaseInput {
  actorId: string;
  existingPatientId?: string | null;
  newPatient?: NewPatientInput | null;
  diagnosis?: string | null;
  treatmentPlan?: string | null;
  reviewDate?: string | null;
}

/**
 * Open a new case. New cases enter the "pending_review" state so a consultant /
 * department head signs off before they go active. Uses the service-role client
 * (caller must already be an authenticated staff member) so the freshly created
 * patient + case rows can be returned before RLS-linking rows exist.
 */
export async function createCase(input: CreateCaseInput): Promise<string> {
  const admin = createAdminClient();

  let patientId = input.existingPatientId ?? null;

  if (!patientId) {
    if (!input.newPatient) {
      throw new Error("A patient is required to open a case.");
    }
    const np = input.newPatient;
    const encrypted = encryptFields(
      { contact_info: np.contact_info ?? null },
      ["contact_info"],
    );

    const { data: patient, error: patientError } = await admin
      .from("patients")
      .insert({
        patient_code: np.patient_code,
        name: np.name,
        date_of_birth: np.date_of_birth || null,
        sex: np.sex || null,
        contact_info: encrypted.contact_info,
        created_by: input.actorId,
      })
      .select("id")
      .single();

    if (patientError) throw patientError;
    patientId = patient.id as string;

    await recordAudit(admin, {
      userId: input.actorId,
      action: "created_patient",
      tableName: "patients",
      recordId: patientId,
    });
  }

  const encryptedCase = encryptFields(
    {
      diagnosis: input.diagnosis ?? null,
      treatment_plan: input.treatmentPlan ?? null,
    },
    ["diagnosis", "treatment_plan"],
  );

  const { data: created, error } = await admin
    .from("cases")
    .insert({
      patient_id: patientId,
      assigned_to: input.actorId,
      diagnosis: encryptedCase.diagnosis,
      treatment_plan: encryptedCase.treatment_plan,
      review_date: input.reviewDate || null,
      status: "pending_review",
    })
    .select("id")
    .single();

  if (error) throw error;
  const caseId = created.id as string;

  await recordAudit(admin, {
    userId: input.actorId,
    action: "created_case",
    tableName: "cases",
    recordId: caseId,
  });

  return caseId;
}

/** Add a consultation / review note to a case (RLS-scoped insert). */
export async function addCaseReview(
  caseId: string,
  authorId: string,
  notes: string,
): Promise<void> {
  const { supabase, admin } = await getClients();

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      case_id: caseId,
      author_id: authorId,
      notes: encryptField(notes),
    })
    .select("id")
    .single();

  if (error) throw error;

  await recordAudit(admin, {
    userId: authorId,
    action: "created_review",
    tableName: "reviews",
    recordId: data.id as string,
  });
}

/** Move a case to a new status (RLS enforces assigned staff / dept head). */
export async function updateCaseStatus(
  caseId: string,
  userId: string,
  status: CaseStatus,
): Promise<void> {
  const { supabase, admin } = await getClients();

  const { error } = await supabase
    .from("cases")
    .update({ status })
    .eq("id", caseId);

  if (error) throw error;

  await recordAudit(admin, {
    userId,
    action: "updated_case",
    tableName: "cases",
    recordId: caseId,
  });
}
