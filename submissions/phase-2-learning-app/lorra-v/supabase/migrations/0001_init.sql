create table paths (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  sort_order int not null
);

create table disciplines (
  id uuid primary key default gen_random_uuid(),
  path_id uuid references paths(id) not null,
  slug text unique not null,
  title text not null,
  sort_order int not null,
  content_md text not null default '',
  counterfeit_md text not null default ''
);

create table scenarios (
  id uuid primary key default gen_random_uuid(),
  discipline_id uuid references disciplines(id) not null,
  prompt_md text not null default '',
  rubric_md text not null default ''
);

create table app_users (
  id uuid primary key default gen_random_uuid(),
  ludwitt_sub text unique not null,
  email text,
  created_at timestamptz not null default now()
);

create table progress (
  user_id uuid references app_users(id) not null,
  discipline_id uuid references disciplines(id) not null,
  started_at timestamptz,
  completed_at timestamptz,
  scenario_response text,
  scenario_at timestamptz,
  primary key (user_id, discipline_id)
);

create table path_completions (
  user_id uuid references app_users(id) not null,
  path_id uuid references paths(id) not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, path_id)
);

create table ludwitt_event_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id),
  event_type text not null,
  payload jsonb not null,
  sent_at timestamptz not null default now(),
  http_status int,
  error text
);

-- RLS: lock everything down. No client-side reads/writes to these tables directly —
-- all access goes through server routes using the service role key.
alter table paths enable row level security;
alter table disciplines enable row level security;
alter table scenarios enable row level security;
alter table app_users enable row level security;
alter table progress enable row level security;
alter table path_completions enable row level security;
alter table ludwitt_event_log enable row level security;
-- No policies added — service role bypasses RLS by design; anon key gets zero access.
