-- One row per auth user, created by the handle_new_user trigger.
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  display_name  text not null check (char_length(display_name) between 1 and 40),
  avatar_url    text,
  -- null means: follow the device until the user flips the toggle
  theme         text check (theme in ('light', 'dark')),
  created_at    timestamptz not null default now()
);
