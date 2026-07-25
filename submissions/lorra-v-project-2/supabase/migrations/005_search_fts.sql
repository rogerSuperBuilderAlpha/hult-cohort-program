-- Step 10: Postgres full-text search on messages (PRD §4.5)
-- Apply in Supabase SQL Editor if DATABASE_URL is unavailable locally.

alter table public.messages
  add column if not exists body_tsv tsvector
  generated always as (to_tsvector('english', coalesce(body_richtext, ''))) stored;

create index if not exists messages_body_tsv_idx on public.messages using gin (body_tsv);

create or replace function public.search_messages(
  query text,
  p_channel_id uuid default null,
  lim int default 40
)
returns table (
  id uuid,
  parent_type public.message_parent_type,
  parent_id uuid,
  body_richtext text,
  created_at timestamptz,
  author_id uuid,
  rank real
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    m.id,
    m.parent_type,
    m.parent_id,
    m.body_richtext,
    m.created_at,
    m.author_id,
    ts_rank(m.body_tsv, websearch_to_tsquery('english', query)) as rank
  from public.messages m
  where m.deleted_at is null
    and length(trim(query)) > 0
    and (
      p_channel_id is null
      or (m.parent_type = 'channel' and m.parent_id = p_channel_id)
    )
    and m.body_tsv @@ websearch_to_tsquery('english', query)
  order by rank desc, m.created_at desc
  limit greatest(1, least(lim, 100));
$$;

grant execute on function public.search_messages(text, uuid, int) to authenticated;
