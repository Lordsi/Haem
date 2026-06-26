-- =============================================================================
-- HEMA-Core HDMIS — Seed data (public content)
-- =============================================================================
-- Sample published articles and upcoming events so the public site renders with
-- real data. Author is left null (no seeded auth users). Safe to re-run.
-- Applied automatically by `supabase db reset` (local). For a remote project,
-- run this against the SQL editor or via psql once after `supabase db push`.
-- =============================================================================

insert into public.articles (slug, title, excerpt, content, status, publication_date, cover_image_url, author_name)
values
  (
    'ai-driven-morphology-analysis',
    'AI-Driven Morphology Analysis Integrated into the Diagnostic Core',
    'Neural networks now identify rare cell variants with 40% higher sensitivity than standard automated counters.',
    'Our latest diagnostic update uses convolutional neural networks trained on hundreds of thousands of annotated blood smears to flag rare and atypical cell morphologies. In validation against expert hematopathologists, the system identified rare cell variants with 40% higher sensitivity than standard automated counters, while reducing manual review time for routine samples. This article details the validation methodology, the safeguards built into the human-in-the-loop workflow, and what it means for turnaround times in our laboratory.',
    'published',
    '2026-05-12',
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80',
    'Dr. Sam Okonkwo'
  ),
  (
    'car-t-cell-therapy-tracking',
    'Real-Time CAR-T Cell Therapy Tracking',
    'A new monitoring approach lets clinicians follow CAR-T cell expansion rates throughout treatment.',
    'Chimeric antigen receptor (CAR) T-cell therapy has transformed outcomes for several hematologic malignancies, but monitoring cell expansion remains challenging. We describe a workflow that tracks CAR-T cell expansion rates in near real time, helping clinicians anticipate response and manage complications such as cytokine release syndrome earlier. Early results from our cohort suggest tighter monitoring correlates with improved management of adverse events.',
    'published',
    '2026-04-28',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    'Prof. Naledi Khumalo'
  ),
  (
    'open-source-blood-smear-dataset',
    'Releasing 50,000 Anonymized Blood Smears for Global Research',
    'We are contributing a large, fully anonymized dataset to accelerate hematology research worldwide.',
    'Reproducible research depends on access to high-quality data. We are releasing 50,000 fully anonymized digital blood smears, reviewed and labeled by our hematopathology team, under an open research license. This article covers the de-identification process, the labeling schema, and how research groups can request access. We believe shared datasets are essential to building robust, generalizable diagnostic models.',
    'published',
    '2026-04-03',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1200&q=80',
    'Dr. Sam Okonkwo'
  ),
  (
    'hemophilia-care-portal',
    'Patient Portal Launched for Factor Replacement Logging',
    'People living with hemophilia can now log factor replacement at home, giving care teams a clearer picture.',
    'Consistent factor replacement logging improves care for people living with hemophilia, but paper logs are easily lost or incomplete. Our new patient-facing portal lets patients record infusions, bleeds, and symptoms from home, syncing securely with their care team. This article explains the privacy model behind the portal and how the data supports more responsive, personalized care.',
    'published',
    '2026-03-19',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=1200&q=80',
    'Prof. Naledi Khumalo'
  )
on conflict (slug) do nothing;

insert into public.events (title, description, event_date, location, registration_limit)
values
  (
    'Digital Pathology: The Future of Leukemia Diagnosis',
    'A keynote on how digital pathology and machine learning are reshaping leukemia diagnosis, followed by an open Q&A with our diagnostic innovation team.',
    '2026-10-14 09:00:00+00',
    'L-4 Auditorium',
    120
  ),
  (
    'HDMIS Workshop: Maximizing Lab Workflow Efficiency',
    'A hands-on virtual training session for medical technicians and senior pathologists covering high-throughput workflows and quality control.',
    '2026-10-21 14:30:00+00',
    'Virtual',
    300
  ),
  (
    'Annual Hematology Research Symposium 2026',
    'A full-day symposium showcasing peer-reviewed studies in blood sciences, with poster sessions and networking.',
    '2026-11-03 11:00:00+00',
    'Grand Hall',
    500
  )
on conflict do nothing;
