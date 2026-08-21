-- Run this in the Supabase SQL Editor (after schema.sql and leaderboard.sql have already been run).
--
-- "Farmers" used to mean "unlocked plot count" — that's renamed to "areas".
-- "Farmers" now means the new auto-plant/auto-harvest workers, starting at 0.

alter table public.game_saves rename column farmers to areas;
alter table public.game_saves add column farmers integer not null default 0;
