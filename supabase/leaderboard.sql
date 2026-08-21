-- Run this in the Supabase SQL Editor (after schema.sql has already been run).

-- Public view exposing only what leaderboards need (username, coins, rice) —
-- game_saves itself stays locked down to each user's own row via RLS.
create view public.leaderboard
with (security_invoker = off) as
select
  p.username,
  g.coins,
  g.rice,
  g.rebirths
from public.game_saves g
join public.profiles p on p.id = g.user_id;

grant select on public.leaderboard to anon, authenticated;
