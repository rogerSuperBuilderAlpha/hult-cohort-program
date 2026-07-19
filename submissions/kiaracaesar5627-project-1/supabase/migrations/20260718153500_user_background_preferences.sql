alter table public.user_prefs
  add column if not exists background_color text not null default '',
  add column if not exists wallpaper_url text not null default '',
  add column if not exists wallpaper_fit text not null default 'cover';

alter table public.user_prefs
  drop constraint if exists user_prefs_wallpaper_fit_check,
  add constraint user_prefs_wallpaper_fit_check
    check (wallpaper_fit in ('cover', 'contain'));
