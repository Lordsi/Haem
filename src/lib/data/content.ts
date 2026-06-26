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
  author_name: string | null;
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
    slug: "iso-15189-reaccreditation",
    title: "Laboratory Renews ISO 15189 Accreditation",
    excerpt:
      "Our diagnostic laboratory has renewed its ISO 15189 accreditation following this year's external assessment.",
    content:
      "The department's diagnostic laboratory has successfully renewed its ISO 15189 accreditation after a two-day on-site assessment by external auditors. The review covered our quality management system, equipment calibration records, staff competency files, and the full testing workflow from sample reception to result reporting.\n\nAccreditation is renewed on a regular cycle and confirms that our results meet recognised standards for technical competence and reliability. We thank the laboratory and quality teams for the preparation that made this possible, and we remain committed to the continuous improvement the standard requires.",
    publication_date: "2026-05-12",
    cover_image_url:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    author_name: "Dr. Sam Okonkwo",
  },
  {
    id: "sample-article-2",
    slug: "new-analyzer-faster-blood-counts",
    title: "New Analyzer Shortens Full Blood Count Turnaround",
    excerpt:
      "A newly commissioned haematology analyzer has reduced the average turnaround time for routine full blood counts.",
    content:
      "We have commissioned a new automated haematology analyzer in the core laboratory. Since going live, the average turnaround time for routine full blood counts has dropped from around four hours to under ninety minutes, with samples flagged for abnormal results automatically routed for manual review.\n\nThe analyzer was validated against our existing platform over several weeks before being brought into routine use. Clinicians should see faster results for ward and outpatient requests, while urgent samples continue to be prioritised as before.",
    publication_date: "2026-04-28",
    cover_image_url:
      "https://images.unsplash.com/photo-1733119883210-04f09d5f86df?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    author_name: "Prof. Naledi Khumalo",
  },
  {
    id: "sample-article-3",
    slug: "jak2-molecular-testing-in-house",
    title: "JAK2 V617F Molecular Testing Now Available In-House",
    excerpt:
      "Testing for the JAK2 V617F mutation is now performed on site, removing the need to send samples to an external reference lab.",
    content:
      "The laboratory has brought JAK2 V617F mutation testing in-house. Previously these samples were referred to an external reference laboratory, which added several days to the reporting time. Performing the assay on site is expected to return results within the same week the sample is received.\n\nThe test supports the investigation of suspected myeloproliferative neoplasms such as polycythaemia vera and essential thrombocythaemia. Requesting clinicians can order it through the usual electronic request form, and the laboratory team is available to advise on sample requirements.",
    publication_date: "2026-04-03",
    cover_image_url:
      "https://images.unsplash.com/photo-1758656803198-eeea35110219?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    author_name: "Dr. Sam Okonkwo",
  },
  {
    id: "sample-article-4",
    slug: "patient-portal-bleeding-disorder-logging",
    title: "Patient Portal Now Open for Bleeding Disorder Logging",
    excerpt:
      "People living with a bleeding disorder can now log treatment and symptoms from home, giving their care team a clearer picture.",
    content:
      "Keeping an accurate record of factor replacement, bleeds, and symptoms helps the care team adjust treatment, but paper diaries are easily lost or left incomplete. Our patient portal now lets patients record this information from home, where it is shared securely with the haematology team.\n\nAccess is offered to patients already under the care of the department. If you would like to use the portal, please speak to your care coordinator at your next appointment, and our team will help you get set up.",
    publication_date: "2026-03-19",
    cover_image_url:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    status: "published",
    author_name: "Prof. Naledi Khumalo",
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

const ARTICLE_COLUMNS = `
  id,
  slug,
  title,
  excerpt,
  content,
  publication_date,
  cover_image_url,
  status,
  author_name,
  author:users!articles_author_id_fkey ( name )
`;

function mapArticle(row: Record<string, unknown>): Article {
  const author = row.author as unknown as { name: string | null } | null;
  const linkedName = author?.name ?? null;
  const storedName = row.author_name as string | null;

  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: row.excerpt as string | null,
    content: row.content as string | null,
    publication_date: row.publication_date as string | null,
    cover_image_url: row.cover_image_url as string | null,
    status: row.status as Article["status"],
    author_name: storedName ?? linkedName,
  };
}
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
    return (data ?? []).map((row) => mapArticle(row as Record<string, unknown>));
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
    return data ? mapArticle(data as Record<string, unknown>) : null;
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
