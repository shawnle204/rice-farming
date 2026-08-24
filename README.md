# 🌾 Rice Farm

A small idle/incremental farming game — plant rice, harvest it, sell it for coins, and reinvest in a bigger farm. Built as a full-stack side project to explore real-time-feeling game state, Supabase auth/RLS, and deterministic client-side scheduling.

**▶ [Play it live](https://rice-farming.vercel.app)** — sign up in a few seconds, no email verification required.

## For players

- **Farm the loop**: plant an empty plot, wait for it to grow, harvest it, sell the rice for coins.
- **Upgrade**: spend coins on more land (**Areas**), automated labor (**Farmers**, one per area), faster growth (**Tools**), and bigger yields (**Soil**).
- **Weather**: every 1–2 hours the whole server gets **rain** for 30 minutes — 2x growth speed for everyone, at the same time.
- **Rebirth**: once you've saved up enough coins and rice, reset your farm for a permanently bigger land cap and a rice-value bonus that stacks with every rebirth.
- **Compete**: global leaderboards for most rice, most coins, and most rebirths.
- **Make an account** to save your progress across devices, or just play as a guest (progress stays in that browser only).

## For recruiters / engineers

This is a solo full-stack project — everything from game design and database schema to auth, styling, and deployment. A few things worth a look:

- **No backend for the "live" weather event.** Rain needs to happen for every player at the same real-world moment, but there's no server process or cron job driving it. Instead, every client independently derives the exact same schedule from a fixed epoch using a seeded PRNG (`getRainStatus` in [`src/lib/economy.ts`](src/lib/economy.ts)) — deterministic, zero infrastructure, always in sync.
- **Row-Level Security as the actual security boundary.** Player data lives in Supabase Postgres behind RLS policies ([`supabase/schema.sql`](supabase/schema.sql)) — a user can only read/write their own save row, and the public leaderboard is a separate view that exposes just `username`/`coins`/`rice`/`rebirths`, keeping everything else private by construction rather than by application-level filtering.
- **Serialized writes to avoid a real race condition.** An idle-farmer tick and a manual action (like a rebirth) can both fire saves within milliseconds of each other; without care, an older network response landing after a newer one would silently revert progress. Writes are coalesced through a small queue (`flushWrite` in [`src/hooks/useGameState.ts`](src/hooks/useGameState.ts)) so at most one save is ever in flight, always carrying the latest state.
- **Manual dark mode over a live illustration.** Tailwind v4's dark variant is repointed from `prefers-color-scheme` to a class-based toggle so a user choice can override the OS setting, persisted to `localStorage` and applied before first paint to avoid a flash of the wrong theme.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) — Postgres, Auth, Row-Level Security
- Deployed on [Vercel](https://vercel.com)

## Running it locally

```bash
npm install
```

Create a Supabase project, then run [`supabase/schema.sql`](supabase/schema.sql) and [`supabase/leaderboard.sql`](supabase/leaderboard.sql) in its SQL Editor (the other `.sql` files under `supabase/` are one-off migrations from earlier schema versions and aren't needed for a fresh setup).

Add a `.env.local` with your project's API credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
