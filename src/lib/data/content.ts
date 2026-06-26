import "server-only";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Public content data access (articles + events).
 *
 * When Supabase is configured these read from the database under RLS (only
 * `published` articles and all events are publicly selectable). When it is not
 * yet configured — or a query fails — we fall back to curated sample content so
 * the public site always renders. The fallback is clearly a dev convenience;
 * real data takes over the moment `.env.local` is populated and migrations +
 * seed are applied.
 */

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  publication_date: string | null;
  cover_image_url: string | null;
  status: "draft" | "published";
}

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  registration_limit: number | null;
}

// ---------------------------------------------------------------------------
// Fallback sample content (mirrors supabase/seed.sql)
// ---------------------------------------------------------------------------
const SAMPLE_ARTICLES: Article[] = [
  {
    id: "sample-article-1",
    slug: "ai-driven-morphology-analysis",
    title: "AI-Driven Morphology Analysis Integrated into the Diagnostic Core",
    excerpt:
      "Neural networks now identify rare cell variants with 40% higher sensitivity than standard automated counters.",
    content:
      "Our latest diagnostic update uses convolutional neural networks trained on hundreds of thousands of annotated blood smears to flag rare and atypical cell morphologies. In validation against expert hematopathologists, the system identified rare cell variants with 40% higher sensitivity than standard automated counters, while reducing manual review time for routine samples.\n\nThis article details the validation methodology, the safeguards built into the human-in-the-loop workflow, and what it means for turnaround times in our laboratory.",
    publication_date: "2026-05-12",
    cover_image_url:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80",
    status: "published",
  },
  {
    id: "sample-article-2",
    slug: "car-t-cell-therapy-tracking",
    title: "Real-Time CAR-T Cell Therapy Tracking",
    excerpt:
      "A new monitoring approach lets clinicians follow CAR-T cell expansion rates throughout treatment.",
    content:
      "Chimeric antigen receptor (CAR) T-cell therapy has transformed outcomes for several hematologic malignancies, but monitoring cell expansion remains challenging. We describe a workflow that tracks CAR-T cell expansion rates in near real time, helping clinicians anticipate response and manage complications such as cytokine release syndrome earlier.\n\nEarly results from our cohort suggest tighter monitoring correlates with improved management of adverse events.",
    publication_date: "2026-04-28",
    cover_image_url:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    status: "published",
  },
  {
    id: "sample-article-3",
    slug: "open-source-blood-smear-dataset",
    title: "Releasing 50,000 Anonymized Blood Smears for Global Research",
    excerpt:
      "We are contributing a large, fully anonymized dataset to accelerate hematology research worldwide.",
    content:
      "Reproducible research depends on access to high-quality data. We are releasing 50,000 fully anonymized digital blood smears, reviewed and labeled by our hematopathology team, under an open research license.\n\nThis article covers the de-identification process, the labeling schema, and how research groups can request access.",
    publication_date: "2026-04-03",
    cover_image_url:
      "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80",
    status: "published",
  },
  {
    id: "sample-article-4",
    slug: "hemophilia-care-portal",
    title: "Patient Portal Launched for Factor Replacement Logging",
    excerpt:
      "People living with hemophilia can now log factor replacement at home, giving care teams a clearer picture.",
    content:
      "Consistent factor replacement logging improves care for people living with hemophilia, but paper logs are easily lost or incomplete. Our new patient-facing portal lets patients record infusions, bleeds, and symptoms from home, syncing securely with their care team.\n\nThis article explains the privacy model behind the portal and how the data supports more responsive, personalized care.",
    publication_date: "2026-03-19",
    cover_image_url:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80",
    status: "published",
  },
];

const SAMPLE_EVENTS: EventItem[] = [
  {
    id: "sample-event-1",
    title: "Digital Pathology: The Future of Leukemia Diagnosis",
    description:
      "A keynote on how digital pathology and machine learning are reshaping leukemia diagnosis, followed by an open Q&A with our diagnostic innovation team.",
    event_date: "2026-10-14T09:00:00Z",
    location: "L-4 Auditorium",
    registration_limit: 120,
  },
  {
    id: "sample-event-2",
    title: "HDMIS Workshop: Maximizing Lab Workflow Efficiency",
    description:
      "A hands-on virtual training session for medical technicians and senior pathologists covering high-throughput workflows and quality control.",
    event_date: "2026-10-21T14:30:00Z",
    location: "Virtual",
    registration_limit: 300,
  },
  {
    id: "sample-event-3",
    title: "Annual Hematology Research Symposium 2026",
    description:
      "A full-day symposium showcasing peer-reviewed studies in blood sciences, with poster sessions and networking.",
    event_date: "2026-11-03T11:00:00Z",
    location: "Grand Hall",
    registration_limit: 500,
  },
];

const ARTICLE_COLUMNS =
  "id, slug, title, excerpt, content, publication_date, cover_image_url, status";
const EVENT_COLUMNS =
  "id, title, description, event_date, location, registration_limit";

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------
export async function getPublishedArticles(limit?: number): Promise<Article[]> {
  if (!isSupabaseConfigured()) {
    return limit ? SAMPLE_ARTICLES.slice(0, limit) : SAMPLE_ARTICLES;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("status", "published")
      .order("publication_date", { ascending: false });
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data as Article[]) ?? [];
  } catch (error) {
    console.error("[content] getPublishedArticles failed, using fallback", error);
    return limit ? SAMPLE_ARTICLES.slice(0, limit) : SAMPLE_ARTICLES;
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_ARTICLES.find((a) => a.slug === slug) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return (data as Article | null) ?? null;
  } catch (error) {
    console.error("[content] getArticleBySlug failed, using fallback", error);
    return SAMPLE_ARTICLES.find((a) => a.slug === slug) ?? null;
  }
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------
export async function getUpcomingEvents(limit?: number): Promise<EventItem[]> {
  if (!isSupabaseConfigured()) {
    return limit ? SAMPLE_EVENTS.slice(0, limit) : SAMPLE_EVENTS;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .order("event_date", { ascending: true });
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data as EventItem[]) ?? [];
  } catch (error) {
    console.error("[content] getUpcomingEvents failed, using fallback", error);
    return limit ? SAMPLE_EVENTS.slice(0, limit) : SAMPLE_EVENTS;
  }
}

export async function getEventById(id: string): Promise<EventItem | null> {
  if (!isSupabaseConfigured()) {
    return SAMPLE_EVENTS.find((e) => e.id === id) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return (data as EventItem | null) ?? null;
  } catch (error) {
    console.error("[content] getEventById failed, using fallback", error);
    return SAMPLE_EVENTS.find((e) => e.id === id) ?? null;
  }
}
