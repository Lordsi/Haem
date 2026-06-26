-- =============================================================================
-- Phase 4 — Let patients read names of clinicians on their care team
-- =============================================================================
-- Patients may see staff who are assigned to their cases or linked to their
-- appointments (for portal display and messaging). No broader staff directory.

create policy "users_select_patient_care_team"
  on public.users for select to authenticated
  using (
    exists (
      select 1
      from public.cases c
      join public.patients p on p.id = c.patient_id
      where p.user_id = auth.uid()
        and c.assigned_to = users.id
    )
    or exists (
      select 1
      from public.appointments a
      join public.patients p on p.id = a.patient_id
      where p.user_id = auth.uid()
        and a.staff_id = users.id
    )
    or exists (
      select 1
      from public.messages m
      where (m.sender_id = auth.uid() and m.receiver_id = users.id)
         or (m.receiver_id = auth.uid() and m.sender_id = users.id)
    )
  );
