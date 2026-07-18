-- FlexiFlow schema — customizable project management on top of the Pilot base.
-- Additive migration: keeps users/projects/tasks and layers workspaces,
-- roles, custom statuses, labels, custom fields, comments, activity,
-- automations, notifications, and per-user theme prefs.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.workspace_role as enum ('OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'GUEST');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.custom_field_type as enum ('text', 'number', 'date', 'select', 'checkbox');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Workspaces + membership
-- ---------------------------------------------------------------------------
create table if not exists public.workspaces (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  name text not null,
  slug text not null unique,
  owner_id text not null references public.users(id) on delete cascade,
  accent_color text not null default '#2563eb',
  features jsonb not null default '{
    "kanban": true,
    "table": true,
    "calendar": true,
    "labels": true,
    "customFields": true,
    "comments": true,
    "activity": true,
    "automations": true,
    "notifications": true,
    "files": false,
    "integrations": false,
    "ai": false,
    "gantt": false
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id text not null references public.workspaces(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  role public.workspace_role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists workspace_members_user_idx on public.workspace_members(user_id);

-- ---------------------------------------------------------------------------
-- Customization: statuses, labels, custom fields
-- ---------------------------------------------------------------------------
create table if not exists public.statuses (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#64748b',
  position int not null default 0,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists statuses_workspace_idx on public.statuses(workspace_id);

create table if not exists public.labels (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text not null default '#2563eb',
  created_at timestamptz not null default now()
);
create index if not exists labels_workspace_idx on public.labels(workspace_id);

create table if not exists public.custom_fields (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  name text not null,
  type public.custom_field_type not null default 'text',
  options jsonb not null default '[]'::jsonb,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists custom_fields_workspace_idx on public.custom_fields(workspace_id);

-- ---------------------------------------------------------------------------
-- Extend projects + tasks
-- ---------------------------------------------------------------------------
alter table public.projects
  add column if not exists workspace_id text references public.workspaces(id) on delete cascade;
alter table public.projects
  add column if not exists color text not null default '#2563eb';
create index if not exists projects_workspace_idx on public.projects(workspace_id);

alter table public.tasks
  add column if not exists status_id text references public.statuses(id) on delete set null;
alter table public.tasks
  add column if not exists position int not null default 0;
-- Keep the legacy enum column nullable so old rows never block inserts.
alter table public.tasks alter column status drop not null;
alter table public.tasks alter column status drop default;
create index if not exists tasks_status_id_idx on public.tasks(status_id);

create table if not exists public.task_labels (
  task_id text not null references public.tasks(id) on delete cascade,
  label_id text not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

create table if not exists public.task_field_values (
  task_id text not null references public.tasks(id) on delete cascade,
  field_id text not null references public.custom_fields(id) on delete cascade,
  value text not null default '',
  primary key (task_id, field_id)
);

-- ---------------------------------------------------------------------------
-- Collaboration: comments, activity, notifications
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  task_id text not null references public.tasks(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_task_idx on public.comments(task_id);

create table if not exists public.activity (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  project_id text references public.projects(id) on delete set null,
  task_id text references public.tasks(id) on delete set null,
  user_id text references public.users(id) on delete set null,
  verb text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists activity_workspace_idx on public.activity(workspace_id, created_at desc);

create table if not exists public.notifications (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  user_id text not null references public.users(id) on delete cascade,
  workspace_id text references public.workspaces(id) on delete cascade,
  body text not null,
  link text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, read, created_at desc);

-- ---------------------------------------------------------------------------
-- Automations
-- ---------------------------------------------------------------------------
create table if not exists public.automation_rules (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  workspace_id text not null references public.workspaces(id) on delete cascade,
  name text not null,
  trigger_status_id text references public.statuses(id) on delete cascade,
  action text not null default 'notify_owner',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists automation_rules_workspace_idx on public.automation_rules(workspace_id);

-- ---------------------------------------------------------------------------
-- Per-user preferences (theme + accent)
-- ---------------------------------------------------------------------------
create table if not exists public.user_prefs (
  user_id text primary key references public.users(id) on delete cascade,
  theme text not null default 'light',
  accent_color text not null default '#2563eb',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: server uses the service role only; block anon/authenticated.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'workspaces','workspace_members','statuses','labels','custom_fields',
    'task_labels','task_field_values','comments','activity','notifications',
    'automation_rules','user_prefs'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('revoke all on public.%I from anon, authenticated;', t);
  end loop;
end $$;
