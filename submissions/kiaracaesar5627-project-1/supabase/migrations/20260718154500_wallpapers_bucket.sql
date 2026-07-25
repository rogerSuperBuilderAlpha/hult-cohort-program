-- Public bucket for user-uploaded background wallpapers.
-- Writes go through the service-role server action only; public read via CDN URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wallpapers', 'wallpapers', true, 5242880, array['image/*'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
