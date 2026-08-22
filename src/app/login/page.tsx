import Link from "next/link";
import { login } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-amber-50/40 px-4 py-12 dark:bg-zinc-950/85">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white/90 p-6 dark:border-zinc-800 dark:bg-zinc-900/90">
        <h1 className="text-2xl font-bold text-amber-950 dark:text-amber-100">Log in</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Welcome back to your farm.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </p>
        )}

        <form action={login} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              placeholder="Your password"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            Log in
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-amber-700 dark:text-amber-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
