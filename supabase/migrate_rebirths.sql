-- Run this in the Supabase SQL Editor (after schema.sql, leaderboard.sql,
-- and migrate_areas_farmers.sql have already been run).

alter table public.game_saves add column rebirths integer not null default 0;

create or replace view public.leaderboard
with (security_invoker = off) as
select
  p.username,
  g.coins,
  g.rice,
  g.rebirths
from public.game_saves g
join public.profiles p on p.id = g.user_id;

grant select on public.leaderboard to anon, authenticated;
