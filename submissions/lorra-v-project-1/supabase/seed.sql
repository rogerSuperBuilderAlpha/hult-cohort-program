-- Seed ~10-person test cohort AFTER creating auth users manually, OR use the
-- app signup flow then run the data section with real profile UUIDs.
--
-- Recommended local path:
-- 1. Run 001_schema.sql
-- 2. Sign up 10 users via the app (or Supabase Auth dashboard)
-- 3. Replace the UUIDs below with real profile ids from public.profiles
-- 4. Run this file
--
-- The block below is a TEMPLATE — leave commented until UUIDs are real.

/*
-- Example: assume these profile ids exist
-- Replace every '00000000-0000-0000-0000-00000000000N' with real ids.

update public.mvp_status
set
  feature_completion_pct = 45,
  critical_bugs_open = 3,
  e2e_flow_implemented = false,
  updated_at = now();

-- Sample PRs
insert into public.pull_requests (profile_id, github_url, title, status, reviewer_count) values
  ('00000000-0000-0000-0000-000000000001', 'https://github.com/org/repo/pull/1', 'Add auth shell', 'merged', 2),
  ('00000000-0000-0000-0000-000000000001', 'https://github.com/org/repo/pull/2', 'Dashboard layout', 'merged', 1),
  ('00000000-0000-0000-0000-000000000002', 'https://github.com/org/repo/pull/3', 'Leaderboard query', 'merged', 2),
  ('00000000-0000-0000-0000-000000000002', 'https://github.com/org/repo/pull/4', 'Vote button', 'pending', 0),
  ('00000000-0000-0000-0000-000000000003', 'https://github.com/org/repo/pull/5', 'Submit forms', 'merged', 3),
  ('00000000-0000-0000-0000-000000000004', 'https://github.com/org/repo/pull/6', 'MVP admin panel', 'merged', 1),
  ('00000000-0000-0000-0000-000000000005', 'https://github.com/org/repo/pull/7', 'Profile page', 'merged', 0),
  ('00000000-0000-0000-0000-000000000006', 'https://github.com/org/repo/pull/8', 'Energy counter', 'merged', 2),
  ('00000000-0000-0000-0000-000000000007', 'https://github.com/org/repo/pull/9', 'Gate evaluator', 'merged', 1),
  ('00000000-0000-0000-0000-000000000008', 'https://github.com/org/repo/pull/10', 'Seed docs', 'merged', 0),
  ('00000000-0000-0000-0000-000000000009', 'https://github.com/org/repo/pull/11', 'Activity tracker', 'merged', 2),
  ('00000000-0000-0000-0000-000000000010', 'https://github.com/org/repo/pull/12', 'CSS polish', 'merged', 1);

insert into public.contributions (profile_id, type, description) values
  ('00000000-0000-0000-0000-000000000001', 'doc', 'Wrote onboarding README'),
  ('00000000-0000-0000-0000-000000000003', 'design', 'Dashboard wireframes'),
  ('00000000-0000-0000-0000-000000000004', 'pm_task', 'Sprint board triage'),
  ('00000000-0000-0000-0000-000000000005', 'issue_resolved', 'Fixed empty leaderboard state'),
  ('00000000-0000-0000-0000-000000000006', 'feedback_addressed', 'Adjusted vote UX from playtest'),
  ('00000000-0000-0000-0000-000000000008', 'doc', 'API notes for scoring'),
  ('00000000-0000-0000-0000-000000000010', 'pm_task', 'Demo day checklist');

insert into public.votes (voter_id, recipient_id) values
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007');

insert into public.weekly_activity (profile_id, week_start, active) values
  ('00000000-0000-0000-0000-000000000001', date_trunc('week', current_date)::date, true),
  ('00000000-0000-0000-0000-000000000002', date_trunc('week', current_date)::date, true),
  ('00000000-0000-0000-0000-000000000003', date_trunc('week', current_date)::date, true),
  ('00000000-0000-0000-0000-000000000004', date_trunc('week', current_date)::date, false),
  ('00000000-0000-0000-0000-000000000005', date_trunc('week', current_date)::date, true),
  ('00000000-0000-0000-0000-000000000006', date_trunc('week', current_date)::date, true),
  ('00000000-0000-0000-0000-000000000007', date_trunc('week', current_date)::date, false),
  ('00000000-0000-0000-0000-000000000008', date_trunc('week', current_date)::date, true),
  ('00000000-0000-0000-0000-000000000009', date_trunc('week', current_date)::date, true),
  ('00000000-0000-0000-0000-000000000010', date_trunc('week', current_date)::date, false);
*/
