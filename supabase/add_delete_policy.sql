-- Run this in the Supabase SQL Editor.
-- Lets a user delete their own game_saves row (self-service account cleanup) —
-- deleting it removes them from all leaderboards, since the leaderboard view
-- inner-joins profiles to game_saves.

create policy "Users can delete their own save"
  on public.game_saves for delete
  using (auth.uid() = user_id);
