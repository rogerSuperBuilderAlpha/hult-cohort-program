-- CEAL Green Bid Manager · Week 4 schema (§2)
-- Apply via Supabase SQL editor or: supabase db push

create extension if not exists "pgcrypto";

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('admin','bd_manager','engineer','viewer')),
  created_at timestamptz not null default now()
);

create table sources (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('api','scrape','manual')),
  name text not null,
  base_url text,
  funder text,
  countries text[] default '{}',
  poll_frequency_hours int default 24,
  last_polled_at timestamptz,
  last_success_at timestamptz,
  enabled boolean default true,
  notes text
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  source_id uuid references sources(id),
  external_ref text,
  title text not null,
  issuing_body text,
  funder text,
  country text,
  sector text,
  estimated_value_usd numeric,
  local_value numeric,
  local_currency text,
  stage text check (stage in ('plan','notice','eoi','rfp','closed')),
  published_at timestamptz,
  questions_deadline timestamptz,
  submission_deadline timestamptz,
  expected_bid_date date,
  document_urls text[] default '{}',
  raw_text text,
  relevance_score numeric,
  relevance_rationale text,
  status text not null default 'new' check (status in (
    'new','screening','no_bid','bidding','submitted','shortlisted','won','lost','cancelled','no_award'
  )),
  discovered_at timestamptz default now(),
  discovered_via text
);

create table profile_keywords (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  term text not null,
  weight numeric not null default 1,
  category text
);

create table requirements (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  ref text,
  category text check (category in ('eligibility','technical','financial','legal','format')),
  text text not null,
  is_mandatory boolean default false,
  weight_pct numeric,
  source_page text,
  extraction_confidence numeric,
  human_verified boolean not null default false,
  verified_by uuid references users(id)
);

create table eval_criteria (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  criterion text not null,
  weight_pct numeric,
  max_score numeric,
  scoring_notes text,
  source_page text,
  human_verified boolean not null default false
);

create table qualification (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  scored_by uuid references users(id),
  scored_at timestamptz default now(),
  scores_json jsonb not null default '{}',
  total_score numeric,
  hard_fail_reason text,
  recommendation text check (recommendation in ('bid','no_bid','partner_only')),
  decision text check (decision in ('bid','no_bid','partner_only')),
  decision_by uuid references users(id),
  override_reason text
);

create table evidence (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  kind text,
  title text not null,
  body_md text,
  structured_json jsonb,
  project_ref text,
  client_name text,
  country text,
  sector text,
  value_usd numeric,
  period_start date,
  period_end date,
  document_url text,
  expires_at date,
  verified_by uuid references users(id),
  verified_at timestamptz,
  last_used_at timestamptz,
  use_count int default 0
);

create table requirement_evidence (
  id uuid primary key default gen_random_uuid(),
  requirement_id uuid not null references requirements(id) on delete cascade,
  evidence_id uuid references evidence(id),
  coverage text check (coverage in ('full','partial','gap')),
  matched_by text check (matched_by in ('ai','human')),
  confidence numeric,
  note text
);

create table outcomes (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  result text,
  announced_at timestamptz,
  our_score numeric,
  winning_score numeric,
  winner_name text,
  winner_price_usd numeric,
  rank int,
  num_bidders int,
  debrief_available boolean,
  debrief_requested boolean,
  debrief_received boolean,
  debrief_notes_md text
);

create table lessons (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  opportunity_id uuid references opportunities(id),
  statement text not null,
  factor_category text,
  confidence text check (confidence in ('observed','inferred')),
  status text default 'open' check (status in ('open','adopted','retired')),
  adopted_into text
);

create table config_qual_weights (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  dimension text not null,
  weight_pct numeric not null,
  band_thresholds_json jsonb,
  source text not null,
  last_reviewed date not null
);

create table config_hard_gates (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  rule_key text not null,
  description text not null,
  source text not null,
  last_reviewed date not null
);

create table event_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  user_id uuid references users(id),
  event_name text not null,
  payload_json jsonb default '{}',
  session_id text,
  emitted_at timestamptz default now(),
  forwarded_at timestamptz
);

create table ai_audit (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  purpose text,
  model text,
  prompt_hash text,
  input_tokens int,
  output_tokens int,
  created_at timestamptz default now()
);

-- RLS (enable per table in Supabase dashboard; policies scoped by org_id)
alter table organizations enable row level security;
alter table opportunities enable row level security;
alter table evidence enable row level security;

create index idx_opportunities_org on opportunities(org_id);
create index idx_opportunities_stage on opportunities(stage);
create index idx_opportunities_status on opportunities(status);
