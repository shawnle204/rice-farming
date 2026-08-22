import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/server";

export async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
  }

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 sm:px-8">
      <Link href="/" className="font-semibold text-amber-950 dark:text-amber-100">
        🌾 Rice Farm
      </Link>
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/leaderboard"
          className="font-medium text-zinc-700 transition-colors hover:text-amber-700 dark:text-zinc-300 dark:hover:text-amber-400"
        >
          🏆 Leaderboard
        </Link>
        <ThemeToggle />
        {user ? (
          <>
            <span className="text-zinc-600 dark:text-zinc-400">{username ?? user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Log out
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-amber-500 px-3 py-1.5 font-medium text-white transition-colors hover:bg-amber-600"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
