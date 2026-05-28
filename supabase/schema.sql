-- Run in Supabase Dashboard → SQL Editor
-- Bracket submissions for World Cup 2026 Fan Bracket (static site + anon key)

create table if not exists public.brackets (
  id uuid primary key default gen_random_uuid(),
  nickname text not null unique,
  pin_hash text not null,
  payload jsonb not null default '{}'::jsonb,
  champion text,
  updated_at timestamptz not null default now()
);

create index if not exists brackets_updated_at_idx on public.brackets (updated_at desc);

comment on table public.brackets is 'Fan bracket predictions; PIN verified client-side via pin_hash';
comment on column public.brackets.pin_hash is 'SHA-256 hex digest of 4-digit PIN (see supabase-utils.js hashPin)';
comment on column public.brackets.payload is 'BracketShare v2 payload: name, gScores, kScores, kPicks, thirds';
comment on column public.brackets.champion is 'Denormalized display string for leaderboard, e.g. 🇧🇷 Brazil';

alter table public.brackets enable row level security;

-- Public read (leaderboard + ?bracket= viewer)
drop policy if exists "brackets_public_select" on public.brackets;
create policy "brackets_public_select"
  on public.brackets for select
  using (true);

-- Public insert (new nickname)
drop policy if exists "brackets_public_insert" on public.brackets;
create policy "brackets_public_insert"
  on public.brackets for insert
  with check (true);

-- Public update (PIN check is done in the browser before upsert)
drop policy if exists "brackets_public_update" on public.brackets;
create policy "brackets_public_update"
  on public.brackets for update
  using (true)
  with check (true);

-- Optional: allow upsert via insert … on conflict if your project uses separate policies
grant select, insert, update on public.brackets to anon, authenticated;
