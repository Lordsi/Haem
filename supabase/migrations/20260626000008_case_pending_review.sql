-- =============================================================================
-- HEMA-Core HDMIS — Case lifecycle: pending consultant review
-- =============================================================================
-- New cases created by staff start as "pending_review" (awaiting consultant /
-- department-head sign-off) before moving to active or being marked done.
-- Adds the enum value used by that workflow.
-- =============================================================================

alter type public.case_status add value if not exists 'pending_review' before 'open';
