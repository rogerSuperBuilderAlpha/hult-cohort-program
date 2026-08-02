-- Comentiq — 003_partner_enquiry_links.sql
-- Paste this entire file into the Supabase SQL Editor and run it.
-- Do not run via CLI / DATABASE_URL.

alter table public.partner_enquiries
  add column website_url text,
  add column linkedin_url text;
