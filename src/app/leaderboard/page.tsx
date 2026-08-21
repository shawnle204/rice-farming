import { LeaderboardList } from "@/components/LeaderboardList";
import { createClient } from "@/lib/supabase/server";

interface LeaderboardRow {
  username: string;
  coins: number;
  rice: number;
  rebirths: number;
}

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const [{ data: byRice }, { data: byCoins }, { data: byRebirths }, userResult] = await Promise.all([
    supabase
      .from("leaderboard")
      .select("username, coins, rice, rebirths")
      .order("rice", { ascending: false })
      .limit(20),
    supabase
      .from("leaderboard")
      .select("username, coins, rice, rebirths")
      .order("coins", { ascending: false })
      .limit(20),
    supabase
      .from("leaderboard")
      .select("username, coins, rice, rebirths")
      .order("rebirths", { ascending: false })
      .limit(20),
    supabase.auth.getUser(),
  ]);

  let currentUsername: string | null = null;
  const user = userResult.data.user;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    currentUsername = profile?.username ?? null;
  }

  const riceEntries = ((byRice ?? []) as LeaderboardRow[]).map((row) => ({
    username: row.username,
    value: row.rice,
  }));
  const coinEntries = ((byCoins ?? []) as LeaderboardRow[]).map((row) => ({
    username: row.username,
    value: row.coins,
  }));
  const rebirthEntries = ((byRebirths ?? []) as LeaderboardRow[]).map((row) => ({
    username: row.username,
    value: row.rebirths,
  }));

  return (
    <div className="flex flex-1 flex-col items-center bg-amber-50/40 px-4 py-8 dark:bg-zinc-950 sm:px-8">
      <main className="flex w-full max-w-5xl flex-col gap-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-amber-950 dark:text-amber-100">🏆 Leaderboards</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Top rice farmers, richest players, and most rebirths, worldwide.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <LeaderboardList
            title="Most Rice"
            icon="🌾"
            unit="rice"
            entries={riceEntries}
            currentUsername={currentUsername}
          />
          <LeaderboardList
            title="Most Coins"
            icon="💰"
            unit="coins"
            entries={coinEntries}
            currentUsername={currentUsername}
          />
          <LeaderboardList
            title="Most Rebirths"
            icon="🔁"
            unit="rebirths"
            entries={rebirthEntries}
            currentUsername={currentUsername}
          />
        </div>
      </main>
    </div>
  );
}
