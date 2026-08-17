-- High scores for Parachute Rescue.
-- Run this in the Supabase SQL editor (Dashboard → SQL).

create table if not exists public.high_scores (
  id bigint generated always as identity primary key,
  player_name text not null,
  score integer not null,
  game_mode text not null,
  created_at timestamptz not null default now(),
  constraint high_scores_name_len check (char_length(player_name) between 1 and 12),
  constraint high_scores_score_range check (score >= 0 and score <= 999),
  constraint high_scores_mode check (game_mode in ('A', 'B'))
);

create index if not exists high_scores_mode_score_idx
  on public.high_scores (game_mode, score desc, created_at asc);

alter table public.high_scores enable row level security;

drop policy if exists "Anyone can read high scores" on public.high_scores;
create policy "Anyone can read high scores"
  on public.high_scores
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can insert high scores" on public.high_scores;
create policy "Anyone can insert high scores"
  on public.high_scores
  for insert
  to anon, authenticated
  with check (
    char_length(player_name) between 1 and 12
    and score between 0 and 999
    and game_mode in ('A', 'B')
  );
