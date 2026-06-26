/**
 * Seed sandbox auth users + profiles for every role in public.user_role.
 *
 * Run: npm run seed:users
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and encryption
 * keys in .env.local. Idempotent — safe to re-run.
 */
import { createClient } from "@supabase/supabase-js";
import { encryptField } from "../src/lib/crypto/fieldEncryption";

const SANDBOX_PASSWORD = "HemaCore-Sandbox-2026!";

type UserRole = "public_user" | "patient" | "staff" | "dept_head";

interface SampleUserSpec {
  email: string;
  name: string;
  role: UserRole;
  blurb: string;
}

const SAMPLE_USERS: SampleUserSpec[] = [
  {
    email: "public.demo@hema-core.test",
    name: "Alex Rivera",
    role: "public_user",
    blurb: "Registered public site member (news, events, contact). No clinical record.",
  },
  {
    email: "patient.demo@hema-core.test",
    name: "Jordan Mbeki",
    role: "patient",
    blurb: "Patient portal account linked to demo hematology case.",
  },
  {
    email: "staff.demo@hema-core.test",
    name: "Dr. Sam Okonkwo",
    role: "staff",
    blurb: "Consultant hematologist; assigned to the demo patient case.",
  },
  {
    email: "head.demo@hema-core.test",
    name: "Prof. Naledi Khumalo",
    role: "dept_head",
    blurb: "Department head with full directory and oversight access.",
  },
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment (.env.local).`);
  }
  return value;
}

async function findUserByEmail(
  admin: ReturnType<typeof createClient>,
  email: string,
) {
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

async function ensureAuthUser(
  admin: ReturnType<typeof createClient>,
  spec: SampleUserSpec,
) {
  let user = await findUserByEmail(admin, spec.email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: spec.email,
      password: SANDBOX_PASSWORD,
      email_confirm: true,
      user_metadata: { name: spec.name, role: spec.role },
    });
    if (error) throw new Error(`${spec.email}: ${error.message}`);
    user = data.user;
    console.log(`  created auth user  ${spec.email} (${spec.role})`);
  } else {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password: SANDBOX_PASSWORD,
      user_metadata: { name: spec.name, role: spec.role },
    });
    if (error) throw new Error(`${spec.email} update: ${error.message}`);
    console.log(`  updated auth user  ${spec.email} (${spec.role})`);
  }

  const { error: profileError } = await admin.from("users").upsert(
    {
      id: user.id,
      email: spec.email,
      name: spec.name,
      role: spec.role,
    },
    { onConflict: "id" },
  );
  if (profileError) {
    throw new Error(`${spec.email} profile: ${profileError.message}`);
  }

  return user;
}

async function seedClinicalDemo(
  admin: ReturnType<typeof createClient>,
  ids: { patientUserId: string; staffUserId: string; headUserId: string },
) {
  const patientCode = "PAT-DEMO-001";

  const { data: existingPatient } = await admin
    .from("patients")
    .select("id")
    .eq("patient_code", patientCode)
    .maybeSingle();

  let patientId = existingPatient?.id;

  if (!patientId) {
    const { data, error } = await admin
      .from("patients")
      .insert({
        patient_code: patientCode,
        user_id: ids.patientUserId,
        name: "Jordan Mbeki",
        date_of_birth: "1988-03-14",
        sex: "F",
        contact_info: encryptField(
          JSON.stringify({
            phone: "+27 11 555 0142",
            email: "patient.demo@hema-core.test",
            address: "12 Sandton Drive, Johannesburg",
          }),
        ),
        created_by: ids.headUserId,
      })
      .select("id")
      .single();

    if (error) throw new Error(`patient insert: ${error.message}`);
    patientId = data.id;
    console.log("  created patient    PAT-DEMO-001");
  } else {
    await admin
      .from("patients")
      .update({
        user_id: ids.patientUserId,
        name: "Jordan Mbeki",
        created_by: ids.headUserId,
      })
      .eq("id", patientId);
    console.log("  patient exists     PAT-DEMO-001");
  }

  const { data: existingCase } = await admin
    .from("cases")
    .select("id")
    .eq("patient_id", patientId)
    .maybeSingle();

  let caseId = existingCase?.id;

  if (!caseId) {
    const { data, error } = await admin
      .from("cases")
      .insert({
        patient_id: patientId,
        assigned_to: ids.staffUserId,
        diagnosis: encryptField("Iron deficiency anemia — under investigation"),
        treatment_plan: encryptField(
          "Oral iron supplementation; repeat CBC in 6 weeks; monitor for response.",
        ),
        status: "active",
      })
      .select("id")
      .single();

    if (error) throw new Error(`case insert: ${error.message}`);
    caseId = data.id;
    console.log("  created case       active anemia workup");
  } else {
    await admin
      .from("cases")
      .update({ assigned_to: ids.staffUserId, status: "active" })
      .eq("id", caseId);
    console.log("  case exists        linked to staff");
  }

  const { count: reviewCount } = await admin
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("case_id", caseId);

  if (!reviewCount) {
    const { error } = await admin.from("reviews").insert({
      case_id: caseId,
      author_id: ids.staffUserId,
      notes: encryptField(
        "Initial consult: fatigue x 3 months, Hb 9.2 g/dL. Started ferrous sulfate 325 mg daily. Patient educated on dietary iron sources.",
      ),
      review_date: new Date().toISOString(),
    });
    if (error) throw new Error(`review insert: ${error.message}`);
    console.log("  created review     initial consult note");
  }

  const { count: apptCount } = await admin
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", patientId);

  if (!apptCount) {
    const followUp = new Date();
    followUp.setDate(followUp.getDate() + 21);

    const { error } = await admin.from("appointments").insert({
      patient_id: patientId,
      staff_id: ids.staffUserId,
      appointment_date: followUp.toISOString(),
      purpose: "Follow-up CBC and iron studies review",
      status: "scheduled",
    });
    if (error) throw new Error(`appointment insert: ${error.message}`);
    console.log("  created appointment follow-up in 3 weeks");
  }

  const { count: taskCount } = await admin
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("assigned_to", ids.staffUserId);

  if (!taskCount) {
    const { error } = await admin.from("tasks").insert({
      title: "Review Jordan Mbeki — repeat CBC results",
      description: "Check lab feed when CBC from follow-up draw is available.",
      status: "todo",
      assigned_to: ids.staffUserId,
      assigned_by: ids.headUserId,
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });
    if (error) throw new Error(`task insert: ${error.message}`);
    console.log("  created task       staff follow-up item");
  }
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  requireEnv("ENCRYPTION_KEY_V1");

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Seeding sample user profiles…\n");

  const byEmail = new Map<string, { id: string }>();

  for (const spec of SAMPLE_USERS) {
    const user = await ensureAuthUser(admin, spec);
    byEmail.set(spec.email, { id: user.id });
  }

  console.log("\nSeeding demo clinical data (patient / staff / head)…\n");

  await seedClinicalDemo(admin, {
    patientUserId: byEmail.get("patient.demo@hema-core.test")!.id,
    staffUserId: byEmail.get("staff.demo@hema-core.test")!.id,
    headUserId: byEmail.get("head.demo@hema-core.test")!.id,
  });

  console.log("\nDone. See docs/SAMPLE_USERS.md for login credentials.");
}

main().catch((error) => {
  console.error("Seed failed:", error.message ?? error);
  process.exit(1);
});
