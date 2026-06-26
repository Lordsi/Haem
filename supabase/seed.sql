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
    'iso-15189-reaccreditation',
    'Laboratory Renews ISO 15189 Accreditation',
    'Our diagnostic laboratory has renewed its ISO 15189 accreditation following this year''s external assessment.',
    'The department''s diagnostic laboratory has successfully renewed its ISO 15189 accreditation after a two-day on-site assessment by external auditors. The review covered our quality management system, equipment calibration records, staff competency files, and the full testing workflow from sample reception to result reporting. Accreditation is renewed on a regular cycle and confirms that our results meet recognised standards for technical competence and reliability. We thank the laboratory and quality teams for the preparation that made this possible, and we remain committed to the continuous improvement the standard requires.',
    'published',
    '2026-05-12',
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80',
    'Dr. Sam Okonkwo'
  ),
  (
    'new-analyzer-faster-blood-counts',
    'New Analyzer Shortens Full Blood Count Turnaround',
    'A newly commissioned haematology analyzer has reduced the average turnaround time for routine full blood counts.',
    'We have commissioned a new automated haematology analyzer in the core laboratory. Since going live, the average turnaround time for routine full blood counts has dropped from around four hours to under ninety minutes, with samples flagged for abnormal results automatically routed for manual review. The analyzer was validated against our existing platform over several weeks before being brought into routine use. Clinicians should see faster results for ward and outpatient requests, while urgent samples continue to be prioritised as before.',
    'published',
    '2026-04-28',
    'https://images.unsplash.com/photo-1733119883210-04f09d5f86df?auto=format&fit=crop&w=1200&q=80',
    'Prof. Naledi Khumalo'
  ),
  (
    'jak2-molecular-testing-in-house',
    'JAK2 V617F Molecular Testing Now Available In-House',
    'Testing for the JAK2 V617F mutation is now performed on site, removing the need to send samples to an external reference lab.',
    'The laboratory has brought JAK2 V617F mutation testing in-house. Previously these samples were referred to an external reference laboratory, which added several days to the reporting time. Performing the assay on site is expected to return results within the same week the sample is received. The test supports the investigation of suspected myeloproliferative neoplasms such as polycythaemia vera and essential thrombocythaemia. Requesting clinicians can order it through the usual electronic request form, and the laboratory team is available to advise on sample requirements.',
    'published',
    '2026-04-03',
    'https://images.unsplash.com/photo-1758656803198-eeea35110219?auto=format&fit=crop&w=1200&q=80',
    'Dr. Sam Okonkwo'
  ),
  (
    'patient-portal-bleeding-disorder-logging',
    'Patient Portal Now Open for Bleeding Disorder Logging',
    'People living with a bleeding disorder can now log treatment and symptoms from home, giving their care team a clearer picture.',
    'Keeping an accurate record of factor replacement, bleeds, and symptoms helps the care team adjust treatment, but paper diaries are easily lost or left incomplete. Our patient portal now lets patients record this information from home, where it is shared securely with the haematology team. Access is offered to patients already under the care of the department. If you would like to use the portal, please speak to your care coordinator at your next appointment, and our team will help you get set up.',
    'published',
    '2026-03-19',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
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
