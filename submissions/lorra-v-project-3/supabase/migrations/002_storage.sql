-- Comentiq — 002_storage.sql
-- Paste into the Supabase SQL Editor after 001_schema.sql.
-- Creates public-read buckets; uploads restricted to each user's folder.

-- ---------------------------------------------------------------------------
-- Buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  true,
  10485760, -- 10 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- avatars policies — path: {user_id}/...
-- ---------------------------------------------------------------------------
drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists avatars_delete_own on storage.objects;
create policy avatars_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ---------------------------------------------------------------------------
-- project-media policies — path: {user_id}/...
-- ---------------------------------------------------------------------------
drop policy if exists project_media_public_read on storage.objects;
create policy project_media_public_read
on storage.objects
for select
to public
using (bucket_id = 'project-media');

drop policy if exists project_media_insert_own on storage.objects;
create policy project_media_insert_own
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists project_media_update_own on storage.objects;
create policy project_media_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'project-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'project-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists project_media_delete_own on storage.objects;
create policy project_media_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
