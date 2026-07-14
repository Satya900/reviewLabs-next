-- ReviewLabs — initial schema (Phase 2: auth + progress sync)
-- Run this once in the Supabase SQL Editor for a fresh project.
-- See README.md "Auth setup" for the full setup walkthrough.

create extension if not exists pgcrypto;

-- Public profile, one row per authenticated user, auto-created on first sign-in.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_username text not null,
  github_avatar_url text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per challenge attempt. Multiple attempts per user/challenge are allowed
-- (attempt_number tracks retries) — the scoring formula in lib/leaderboard/score.ts
-- weights correctness against total attempts, so retries are meaningful data, not noise.
create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_slug text not null,
  is_correct boolean not null,
  time_seconds integer not null,
  attempt_number integer not null default 1,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_attempts_user_month on public.attempts(user_id, attempted_at desc);
create index if not exists idx_attempts_challenge on public.attempts(challenge_slug);
create index if not exists idx_attempts_user_challenge on public.attempts(user_id, challenge_slug);

-- Auto-create a profile row from GitHub OAuth metadata the moment a new auth.users
-- row appears — so the app never has to handle "signed in but no profile yet".
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, github_username, github_avatar_url, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username', 'reviewer'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'user_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row-level security
alter table public.profiles enable row level security;
alter table public.attempts enable row level security;

-- Profiles are readable by anyone (needed for a future public leaderboard —
-- Phase 3 — to show usernames/avatars); only the owner can update their own row.
create policy "profiles_read_all" on public.profiles
  for select using (true);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Attempts are private: users can only insert and read their own.
create policy "attempts_insert_own" on public.attempts
  for insert with check (auth.uid() = user_id);

create policy "attempts_read_own" on public.attempts
  for select using (auth.uid() = user_id);
