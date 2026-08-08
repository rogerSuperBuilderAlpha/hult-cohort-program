-- Phase A2 schema additions for real curriculum content.
-- Run manually in the Supabase SQL Editor after review.

alter table disciplines add column if not exists is_full_module boolean not null default false;
alter table disciplines add column if not exists central_question text not null default '';
alter table disciplines add column if not exists subtitle text not null default '';

alter table scenarios add column if not exists kind text not null default 'dilemma';
-- kind: 'dilemma' | 'recognition' | 'knowledge_check' | 'preview_scenario'
alter table scenarios add column if not exists options jsonb not null default '[]'::jsonb;
-- options: [{ "key": "A", "text": "...", "score": 4 }, ...]
alter table scenarios add column if not exists correct_key text;
alter table scenarios add column if not exists explanation text not null default '';

alter table progress add column if not exists knowledge_score int;
alter table progress add column if not exists behaviour_commitment text;

-- Grants for the new columns are inherited; no new tables, so no new grants needed.
