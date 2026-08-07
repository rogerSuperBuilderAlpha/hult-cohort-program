-- Placeholder seed for Phase A pipeline testing only.
-- Replace all of this content in Phase A2 with real course copy.

insert into paths (id, slug, title, sort_order) values
  ('11111111-1111-1111-1111-111111111111', 'placeholder-path-1', 'Placeholder Path 1 — replace in Phase A2', 1),
  ('22222222-2222-2222-2222-222222222222', 'placeholder-path-2', 'Placeholder Path 2 — replace in Phase A2', 2),
  ('33333333-3333-3333-3333-333333333333', 'placeholder-path-3', 'Placeholder Path 3 — replace in Phase A2', 3);

insert into disciplines (id, path_id, slug, title, sort_order, content_md, counterfeit_md) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'placeholder-discipline-1',
    'Placeholder Discipline 1 — replace in Phase A2',
    1,
    'Placeholder lesson content for discipline 1. Replace in Phase A2.',
    'Placeholder counterfeit content for discipline 1. Replace in Phase A2.'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    'placeholder-discipline-2',
    'Placeholder Discipline 2 — replace in Phase A2',
    1,
    'Placeholder lesson content for discipline 2. Replace in Phase A2.',
    'Placeholder counterfeit content for discipline 2. Replace in Phase A2.'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    'placeholder-discipline-3',
    'Placeholder Discipline 3 — replace in Phase A2',
    1,
    'Placeholder lesson content for discipline 3. Replace in Phase A2.',
    'Placeholder counterfeit content for discipline 3. Replace in Phase A2.'
  );

insert into scenarios (id, discipline_id, prompt_md, rubric_md) values
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Placeholder scenario prompt for discipline 1. Replace in Phase A2.',
    'Placeholder rubric for discipline 1. Replace in Phase A2.'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Placeholder scenario prompt for discipline 2. Replace in Phase A2.',
    'Placeholder rubric for discipline 2. Replace in Phase A2.'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Placeholder scenario prompt for discipline 3. Replace in Phase A2.',
    'Placeholder rubric for discipline 3. Replace in Phase A2.'
  );
