-- Comentiq — 004_amplifications_public_read.sql
-- Paste this entire file into the Supabase SQL Editor and run it.
-- Do not run via CLI / DATABASE_URL.
--
-- Allows anon/authenticated readers to see shared amplifications for
-- approved campaigns on published projects (public project pages).

create policy "amplifications_select_shared_public"
on public.amplifications
for select
to anon, authenticated
using (
  status = 'shared'
  and exists (
    select 1
    from public.campaigns c
    join public.projects p on p.id = c.project_id
    where c.id = amplifications.campaign_id
      and c.status = 'approved'
      and p.status = 'published'
  )
);
