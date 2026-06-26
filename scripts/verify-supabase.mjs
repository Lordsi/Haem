/**
 * Verify Supabase API keys in .env.local can read public content from the sandbox.
 * Run: npm run verify:supabase
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function fail(message) {
  console.error("FAIL:", message);
  process.exit(1);
}

if (!url || !anonKey) {
  fail(
    "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
  );
}

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const anon = createClient(url, anonKey);

const { data: articles, error: articlesError } = await anon
  .from("articles")
  .select("id, title, status")
  .eq("status", "published")
  .order("publication_date", { ascending: false });

if (articlesError) {
  fail(`anon articles query: ${articlesError.message}`);
}

if (!articles?.length) {
  fail("anon query returned no published articles (expected 4 from seed)");
}

const sampleIds = articles.filter((a) => a.id.startsWith("sample-"));
if (sampleIds.length > 0) {
  fail("article ids look like fallback samples — not live DB rows");
}

const nonUuid = articles.filter((a) => !uuidRe.test(a.id));
if (nonUuid.length > 0) {
  fail(`article ids are not UUIDs: ${nonUuid.map((a) => a.id).join(", ")}`);
}

console.log("OK anon — published articles:", articles.length);
for (const a of articles) {
  console.log(`  • ${a.title}`);
}

const { data: events, error: eventsError } = await anon
  .from("events")
  .select("id, title")
  .order("event_date", { ascending: true });

if (eventsError) {
  fail(`anon events query: ${eventsError.message}`);
}

if (!events?.length) {
  fail("anon query returned no events (expected 3 from seed)");
}

console.log("OK anon — events:", events.length);

if (!serviceKey) {
  console.warn(
    "WARN: SUPABASE_SERVICE_ROLE_KEY not set — skipping service-role check",
  );
  console.log("Supabase public API wiring looks good.");
  process.exit(0);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error: adminError } = await admin
  .from("contact_messages")
  .select("id")
  .limit(1);

if (adminError) {
  fail(`service_role contact_messages query: ${adminError.message}`);
}

console.log("OK service_role — can query contact_messages");
console.log("Supabase API wiring complete.");
