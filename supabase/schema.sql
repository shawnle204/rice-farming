-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

-- Public profile info (username shown on leaderboards; email stays private).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row (with the username chosen at signup) whenever a new user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- One farm-state row per user.
create table public.game_saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  coins integer not null default 10,
  rice integer not null default 0,
  areas integer not null default 3,
  farmers integer not null default 0,
  tool_level integer not null default 0,
  soil_level integer not null default 0,
  rebirths integer not null default 0,
  plots jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.game_saves enable row level security;

create policy "Users can view their own save"
  on public.game_saves for select
  using (auth.uid() = user_id);

create policy "Users can insert their own save"
  on public.game_saves for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own save"
  on public.game_saves for update
  using (auth.uid() = user_id);

create policy "Users can delete their own save"
  on public.game_saves for delete
  using (auth.uid() = user_id);
