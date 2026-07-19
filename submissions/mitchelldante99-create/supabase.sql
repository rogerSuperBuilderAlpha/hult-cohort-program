-- Run this once in Supabase: Project -> SQL Editor -> New query -> paste -> Run

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text not null,
  streak int not null default 0,
  last_completed_date date,
  total_completed int not null default 0,
  created_at timestamptz not null default now()
);

-- Projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  created_by uuid references auth.users(id) not null,
  created_by_name text not null,
  created_at timestamptz not null default now()
);

-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  description text default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'Medium' check (priority in ('High', 'Medium', 'Low')),
  assignee_id uuid references auth.users(id),
  assignee_name text,
  due_date date,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security: any authenticated cohort member can read/write
-- everything (small trusted-cohort tool, not a public multi-tenant app).
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

create policy "Authenticated users can read all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Authenticated users can do anything with projects"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can do anything with tasks"
  on public.tasks for all
  to authenticated
  using (true)
  with check (true);

-- Enable realtime updates
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.profiles;
