-- Storage bucket for message attachments (PRD §4.1 — 10 MB images/PDF/docx/zip)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,
  10485760,
  array[
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Authenticated users can upload into their own folder prefix: {user_id}/...
drop policy if exists attachments_storage_insert on storage.objects;
create policy attachments_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists attachments_storage_select on storage.objects;
create policy attachments_storage_select on storage.objects
  for select to authenticated
  using (bucket_id = 'attachments');

drop policy if exists attachments_storage_delete on storage.objects;
create policy attachments_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
