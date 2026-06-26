import "server-only";

import { decryptFields } from "@/lib/crypto/fieldEncryption";
import { ENCRYPTED_FIELDS } from "@/lib/crypto/encryptedFields";
import { createClient } from "@/lib/supabase/server";
import type { CaseStatus } from "@/lib/data/clinical";

export interface PatientRecord {
  id: string;
  patient_code: string;
  name: string;
  date_of_birth: string | null;
  sex: string | null;
  contact_info: string | null;
}

export interface PatientCaseSummary {
  id: string;
  status: CaseStatus;
  updated_at: string;
  created_at: string;
  assigned_to: string | null;
  clinician_name: string | null;
}

export interface PatientCaseDetail extends PatientCaseSummary {
  diagnosis: string | null;
  treatment_plan: string | null;
}

export interface PatientAppointment {
  id: string;
  appointment_date: string;
  purpose: string | null;
  status: string;
  staff_id: string | null;
  clinician_name: string | null;
}

export interface PatientMessage {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
  sender_name: string | null;
  is_mine: boolean;
}

export interface CareTeamMember {
  id: string;
  name: string | null;
  email: string | null;
}

function decryptPatient<T extends Record<string, unknown>>(row: T): T {
  return decryptFields(row, ENCRYPTED_FIELDS.patients);
}

function decryptCase<T extends Record<string, unknown>>(row: T): T {
  return decryptFields(row, ENCRYPTED_FIELDS.cases);
}

/** Resolve the patient row linked to the logged-in user. */
export async function getPatientRecord(
  userId: string,
): Promise<PatientRecord | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("patients")
    .select("id, patient_code, name, date_of_birth, sex, contact_info")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const decrypted = decryptPatient(data as Record<string, unknown>);
  return decrypted as unknown as PatientRecord;
}

/** Clinicians assigned to the patient's cases or appointments. */
export async function getCareTeam(patientId: string): Promise<CareTeamMember[]> {
  const supabase = await createClient();

  const { data: cases } = await supabase
    .from("cases")
    .select("assigned_to")
    .eq("patient_id", patientId)
    .not("assigned_to", "is", null);

  const { data: appointments } = await supabase
    .from("appointments")
    .select("staff_id")
    .eq("patient_id", patientId)
    .not("staff_id", "is", null);

  const ids = new Set<string>();
  for (const row of cases ?? []) {
    if (row.assigned_to) ids.add(row.assigned_to);
  }
  for (const row of appointments ?? []) {
    if (row.staff_id) ids.add(row.staff_id);
  }

  if (ids.size === 0) return [];

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email")
    .in("id", [...ids]);

  if (error) throw error;
  return (data ?? []) as CareTeamMember[];
}

export async function listPatientCases(
  patientId: string,
): Promise<PatientCaseSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cases")
    .select(
      `
      id,
      status,
      updated_at,
      created_at,
      assigned_to,
      clinician:users!cases_assigned_to_fkey ( name )
    `,
    )
    .eq("patient_id", patientId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const clinician = row.clinician as unknown as { name: string | null } | null;
    return {
      id: row.id,
      status: row.status as CaseStatus,
      updated_at: row.updated_at,
      created_at: row.created_at,
      assigned_to: row.assigned_to,
      clinician_name: clinician?.name ?? null,
    };
  });
}

export async function getPatientCaseDetail(
  caseId: string,
  patientId: string,
): Promise<PatientCaseDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cases")
    .select(
      `
      id,
      status,
      diagnosis,
      treatment_plan,
      updated_at,
      created_at,
      assigned_to,
      patient_id,
      clinician:users!cases_assigned_to_fkey ( name )
    `,
    )
    .eq("id", caseId)
    .eq("patient_id", patientId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const decrypted = decryptCase(data as Record<string, unknown>);
  const clinician = decrypted.clinician as { name: string | null } | null;

  return {
    id: decrypted.id as string,
    status: decrypted.status as CaseStatus,
    diagnosis: decrypted.diagnosis as string | null,
    treatment_plan: decrypted.treatment_plan as string | null,
    updated_at: decrypted.updated_at as string,
    created_at: decrypted.created_at as string,
    assigned_to: decrypted.assigned_to as string | null,
    clinician_name: clinician?.name ?? null,
  };
}

export async function listPatientAppointments(
  patientId: string,
): Promise<PatientAppointment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      appointment_date,
      purpose,
      status,
      staff_id,
      clinician:users!appointments_staff_id_fkey ( name )
    `,
    )
    .eq("patient_id", patientId)
    .order("appointment_date", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const clinician = row.clinician as unknown as { name: string | null } | null;
    return {
      id: row.id,
      appointment_date: row.appointment_date,
      purpose: row.purpose,
      status: row.status,
      staff_id: row.staff_id,
      clinician_name: clinician?.name ?? null,
    };
  });
}

export async function listPatientMessages(
  userId: string,
): Promise<PatientMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      sender_id,
      receiver_id,
      body,
      read_at,
      created_at,
      sender:users!messages_sender_id_fkey ( name )
    `,
    )
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const sender = row.sender as unknown as { name: string | null } | null;
    return {
      id: row.id,
      sender_id: row.sender_id,
      receiver_id: row.receiver_id,
      body: row.body,
      read_at: row.read_at,
      created_at: row.created_at,
      sender_name: sender?.name ?? null,
      is_mine: row.sender_id === userId,
    };
  });
}

export async function sendPatientMessage(
  senderId: string,
  receiverId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = body.trim();
  if (trimmed.length < 2) {
    return { ok: false, message: "Message is too short." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert({
    sender_id: senderId,
    receiver_id: receiverId,
    body: trimmed,
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

export async function markMessageRead(
  messageId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("receiver_id", userId)
    .is("read_at", null);
}

/** Dashboard overview for the patient portal home page. */
export async function getPatientDashboard(userId: string) {
  const patient = await getPatientRecord(userId);
  if (!patient) {
    return { patient: null, activeCases: 0, upcomingAppointments: [], unreadMessages: 0 };
  }

  const [cases, appointments, messages] = await Promise.all([
    listPatientCases(patient.id),
    listPatientAppointments(patient.id),
    listPatientMessages(userId),
  ]);

  const now = new Date().toISOString();
  const upcomingAppointments = appointments
    .filter((a) => a.status === "scheduled" && a.appointment_date >= now)
    .slice(0, 3);

  const activeCases = cases.filter((c) =>
    ["open", "active"].includes(c.status),
  ).length;

  const unreadMessages = messages.filter(
    (m) => !m.is_mine && !m.read_at,
  ).length;

  return {
    patient,
    activeCases,
    recentCases: cases.slice(0, 3),
    upcomingAppointments,
    unreadMessages,
  };
}
